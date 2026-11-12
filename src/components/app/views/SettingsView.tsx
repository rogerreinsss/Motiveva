"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { useHabits } from "@/components/app/HabitProvider";
import { useProfile } from "@/components/app/ProfileProvider";
import { useToast } from "@/components/app/ToastProvider";
import { Toggle } from "@/components/app/Common";
import { useReminder } from "@/components/app/ReminderProvider";
import { useTheme, type ThemeMode } from "@/components/ThemeProvider";
import { Icon, type IconName } from "@/components/ui/Icon";
import { activeHabits } from "@/lib/habits";
import { formatDateTime, plural, todayKey } from "@/lib/date";
import { countRecords } from "@/lib/export";
import {
  MAIN_GOALS,
  MOTIVATION_MAX_LENGTH,
  NAME_MAX_LENGTH,
  type MainGoal,
} from "@/lib/profile";
import {
  MOTION_KEY,
  readPreference,
  storageSizeKb,
  writePreference,
} from "@/lib/storage";

function ProfileCard() {
  const { profile, save } = useProfile();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState(profile?.displayName ?? "");
  const [birthDate, setBirthDate] = useState(profile?.birthDate ?? "");
  const [mainGoal, setMainGoal] = useState<MainGoal | null>(
    profile?.mainGoal ?? null,
  );
  const [motivation, setMotivation] = useState(profile?.motivation ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    try {
      await save({ displayName, birthDate, mainGoal, motivation });
      toast("Perfil actualizado", "success");
    } catch (error) {
      toast(
        error instanceof Error ? error.message : "No se pudo guardar.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="settings-card">
      <div className="settings-head">
        <span className="panel-icon">
          <Icon name="user" size={16} />
        </span>
        <h2 className="settings-title">Tu perfil</h2>
      </div>

      <form className="settings-row" onSubmit={handleSave}>
        <div className="settings-copy">
          <span className="s-label">Datos personales</span>
          <span className="s-sub">
            Tu nombre, fecha de nacimiento y objetivo. Se guardan en tu cuenta
            privada.
          </span>
        </div>
        <div className="settings-inline-fields">
          <input
            type="text"
            autoComplete="given-name"
            className="form-control"
            placeholder="Tu nombre"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            maxLength={NAME_MAX_LENGTH}
            required
            aria-label="Tu nombre"
          />
          <input
            type="date"
            autoComplete="bday"
            className="form-control"
            value={birthDate}
            onChange={(event) => setBirthDate(event.target.value)}
            min="1900-01-01"
            max={todayKey()}
            required
            aria-label="Fecha de nacimiento"
          />
          <select
            className="form-control"
            value={mainGoal ?? ""}
            onChange={(event) =>
              setMainGoal((event.target.value || null) as MainGoal | null)
            }
            aria-label="Objetivo principal"
          >
            <option value="">Sin objetivo principal</option>
            {MAIN_GOALS.map((goal) => (
              <option key={goal.value} value={goal.value}>
                {goal.label}
              </option>
            ))}
          </select>
          <textarea
            className="form-control"
            placeholder="¿Qué te motiva? (opcional)"
            value={motivation}
            onChange={(event) => setMotivation(event.target.value)}
            maxLength={MOTIVATION_MAX_LENGTH}
            rows={3}
            aria-label="Qué te motiva"
          />
          <button type="submit" className="btn btn-ghost" disabled={saving}>
            {saving ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </form>
    </section>
  );
}

function SecurityCard() {
  const { user, updatePassword, changeEmail, resendEmailOtp } = useAuth();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [changingEmail, setChangingEmail] = useState(false);
  const [resending, setResending] = useState(false);

  const email = user?.email ?? "";
  const verified = user?.email_confirmed_at != null;
  const provider = user?.app_metadata?.provider ?? "email";

  async function handlePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password.length < 10) {
      toast("La contraseña debe tener al menos 10 caracteres", "error");
      return;
    }
    if (password !== confirm) {
      toast("Las contraseñas no coinciden", "error");
      return;
    }

    setChangingPassword(true);
    const error = await updatePassword(password);
    setChangingPassword(false);

    if (error) {
      toast(error, "error");
      return;
    }

    setPassword("");
    setConfirm("");
    toast("Contraseña actualizada. Se han cerrado tus otras sesiones.", "success");
  }

  async function handleEmail(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const clean = newEmail.trim();
    if (!clean || clean === email) {
      toast("Escribe un email nuevo distinto del actual", "error");
      return;
    }

    setChangingEmail(true);
    const result = await changeEmail(clean);
    setChangingEmail(false);

    if (result.error) {
      toast(result.error, "error");
      return;
    }

    setNewEmail("");
    toast(
      result.needsConfirmation
        ? "Te hemos enviado un código al email nuevo. Confírmalo para completar el cambio."
        : "Email actualizado.",
      "success",
    );
  }

  async function handleResend() {
    setResending(true);
    const error = await resendEmailOtp(email);
    setResending(false);
    toast(
      error ?? "Enviamos un código nuevo a tu correo.",
      error ? "error" : "success",
    );
  }

  return (
    <section className="settings-card">
      <div className="settings-head">
        <span className="panel-icon">
          <Icon name="shield" size={16} />
        </span>
        <h2 className="settings-title">Seguridad de la cuenta</h2>
      </div>

      <div className="settings-row">
        <div className="settings-copy">
          <span className="s-label">Email</span>
          <span className="s-sub">
            {email}
            {verified ? " · verificado" : " · pendiente de verificar"}
          </span>
        </div>
        {!verified && provider === "email" && (
          <button
            type="button"
            className="btn btn-ghost"
            disabled={resending}
            onClick={() => void handleResend()}
          >
            {resending ? "Enviando…" : "Reenviar código"}
          </button>
        )}
        {verified && (
          <span className="status-dot" title="Email verificado" />
        )}
      </div>

      {provider === "email" && (
        <>
          <form className="settings-row" onSubmit={handlePassword}>
            <div className="settings-copy">
              <span className="s-label">Cambiar contraseña</span>
              <span className="s-sub">
                Mínimo 10 caracteres. Se cerrarán tus otras sesiones.
              </span>
            </div>
            <div className="settings-inline-fields">
              <input
                type="password"
                autoComplete="new-password"
                className="form-control"
                placeholder="Contraseña nueva"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={10}
                required
                aria-label="Contraseña nueva"
              />
              <input
                type="password"
                autoComplete="new-password"
                className="form-control"
                placeholder="Repite la contraseña"
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                minLength={10}
                required
                aria-label="Repite la nueva contraseña"
              />
              <button
                type="submit"
                className="btn btn-ghost"
                disabled={changingPassword}
              >
                {changingPassword ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </form>

          <form className="settings-row" onSubmit={handleEmail}>
            <div className="settings-copy">
              <span className="s-label">Cambiar email</span>
              <span className="s-sub">
                Recibirás un código en el email nuevo para confirmar el cambio.
              </span>
            </div>
            <div className="settings-inline-fields">
              <input
                type="email"
                autoComplete="email"
                inputMode="email"
                className="form-control"
                placeholder="nuevo@email.com"
                value={newEmail}
                onChange={(event) => setNewEmail(event.target.value)}
                required
                aria-label="Email nuevo"
              />
              <button
                type="submit"
                className="btn btn-ghost"
                disabled={changingEmail}
              >
                {changingEmail ? "Enviando…" : "Cambiar"}
              </button>
            </div>
          </form>
        </>
      )}

      {provider !== "email" && (
        <div className="settings-row">
          <div className="settings-copy">
            <span className="s-label">Acceso con {provider}</span>
            <span className="s-sub">
              Tu cuenta usa {provider}; la contraseña se gestiona con ese
              servicio.
            </span>
          </div>
        </div>
      )}
    </section>
  );
}

const THEME_OPTIONS: { value: ThemeMode; label: string; icon: IconName }[] = [
  { value: "light", label: "Claro", icon: "sun" },
  { value: "dark", label: "Oscuro", icon: "moon" },
  { value: "system", label: "Sistema", icon: "monitor" },
];

interface SettingsViewProps {
  onImport: () => void;
}

export function SettingsView({ onImport }: SettingsViewProps) {
  const { data, lastExport, storageError, exportAll, resetAll, syncStatus } =
    useHabits();
  const { user, configured, signOut } = useAuth();
  const { toast } = useToast();
  const { mode: themeMode, setMode: setThemeMode } = useTheme();
  const {
    enabled: notifications,
    reminderTime: reminder,
    enable: enableReminder,
    disable: disableReminder,
    setReminderTime: changeReminder,
    sendTest,
  } = useReminder();
  const [reducedMotion, setReducedMotion] = useState(false);
  const [resetArmed, setResetArmed] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- preference hydrate from localStorage after mount
    setReducedMotion(readPreference(MOTION_KEY) === "1");
  }, []);

  useEffect(() => {
    document.documentElement.dataset.motion = reducedMotion ? "reduced" : "full";
  }, [reducedMotion]);

  useEffect(() => {
    if (!resetArmed) return;
    const timer = window.setTimeout(() => setResetArmed(false), 6000);
    return () => window.clearTimeout(timer);
  }, [resetArmed]);

  async function handleNotificationToggle(next: boolean) {
    if (!next) {
      disableReminder();
      toast("Recordatorios desactivados", "info");
      return;
    }

    const result = await enableReminder();
    if (result === "enabled") {
      toast("Recordatorio diario activado", "success");
    } else if (result === "denied") {
      toast("Permiso de notificaciones denegado", "warning");
    } else if (result === "unsupported") {
      toast("Este navegador no admite notificaciones", "error");
    } else {
      toast("No se pudo activar el recordatorio", "error");
    }
  }

  async function handleTestNotification() {
    const result = await sendTest();

    if (result === "sent") {
      toast("Notificación de prueba enviada", "success");
    } else if (result === "unsupported") {
      toast("Este navegador no admite notificaciones", "error");
    } else if (result === "denied") {
      toast(
        "El permiso de notificaciones está bloqueado en el navegador",
        "warning",
      );
    } else if (result === "default") {
      toast(
        "Activa el recordatorio para conceder permiso de notificaciones",
        "warning",
      );
    } else {
      toast(
        "No se pudo enviar. Revisa el permiso de notificaciones del navegador.",
        "error",
      );
    }
  }

  function toggleMotion(next: boolean) {
    setReducedMotion(next);
    writePreference(MOTION_KEY, next ? "1" : "0");
  }

  const active = activeHabits(data);
  const archivedCount = data.habits.length - active.length;
  const sizeKb = storageSizeKb(data).toFixed(1);
  const records = countRecords(data);
  const syncLabel = !user
    ? "Solo en este dispositivo"
    : syncStatus === "synced"
      ? "Sincronizado en la nube"
      : syncStatus === "syncing"
        ? "Sincronizando cambios…"
        : syncStatus === "error"
          ? "No se pudo sincronizar. Tus datos siguen en este dispositivo."
          : "Cuenta conectada";

  return (
    <div className="view settings-view">
      <h1 className="sr-only">Ajustes</h1>

      {storageError && (
        <div className="alert-banner" role="alert">
          <Icon name="alert" size={16} />
          <span>
            No se pudo guardar en este navegador. Puede que el almacenamiento
            esté lleno o bloqueado. Exporta una copia de tus datos.
          </span>
        </div>
      )}

      <ProfileCard />

      <section className="settings-card">
        <div className="settings-head">
          <span className="panel-icon">
            <Icon name="shield" size={16} />
          </span>
          <h2 className="settings-title">Cuenta y sincronización</h2>
        </div>

        {!configured ? (
          <div className="settings-row">
            <div className="settings-copy">
              <span className="s-label">Sincronización no disponible</span>
              <span className="s-sub">
                La autenticación no está configurada en este entorno.
              </span>
            </div>
          </div>
        ) : user ? (
          <>
            <div className="settings-row">
              <div className="settings-copy">
                <span className="s-label">{user.email}</span>
                <span className="s-sub">{syncLabel}</span>
              </div>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => void signOut()}
              >
                Cerrar sesión
              </button>
            </div>

            <div className="settings-row">
              <div className="settings-copy">
                <span className="s-label">Copia en la nube</span>
                <span className="s-sub">
                  Tus cambios se guardan en tu cuenta privada y se cargan al
                  iniciar sesión en otro dispositivo.
                </span>
              </div>
              <span
                className={`status-dot ${syncStatus === "error" ? "is-error" : ""}`}
                title={syncLabel}
              />
            </div>
          </>
        ) : null}
      </section>

      <SecurityCard />

      <section className="settings-card">
        <div className="settings-head">
          <span className="panel-icon">
            <Icon name="bell" size={16} />
          </span>
          <h2 className="settings-title">Recordatorios</h2>
        </div>

        <div className="settings-row">
          <div className="settings-copy">
            <span className="s-label">Recordatorio diario</span>
            <span className="s-sub">
              Notificación local del navegador. Se envía con Motiveva abierta,
              aunque esté en segundo plano. Nada se envía a un servidor.
            </span>
          </div>
          <Toggle
            checked={notifications}
            onChange={handleNotificationToggle}
            label="Activar recordatorio diario"
          />
        </div>

        <div className="settings-row">
          <div className="settings-copy">
            <span className="s-label">Hora del recordatorio</span>
            <span className="s-sub">
              {notifications
                ? "Te avisaremos a esta hora, en tu zona horaria."
                : "Activa el recordatorio para elegir la hora."}
            </span>
          </div>
          <input
            type="time"
            className="form-control time-input"
            value={reminder}
            disabled={!notifications}
            onChange={(event) => changeReminder(event.target.value)}
            aria-label="Hora del recordatorio"
          />
        </div>

        <div className="settings-row">
          <div className="settings-copy">
            <span className="s-label">Comprobar notificación</span>
            <span className="s-sub">
              Envía una notificación ahora para verificar el permiso. Si no
              aparece, revisa los avisos del sistema.
            </span>
          </div>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={handleTestNotification}
          >
            Enviar prueba
          </button>
        </div>
      </section>

      <section className="settings-card">
        <div className="settings-head">
          <span className="panel-icon">
            <Icon name="sun" size={16} />
          </span>
          <h2 className="settings-title">Apariencia</h2>
        </div>

        <div className="settings-row settings-row-theme">
          <div className="settings-copy">
            <span className="s-label">Tema de la interfaz</span>
            <span className="s-sub">
              Elige un tema claro u oscuro, o sigue la configuración de tu
              dispositivo.
            </span>
          </div>
          <div
            className="theme-options"
            role="group"
            aria-label="Tema de la interfaz"
          >
            {THEME_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`theme-option${
                  themeMode === option.value ? " is-active" : ""
                }`}
                aria-pressed={themeMode === option.value}
                onClick={() => setThemeMode(option.value)}
              >
                <Icon name={option.icon} size={15} />
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="settings-card">
        <div className="settings-head">
          <span className="panel-icon">
            <Icon name="eyeOff" size={16} />
          </span>
          <h2 className="settings-title">Accesibilidad</h2>
        </div>

        <div className="settings-row">
          <div className="settings-copy">
            <span className="s-label">Reducir movimiento</span>
            <span className="s-sub">
              Desactiva las transiciones y el pulso de la interfaz.
            </span>
          </div>
          <Toggle
            checked={reducedMotion}
            onChange={toggleMotion}
            label="Reducir movimiento"
          />
        </div>
      </section>

      <section className="settings-card">
        <div className="settings-head">
          <span className="panel-icon">
            <Icon name="database" size={16} />
          </span>
          <h2 className="settings-title">Tus datos</h2>
        </div>

        <div className="settings-row">
          <div className="settings-copy">
            <span className="s-label">Exportar datos</span>
            <span className="s-sub">Descarga una copia completa en JSON.</span>
          </div>
          <button type="button" className="btn btn-ghost" onClick={exportAll}>
            <Icon name="download" size={15} />
            Exportar
          </button>
        </div>

        <div className="settings-row">
          <div className="settings-copy">
            <span className="s-label">Importar datos</span>
            <span className="s-sub">
              Restaura una copia o combínala con lo que ya tienes.
            </span>
          </div>
          <button type="button" className="btn btn-ghost" onClick={onImport}>
            <Icon name="upload" size={15} />
            Importar
          </button>
        </div>

        <div className="settings-row settings-row-reset">
          <div className="settings-copy">
            <span className="s-label">Resetear todo</span>
            <span className="s-sub">
              Elimina hábitos, historial y preferencias de este dispositivo y de
              tu cuenta.
            </span>
          </div>

          {resetArmed ? (
            <div className="reset-confirm">
              <span>¿Borrar todo?</span>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setResetArmed(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={() => {
                  setResetArmed(false);
                  resetAll();
                }}
              >
                Sí, borrar
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="btn btn-danger-soft"
              onClick={() => setResetArmed(true)}
            >
              <Icon name="trash" size={15} />
              Resetear
            </button>
          )}
        </div>
      </section>

      <section className="settings-card">
        <div className="settings-head">
          <span className="panel-icon">
            <Icon name="device" size={16} />
          </span>
          <h2 className="settings-title">Almacenamiento</h2>
        </div>

        <div className="settings-row">
          <div className="settings-copy">
            <span className="s-label">Uso local</span>
            <span className="s-sub">
              {sizeKb} KB · {plural(active.length, "activo", "activos")}
              {archivedCount > 0
                ? ` · ${plural(archivedCount, "archivado", "archivados")}`
                : ""}{" "}
              · {plural(records, "registro", "registros")}
            </span>
          </div>
          <span className="status-dot" title="Guardado en este dispositivo" />
        </div>

        <div className="settings-row">
          <div className="settings-copy">
            <span className="s-label">Última exportación</span>
            <span className="s-sub">
              {lastExport ? formatDateTime(lastExport) : "Nunca"}
            </span>
          </div>
        </div>
      </section>

      <section className="settings-card">
        <div className="settings-head">
          <span className="panel-icon">
            <Icon name="keyboard" size={16} />
          </span>
          <h2 className="settings-title">Atajos de teclado</h2>
        </div>

        <div className="settings-row settings-row-shortcuts">
          <div className="kbd-list">
            <span>
              <kbd>Ctrl</kbd>
              <kbd>K</kbd> Buscar
            </span>
            <span>
              <kbd>N</kbd> Nuevo
            </span>
            <span>
              <kbd>T</kbd> Hoy
            </span>
            <span>
              <kbd>H</kbd> Hábitos
            </span>
            <span>
              <kbd>S</kbd> Estadísticas
            </span>
            <span>
              <kbd>,</kbd> Ajustes
            </span>
          </div>
        </div>
      </section>

      <section className="settings-card settings-privacy">
        <span className="settings-privacy-icon">
          <Icon name="shield" size={18} />
        </span>
        <div>
          <h2 className="s-label">Privacidad por diseño</h2>
          <p className="s-sub">
            Tus hábitos se guardan en una copia privada de tu cuenta y, como
            respaldo offline, en el almacenamiento local de tu navegador. No hay
            cookies de seguimiento ni publicidad.{" "}
            <Link href="/privacidad" className="text-link">
              Leer la política de privacidad
              <Icon name="arrowUpRight" size={13} />
            </Link>
          </p>
          <p className="s-sub settings-version">
            Motiveva · versión 1.0 · cuenta obligatoria con sync en la nube
          </p>
        </div>
      </section>
    </div>
  );
}
