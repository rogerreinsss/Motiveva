import { Brand } from "@/components/ui/Brand";
import { Icon } from "@/components/ui/Icon";

const miniNav = [
  { icon: "today", label: "Hoy", active: true },
  { icon: "habits", label: "Mis hábitos", active: false },
  { icon: "stats", label: "Estadísticas", active: false },
  { icon: "settings", label: "Ajustes", active: false },
] as const;

const miniHabits = [
  { emoji: "💧", name: "Beber 2L de agua", tag: "Salud", streak: "12d", done: true },
  { emoji: "🧘", name: "Meditar 10 min", tag: "Mente", streak: "8d", done: true },
  { emoji: "🏃", name: "Ejercicio 30 min", tag: "Fitness", streak: "5d", done: false },
  { emoji: "📚", name: "Leer 20 páginas", tag: "Mente", streak: "21d", done: false },
] as const;

const heat = [
  0, 1, 0, 2, 1, 0, 0, 1, 2, 3, 2, 1, 0, 3, 2, 3, 1, 2, 1, 0, 2, 3, 3, 2, 1,
  2, 1, 0, 1, 2, 3, 1, 2, 2, 3,
];

const previewLabel =
  "Vista previa de Motiveva: panel con progreso diario del 72%, hábitos con sus rachas y un mapa de calor de constancia.";

export function ProductPreview() {
  return (
    <>
      <div className="preview-shell" role="img" aria-label={previewLabel}>
        <div className="preview-bar">
          <span className="preview-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className="preview-url">motiveva.site/app</span>
          <span className="preview-secure">
            <Icon name="lock" size={11} /> local
          </span>
        </div>

        <div className="preview-body">
          <aside className="preview-side">
            <Brand href={undefined} compact />
            <div className="preview-nav">
              {miniNav.map((item) => (
                <div
                  key={item.label}
                  className={`preview-nav-item ${item.active ? "is-active" : ""}`}
                >
                  <Icon name={item.icon} size={14} />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
            <div className="preview-side-foot">
              <span className="preview-avatar" />
              <div>
                <strong>Racha</strong>
                <span>21 días</span>
              </div>
            </div>
          </aside>

          <div className="preview-main">
            <div className="preview-top">
              <div>
                <span className="preview-eyebrow">Hoy</span>
                <span className="preview-date">Miércoles, 4 de noviembre</span>
              </div>
              <span className="preview-icon-btn">
                <Icon name="plus" size={14} />
              </span>
            </div>

            <div className="preview-hero">
              <div className="preview-ring">
                <svg viewBox="0 0 90 90" width="76" height="76" aria-hidden="true">
                  <circle className="preview-ring-bg" cx="45" cy="45" r="37" />
                  <circle
                    className="preview-ring-fill"
                    cx="45"
                    cy="45"
                    r="37"
                    strokeDasharray="232"
                    strokeDashoffset="65"
                  />
                </svg>
                <span>72%</span>
              </div>
              <div className="preview-hero-copy">
                <strong>Buenas tardes</strong>
                <span>3 de 4 hábitos completados</span>
                <div className="preview-chips">
                  <span>4 hábitos</span>
                  <span>✓ 3 hechos</span>
                </div>
              </div>
            </div>

            <div className="preview-list">
              {miniHabits.map((habit) => (
                <div
                  key={habit.name}
                  className={`preview-habit ${habit.done ? "is-done" : ""}`}
                >
                  <span className={`preview-check ${habit.done ? "is-done" : ""}`}>
                    {habit.done ? "✓" : ""}
                  </span>
                  <span className="preview-emoji">{habit.emoji}</span>
                  <div className="preview-habit-body">
                    <strong>{habit.name}</strong>
                    <span>{habit.tag} · Diario</span>
                  </div>
                  <span className="preview-streak">{habit.streak}</span>
                </div>
              ))}
            </div>
          </div>

          <aside className="preview-aside">
            <div className="preview-panel">
              <span className="preview-panel-title">Noviembre</span>
              <div className="preview-cal">
                {Array.from({ length: 28 }, (_, index) => (
                  <span
                    key={index}
                    className={
                      index === 3
                        ? "is-today"
                        : index < 3 || (index > 6 && index < 13)
                          ? "is-done"
                          : ""
                    }
                  />
                ))}
              </div>
            </div>

            <div className="preview-panel">
              <span className="preview-panel-title">Constancia</span>
              <div className="preview-heat">
                {heat.map((level, index) => (
                  <span key={index} data-level={level} />
                ))}
              </div>
              <span className="preview-panel-foot">21 días de racha</span>
            </div>

            <div className="preview-panel preview-quote">
              <Icon name="sparkle" size={14} />
              <p>“La constancia no es intensidad. Es volver.”</p>
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile-only representation: an app card, not a shrunken desktop window. */}
      <div className="preview-mobile" role="img" aria-label={previewLabel}>
        <div className="mobile-preview-top">
          <Brand href={undefined} />
          <span className="mobile-preview-date">Hoy · 4 nov</span>
        </div>

        <div className="preview-hero mobile-preview-hero">
          <div className="preview-ring mobile-preview-ring">
            <svg viewBox="0 0 90 90" width="72" height="72" aria-hidden="true">
              <circle className="preview-ring-bg" cx="45" cy="45" r="37" />
              <circle
                className="preview-ring-fill"
                cx="45"
                cy="45"
                r="37"
                strokeDasharray="232"
                strokeDashoffset="65"
              />
            </svg>
            <span>72%</span>
          </div>
          <div className="preview-hero-copy mobile-preview-copy">
            <strong>Buenas tardes</strong>
            <span>3 de 4 hábitos completados</span>
          </div>
        </div>

        <div className="preview-list mobile-preview-list">
          {miniHabits.slice(0, 3).map((habit) => (
            <div
              key={habit.name}
              className={`preview-habit mobile-preview-habit ${
                habit.done ? "is-done" : ""
              }`}
            >
              <span className={`preview-check ${habit.done ? "is-done" : ""}`}>
                {habit.done ? "✓" : ""}
              </span>
              <span className="preview-emoji">{habit.emoji}</span>
              <div className="preview-habit-body">
                <strong>{habit.name}</strong>
                <span>{habit.tag} · Diario</span>
              </div>
              <span className="preview-streak">{habit.streak}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
