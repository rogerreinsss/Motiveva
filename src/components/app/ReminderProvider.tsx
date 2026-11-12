"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useHabits } from "@/components/app/HabitProvider";
import { todayKey } from "@/lib/date";
import { todayProgress } from "@/lib/habits";
import {
  NOTIF_KEY,
  REMINDER_KEY,
  REMINDER_LAST_KEY,
  readPreference,
  removePreference,
  writePreference,
} from "@/lib/storage";

const DEFAULT_REMINDER = "09:00";
const CHECK_EVERY_MS = 60_000;
const CATCH_UP_MS = 2 * 60 * 60 * 1000;
const SW_PATH = "/sw.js";
const SW_SCOPE = "/";
const SW_READY_TIMEOUT_MS = 10_000;
const REMINDER_LOCK = "motiveva-reminder";

export type ReminderPermission = NotificationPermission | "unsupported";
export type ReminderEnableResult =
  | "enabled"
  | "denied"
  | "unsupported"
  | "error";
export type ReminderTestResult = "sent" | "error" | ReminderPermission;

interface ReminderContextValue {
  enabled: boolean;
  reminderTime: string;
  permission: ReminderPermission;
  enable: () => Promise<ReminderEnableResult>;
  disable: () => void;
  setReminderTime: (value: string) => void;
  sendTest: () => Promise<ReminderTestResult>;
}

const ReminderContext = createContext<ReminderContextValue | null>(null);

function currentPermission(): ReminderPermission {
  if (
    typeof window === "undefined" ||
    !window.isSecureContext ||
    !("Notification" in window)
  ) {
    return "unsupported";
  }
  return Notification.permission;
}

/**
 * Serializes the daily send across tabs so two open tabs cannot both fire the
 * same reminder. When the Web Locks API is unavailable the in-flight guard in
 * the provider still protects the current tab.
 */
async function withReminderLock(task: () => Promise<void>): Promise<void> {
  const locks =
    typeof navigator === "undefined"
      ? undefined
      : (navigator as Navigator & { locks?: LockManager }).locks;

  if (!locks || typeof locks.request !== "function") {
    await task();
    return;
  }

  await locks.request(
    REMINDER_LOCK,
    { ifAvailable: true },
    async (lock) => {
      if (!lock) return;
      await task();
    },
  );
}

/** Waits for the service worker to activate without blocking forever. */
function waitForServiceWorkerReady(): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      reject(new Error("Service worker activation timed out"));
    }, SW_READY_TIMEOUT_MS);

    navigator.serviceWorker.ready.then(
      () => {
        window.clearTimeout(timer);
        resolve();
      },
      (error) => {
        window.clearTimeout(timer);
        reject(error);
      },
    );
  });
}

function isValidTime(value: string | null): value is string {
  return Boolean(value && /^([01]\d|2[0-3]):[0-5]\d$/.test(value));
}

function parseTime(value: string): [number, number] {
  const [rawHours, rawMinutes] = value.split(":");
  const hours = Number(rawHours);
  const minutes = Number(rawMinutes);
  if (
    !Number.isInteger(hours) ||
    hours < 0 ||
    hours > 23 ||
    !Number.isInteger(minutes) ||
    minutes < 0 ||
    minutes > 59
  ) {
    return [9, 0];
  }
  return [hours, minutes];
}

export function ReminderProvider({ children }: { children: ReactNode }) {
  const { data, hydrated: habitsHydrated } = useHabits();
  const [enabled, setEnabled] = useState(false);
  const [reminderTime, setReminderTimeState] = useState(DEFAULT_REMINDER);
  const [permission, setPermission] = useState<ReminderPermission>("default");
  const [hydrated, setHydrated] = useState(false);
  const dataRef = useRef(data);
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);
  const registrationPromiseRef = useRef<
    Promise<ServiceWorkerRegistration | null> | null
  >(null);
  const notifyInFlightRef = useRef(false);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    const storedTime = readPreference(REMINDER_KEY);
    const wantsReminder = readPreference(NOTIF_KEY) === "1";
    const permissionNow = currentPermission();

    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate from localStorage after mount
    setReminderTimeState(isValidTime(storedTime) ? storedTime : DEFAULT_REMINDER);
    setPermission(permissionNow);
    setEnabled(wantsReminder && permissionNow === "granted");

    if (wantsReminder && permissionNow !== "granted") {
      removePreference(NOTIF_KEY);
    }

    setHydrated(true);
  }, []);

  const ensureRegistration = useCallback(async () => {
    if (
      typeof navigator === "undefined" ||
      !("serviceWorker" in navigator)
    ) {
      return null;
    }

    if (registrationRef.current) return registrationRef.current;

    if (!registrationPromiseRef.current) {
      const attempt = (async () => {
        try {
          const registration = await navigator.serviceWorker.register(SW_PATH, {
            scope: SW_SCOPE,
          });
          await waitForServiceWorkerReady();
          registrationRef.current = registration;
          return registration;
        } catch {
          return null;
        }
      })();

      registrationPromiseRef.current = attempt;
      void attempt.then((registration) => {
        // Allow a retry after a failed registration instead of caching the
        // failed attempt for the rest of the session.
        if (!registration) registrationPromiseRef.current = null;
      });
    }

    return registrationPromiseRef.current;
  }, []);

  const showNotification = useCallback(
    async (title: string, options: NotificationOptions) => {
      const registration = await ensureRegistration();

      if (registration) {
        try {
          await registration.showNotification(title, options);
          return true;
        } catch {
          /* Fall back to the page Notification API below. */
        }
      }

      if (currentPermission() === "granted") {
        try {
          new Notification(title, options);
          return true;
        } catch {
          /* The browser may require a service worker for notifications. */
        }
      }

      return false;
    },
    [ensureRegistration],
  );

  const notifyDaily = useCallback(async () => {
    const progress = todayProgress(dataRef.current);
    const body =
      progress.scheduled > 0
        ? `${progress.completed}/${progress.scheduled} hábitos completados hoy.`
        : "Aún no tienes hábitos programados para hoy.";
    return showNotification("Motiveva · Tu mejor versión", {
      body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-96.png",
      tag: "motiveva-daily",
      data: { url: "/app" },
    });
  }, [showNotification]);

  const enable = useCallback(async (): Promise<ReminderEnableResult> => {
    const permissionNow = currentPermission();
    if (permissionNow === "unsupported") return "unsupported";

    let result = permissionNow;
    if (result === "default") {
      try {
        result = await Notification.requestPermission();
      } catch {
        return "error";
      }
    }

    setPermission(result);
    if (result !== "granted") return "denied";

    if (
      typeof navigator !== "undefined" &&
      "serviceWorker" in navigator
    ) {
      const registration = await ensureRegistration();
      if (!registration) return "error";
    }

    writePreference(NOTIF_KEY, "1");
    setEnabled(true);
    return "enabled";
  }, [ensureRegistration]);

  const disable = useCallback(() => {
    setEnabled(false);
    removePreference(NOTIF_KEY);
  }, []);

  const setReminderTime = useCallback((value: string) => {
    if (!isValidTime(value)) return;
    setReminderTimeState(value);
    writePreference(REMINDER_KEY, value);
  }, []);

  const sendTest = useCallback(async (): Promise<ReminderTestResult> => {
    const permissionNow = currentPermission();
    setPermission(permissionNow);
    if (permissionNow !== "granted") return permissionNow;

    const sent = await showNotification("Motiveva · Notificación de prueba", {
      body: "Todo listo: así se verá tu recordatorio diario.",
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-96.png",
      tag: "motiveva-test",
      data: { url: "/app" },
    });

    return sent ? "sent" : "error";
  }, [showNotification]);

  // Warm up the service worker as soon as reminders are enabled.
  useEffect(() => {
    if (!hydrated || !enabled) return;
    void ensureRegistration();
  }, [hydrated, enabled, ensureRegistration]);

  useEffect(() => {
    if (!hydrated || !habitsHydrated || !enabled || permission !== "granted") {
      return;
    }

    let timer = 0;
    let stopped = false;

    const maybeNotify = async () => {
      if (stopped || notifyInFlightRef.current) return;

      const now = new Date();
      const [hours, minutes] = parseTime(reminderTime);
      const target = new Date(now);
      target.setHours(hours, minutes, 0, 0);

      const lateBy = now.getTime() - target.getTime();
      if (lateBy < 0 || lateBy > CATCH_UP_MS) return;

      const day = todayKey();
      if (readPreference(REMINDER_LAST_KEY) === day) return;

      notifyInFlightRef.current = true;
      try {
        await withReminderLock(async () => {
          // Another tab may have sent it while this tab waited for the lock.
          if (stopped || readPreference(REMINDER_LAST_KEY) === day) return;

          const permissionNow = currentPermission();
          if (permissionNow !== "granted") {
            setPermission(permissionNow);
            setEnabled(false);
            removePreference(NOTIF_KEY);
            return;
          }

          const sent = await notifyDaily();
          if (sent) writePreference(REMINDER_LAST_KEY, day);
        });
      } catch {
        /* A failed attempt must not stop the scheduler. */
      } finally {
        notifyInFlightRef.current = false;
      }
    };

    const scheduleNext = () => {
      if (stopped) return;

      const now = Date.now();
      const [hours, minutes] = parseTime(reminderTime);
      const target = new Date();
      target.setHours(hours, minutes, 0, 0);
      if (target.getTime() <= now) {
        target.setDate(target.getDate() + 1);
      }

      const wait = Math.min(
        Math.max(target.getTime() - now, 1000),
        CHECK_EVERY_MS,
      );

      timer = window.setTimeout(async () => {
        try {
          await maybeNotify();
        } finally {
          scheduleNext();
        }
      }, wait);
    };

    // Evaluate immediately so reopening or reloading the app during the
    // catch-up window does not wait for the first 60 s tick.
    void maybeNotify().catch(() => {
      /* A failed attempt must not stop the scheduler. */
    });
    scheduleNext();

    const onWake = () => {
      if (document.visibilityState === "visible") {
        void maybeNotify().catch(() => {
          /* A failed attempt must not stop the scheduler. */
        });
      }
    };

    document.addEventListener("visibilitychange", onWake);
    window.addEventListener("focus", onWake);

    return () => {
      stopped = true;
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onWake);
      window.removeEventListener("focus", onWake);
    };
  }, [
    hydrated,
    habitsHydrated,
    enabled,
    permission,
    reminderTime,
    notifyDaily,
  ]);

  return (
    <ReminderContext.Provider
      value={{
        enabled,
        reminderTime,
        permission,
        enable,
        disable,
        setReminderTime,
        sendTest,
      }}
    >
      {children}
    </ReminderContext.Provider>
  );
}

export function useReminder(): ReminderContextValue {
  const context = useContext(ReminderContext);
  if (!context) {
    throw new Error("useReminder debe usarse dentro de ReminderProvider");
  }
  return context;
}
