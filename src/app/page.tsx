import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { ProductPreview } from "@/components/marketing/ProductPreview";
import { Faq } from "@/components/marketing/Faq";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { BrandSymbol } from "@/components/ui/Brand";
import { Aurora, StarField } from "@/components/ui/Decor";
import { Icon, type IconName } from "@/components/ui/Icon";
import { FAQ_ITEMS } from "@/lib/faq";
import { APP_PATH, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: `${SITE_NAME} — Tu mejor versión, sin ruido`,
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
};

const FEATURES: {
  icon: IconName;
  title: string;
  text: string;
  span?: string;
}[] = [
  {
    icon: "flame",
    title: "Rachas que se sienten tuyas",
    text: "Un contador que respeta tu ritmo: si un día no toca, no rompe la cadena. Vuelves y sigues donde estabas.",
    span: "span-2",
  },
  {
    icon: "stats",
    title: "Estadísticas sin ruido",
    text: "Cumplimiento a 7 y 30 días, mapa de actividad y las constelaciones de tu constancia. Solo lo que importa.",
  },
  {
    icon: "calendar",
    title: "Un historial que puedes tocar",
    text: "Abre cualquier hábito y revisa el mes día a día. Marca o desmarca el pasado sin perder el presente.",
  },
  {
    icon: "shield",
    title: "Tus datos, bajo tu control",
    text: "Tu cuenta guarda una copia privada en la nube, protegida con cifrado y Row Level Security. Exporta o borra todo cuando quieras. Sin anuncios.",
    span: "span-2",
  },
  {
    icon: "bell",
    title: "Recordatorios discretos",
    text: "Una notificación local a la hora que elijas. Nada más. Puedes apagarla en cualquier momento.",
  },
  {
    icon: "download",
    title: "Exporta cuando quieras",
    text: "Una copia JSON completa, en un clic. Importa y combina en otro dispositivo cuando te haga falta.",
  },
];

const STEPS = [
  {
    number: "01",
    title: "Crea tu cuenta",
    text: "Un email, una contraseña y un código de verificación para confirmar que eres tú. La primera vez encontrarás cuatro hábitos de ejemplo.",
  },
  {
    number: "02",
    title: "Elige algo pequeño",
    text: "Un vaso de agua, diez minutos de lectura, una caminata. Lo pequeño repetido es lo que mueve la vida.",
  },
  {
    number: "03",
    title: "Vuelve mañana",
    text: "Marca, respira y cierra. La constancia no es intensidad: es volver. Motiveva solo te recuerda quién quieres ser.",
  },
];

const PRIVACY_POINTS = [
  {
    icon: "database" as const,
    title: "Copia privada en la nube",
    text: "Cada hábito y cada marca se guardan en una copia privada asociada a tu cuenta, protegida con Row Level Security: solo tú puedes leerla.",
  },
  {
    icon: "eyeOff" as const,
    title: "Sin rastreadores",
    text: "Ni cookies de analítica, ni píxeles, ni publicidad. No sabemos cuántas personas abren la app.",
  },
  {
    icon: "trash" as const,
    title: "Borrar es borrar",
    text: "Desde Ajustes puedes eliminar todo en un clic: se vacía también la copia en la nube. Puedes exportar una copia antes, si quieres.",
  },
];

export default async function HomePage() {
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  const appJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    applicationCategory: "LifestyleApplication",
    operatingSystem: "Web",
    url: `${SITE_URL}${APP_PATH}`,
    description: SITE_DESCRIPTION,
    inLanguage: "es",
    isAccessibleForFree: true,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/icons/icon-512.png`,
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "EUR",
    },
  };

  return (
    <div className="site">
      <script
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appJsonLd) }}
      />

      <MarketingNav />

      <main id="contenido">
        <section className="hero" id="producto" aria-labelledby="hero-title">
          <StarField className="hero-stars" />
          <Aurora className="hero-aurora" />

          <div className="container hero-inner">
            <p className="eyebrow">
              <span className="eyebrow-dot" aria-hidden="true" />
              <span className="eyebrow-desktop">
                Cuenta gratuita · Sync en la nube · Sin ruido
              </span>
              <span className="eyebrow-mobile">
                Gratis · Sync privado · Sin ruido
              </span>
            </p>

            <h1 className="hero-title" id="hero-title">
              Tu mejor versión,
              <br />
              <span className="gradient-text">sin ruido.</span>
            </h1>

            <p className="hero-lede">
              Un seguidor de hábitos con tu cuenta privada: tus rachas y
              estadísticas te siguen a cualquier dispositivo. Rachas honestas,
              estadísticas claras y un lugar tranquilo para volver cada día.
            </p>

            <div className="hero-cta">
              <Link href={APP_PATH} className="btn btn-primary btn-lg">
                Empezar gratis
                <Icon name="arrowRight" size={16} />
              </Link>
              <a href="#funciones" className="btn btn-ghost btn-lg">
                Ver funciones
              </a>
            </div>

            <ul className="hero-proof">
              <li>
                <Icon name="check" size={13} /> Verificación de email incluida
              </li>
              <li>
                <Icon name="shield" size={13} /> Copia privada con RLS
              </li>
              <li>
                <Icon name="sparkle" size={13} /> Gratis para siempre
              </li>
            </ul>
          </div>

          <div className="container hero-preview">
            <ProductPreview />
          </div>

          <div className="container hero-foot">
            <span>Una app, cuatro hábitos de ejemplo y todo el tiempo del mundo.</span>
            <Link href={APP_PATH} className="text-link">
              Abrir Motiveva
              <Icon name="arrowUpRight" size={13} />
            </Link>
          </div>
        </section>

        <section className="section" id="funciones" aria-labelledby="features-title">
          <div className="container">
            <div className="section-heading">
              <p className="eyebrow">
                <span className="eyebrow-dot" aria-hidden="true" />
                Funciones
              </p>
              <h2 className="section-title" id="features-title">
                Todo lo que necesitas.
                <br />
                <span className="muted-title">Nada que te distraiga.</span>
              </h2>
              <p className="section-lede">
                Motiveva no intenta convertirte en otra persona. Te ayuda a
                sostener lo que ya decidiste, con la menor fricción posible.
              </p>
            </div>

            <div className="feature-grid">
              {FEATURES.map((feature) => (
                <article
                  key={feature.title}
                  className={`feature-card ${feature.span ?? ""}`}
                >
                  <span className="feature-icon" aria-hidden="true">
                    <Icon name={feature.icon} size={18} />
                  </span>
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-text">{feature.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section section-quiet" aria-labelledby="how-title">
          <div className="container">
            <div className="section-heading section-heading-center">
              <p className="eyebrow">
                <span className="eyebrow-dot" aria-hidden="true" />
                Cómo funciona
              </p>
              <h2 className="section-title" id="how-title">
                Tres pasos. Ninguno
                <br />
                <span className="gradient-text">te pide permiso.</span>
              </h2>
            </div>

            <ol className="step-grid">
              {STEPS.map((step) => (
                <li key={step.number} className="step-card">
                  <span className="step-number" aria-hidden="true">
                    {step.number}
                  </span>
                  <h3 className="step-title">{step.title}</h3>
                  <p className="step-text">{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="section manifesto-section" aria-label="Manifiesto">
          <div className="container">
            <figure className="manifesto">
              <Icon name="sparkle" size={20} />
              <blockquote>
                <p>
                  La constancia no es intensidad.
                  <br />
                  Es <span className="gradient-text">volver</span>.
                </p>
              </blockquote>
              <figcaption>El principio detrás de cada pantalla de Motiveva.</figcaption>
            </figure>
          </div>
        </section>

        <section className="section privacy-section" id="privacidad" aria-labelledby="privacy-title">
          <div className="container">
            <div className="privacy-panel">
              <div className="privacy-copy">
                <p className="eyebrow">
                  <span className="eyebrow-dot" aria-hidden="true" />
                  Privacidad por diseño
                </p>
                <h2 className="section-title" id="privacy-title">
                  Tus hábitos no son
                  <br />
                  <span className="gradient-text">datos nuestros.</span>
                </h2>
                <p className="section-lede">
                  Motiveva funciona con cuenta: tus hábitos se guardan en tu
                  espacio privado de la nube y, como respaldo, en tu navegador.
                  Solo tú puedes leerlos. Nunca los usamos para publicidad.
                </p>
                <Link href="/privacidad" className="btn btn-ghost">
                  Leer la política de privacidad
                  <Icon name="arrowUpRight" size={14} />
                </Link>
              </div>

              <div className="privacy-points">
                {PRIVACY_POINTS.map((point) => (
                  <div key={point.title} className="privacy-point">
                    <span className="privacy-point-icon" aria-hidden="true">
                      <Icon name={point.icon} size={17} />
                    </span>
                    <div>
                      <h3 className="privacy-point-title">{point.title}</h3>
                      <p className="privacy-point-text">{point.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="faq" aria-labelledby="faq-title">
          <div className="container faq-layout">
            <div className="faq-intro">
              <p className="eyebrow">
                <span className="eyebrow-dot" aria-hidden="true" />
                Preguntas frecuentes
              </p>
              <h2 className="section-title" id="faq-title">
                Lo que suele
                <br />
                <span className="muted-title">preguntarse.</span>
              </h2>
              <p className="section-lede">
                Si falta algo, escríbenos. Respondemos personas, no bots.
              </p>
            </div>
            <Faq />
          </div>
        </section>

        <section className="section final-cta" aria-labelledby="cta-title">
          <StarField className="cta-stars" />
          <div className="container final-cta-inner">
            <span className="final-mark">
              <BrandSymbol />
            </span>
            <h2 className="final-title" id="cta-title">
              Empieza con algo
              <br />
              <span className="gradient-text">pequeño.</span>
            </h2>
            <p className="final-lede">
              Un hábito. Un día. Solo un email para empezar: sin tarjeta, sin
              publicidad y con tus datos siempre contigo.
            </p>
            <div className="hero-cta">
              <Link href={APP_PATH} className="btn btn-primary btn-lg">
                Abrir Motiveva
                <Icon name="arrowRight" size={16} />
              </Link>
              <Link href="/privacidad" className="btn btn-ghost btn-lg">
                Cómo cuidamos tus datos
              </Link>
            </div>
            <p className="final-note">
              Gratis. Cuenta con verificación de email. Sin letra pequeña.
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
