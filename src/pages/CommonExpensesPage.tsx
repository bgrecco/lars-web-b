import { useEffect } from "react";

import ContactSection from "../components/ContactSection";

type ServiceItem = {
  title: string;
  body: string;
};

type ServiceGroup = {
  title: string;
  description: string;
  items: ServiceItem[];
};

type PaymentGroup = {
  title: string;
  logos: { alt: string; src: string }[];
};

const serviceGroups: ServiceGroup[] = [
  {
    title: "Atención con referentes claros",
    description:
      "Cada edificio cuenta con interlocutores reales, seguimiento continuo y acompañamiento cuando la situación lo requiere.",
    items: [
      {
        title: "Atención personalizada",
        body: "Dos ejecutivos de referencia guían el proceso y brindan soluciones adaptadas a cada copropiedad.",
      },
      {
        title: "Acompañamiento directo",
        body: "Coordinamos visitas y seguimiento individualizado para temas que necesitan una presencia más cercana.",
      },
      {
        title: "Red estratégica",
        body: "Oficinas interconectadas y amplio horario de atención para responder con mayor cobertura.",
      },
    ],
  },
  {
    title: "Gestión digital y contable bien resuelta",
    description:
      "La administración combina procesos claros, soporte profesional y visibilidad permanente para los copropietarios.",
    items: [
      {
        title: "Acceso permanente",
        body: "La liquidación mensual, la descarga, la impresión y el pago online quedan disponibles desde cualquier dispositivo.",
      },
      {
        title: "Gestión optimizada",
        body: "Procesos tecnológicos y un equipo administrativo calificado sostienen una operación minuciosa y ordenada.",
      },
      {
        title: "Departamento contable propio",
        body: "Gestionamos BPS, MTSS, BSE y la administración del personal del edificio conforme a la normativa vigente.",
      },
    ],
  },
  {
    title: "Operación cuidada de punta a punta",
    description:
      "Supervisamos servicios, contratos y coberturas para reducir fricciones y mantener la operación del edificio bajo control.",
    items: [
      {
        title: "Tercerización bajo control documental",
        body: "Monitoreamos proveedores y empresas con seguimiento estricto de cumplimiento legal y documental.",
      },
      {
        title: "Seguros",
        body: "Asesoramos en renovación, contratación y seguimiento de pólizas para asegurar la cobertura más adecuada.",
      },
      {
        title: "Staff profesional",
        body: "Cuando el edificio lo necesita, conectamos con especialistas de nuestro equipo para resolver temas puntuales.",
      },
    ],
  },
  {
    title: "Asambleas y estabilidad financiera",
    description:
      "Acompañamos la toma de decisiones y activamos mecanismos concretos para sostener la salud financiera de la copropiedad.",
    items: [
      {
        title: "Asamblea anual incluida",
        body: "Los ejecutivos asisten sin costo, labran el acta y gestionan la firma digital en la propia reunión.",
      },
      {
        title: "Reuniones extraordinarias",
        body: "Dentro del horario de oficina acompañamos instancias extraordinarias o de seguimiento específico.",
      },
      {
        title: "Gestión de impagos",
        body: "Activamos procesos extrajudiciales y articulamos asesoría legal cuando hace falta para preservar la estabilidad del edificio.",
      },
    ],
  },
];

const serviceItems = serviceGroups.flatMap((group) => group.items);

const paymentGroups: PaymentGroup[] = [
  {
    title: "Redes de cobranza",
    logos: [
      { alt: "Redpagos", src: "/ggcc/logos/redpagos.svg" },
      { alt: "Abitab", src: "/ggcc/logos/abitab.svg" },
    ],
  },
  {
    title: "Plataformas online",
    logos: [
      { alt: "BROU", src: "/ggcc/logos/brou.svg" },
      { alt: "Itaú", src: "/ggcc/logos/itau.svg" },
      { alt: "Scotiabank", src: "/ggcc/logos/scotia.svg" },
      { alt: "Santander", src: "/ggcc/logos/santander.svg" },
      { alt: "BBVA", src: "/ggcc/logos/bbva.svg" },
      { alt: "Prex", src: "/ggcc/logos/Prex.svg" },
      { alt: "Bandes", src: "/ggcc/logos/Bandes.svg" },
      { alt: "HSBC", src: "/ggcc/logos/HSBC.svg" },
      { alt: "BNA", src: "/ggcc/logos/BNA.svg" },
      { alt: "Heritage", src: "/ggcc/logos/Heritage.svg" },
    ],
  },
  {
    title: "Débito automático",
    logos: [{ alt: "BROU", src: "/ggcc/logos/brou.svg" }],
  },
];

function ServiceItemCard(props: { item: ServiceItem; index: number }) {
  const { item, index } = props;

  return (
    <article className={`common-expenses-card reveal reveal-delay-${(index % 4) + 1}`}>
      <h3>{item.title}</h3>
      <p>{item.body}</p>
    </article>
  );
}

export default function CommonExpensesPage() {
  useEffect(() => {
    const page = document.querySelector<HTMLElement>(".common-expenses-page");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (!page || reducedMotion.matches) {
      return;
    }

    let frameId = 0;

    const updateParallax = () => {
      frameId = 0;
      const pageTop = page.getBoundingClientRect().top;
      const progress = Math.min(Math.max(-pageTop, 0), 920);
      page.style.setProperty("--ggcc-parallax", `${progress}px`);
    };

    const requestUpdate = () => {
      if (frameId) {
        return;
      }

      frameId = window.requestAnimationFrame(updateParallax);
    };

    updateParallax();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }

      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      page.style.removeProperty("--ggcc-parallax");
    };
  }, []);

  return (
    <div className="common-expenses-page">
      <section className="common-expenses-hero">
        <div className="container common-expenses-hero-layout">
          <div className="common-expenses-hero-copy reveal">
            <h1>
              <span>Gastos comunes</span>
              <span>Más de medio siglo de seriedad</span>
            </h1>
          </div>
        </div>
      </section>

      <section className="common-expenses-section" id="gestion">
        <div className="container common-expenses-management-layout">
          <div className="common-expenses-management-copy">
            <div className="common-expenses-section-head reveal">
              <h2>Gestión integral pensada para cada edificio</h2>
              <p>
                Desde la atención cotidiana hasta el respaldo contable, operativo y financiero, estos
                ejes resumen cómo acompañamos la administración de gastos comunes con cercanía, control
                y criterio.
              </p>
            </div>

            <div className="common-expenses-card-grid">
              {serviceItems.map((item, index) => (
                <ServiceItemCard key={item.title} item={item} index={index} />
              ))}
            </div>
          </div>

          <aside className="spotlight-panel common-expenses-management-visual reveal reveal-delay-2">
            <div className="spotlight-image-wrap">
              <img src="/ggcc-city.png" alt="Edificio residencial administrado por Lars" />
            </div>
            <div className="spotlight-body">
              <h3>Gestión de gastos comunes con respaldo operativo</h3>
              <p>
                Administración, liquidación, medios de pago y seguimiento cotidiano en una experiencia
                clara para copropietarios y comisiones.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section className="common-expenses-payment-section" id="medios-de-pago">
        <div className="container">
          <div className="common-expenses-payment-panel reveal">
            <div className="common-expenses-payment-head">
              <h2>Medios de pago</h2>
            </div>

            <div className="common-expenses-payment-grid">
              {paymentGroups.map((group) => (
                <article
                  key={group.title}
                  className={`common-expenses-payment-card${
                    group.title === "Redes de cobranza" ? " common-expenses-payment-card-featured" : ""
                  }`}
                >
                  <h3>{group.title}</h3>
                  <div
                    className={`common-expenses-logo-grid${
                      group.title === "Plataformas online" ? " common-expenses-logo-grid-online" : ""
                    }`}
                  >
                    {group.logos.map((logo) => (
                      <span
                        key={`${group.title}-${logo.alt}`}
                        className={`common-expenses-logo-tile common-expenses-logo-tile-${logo.alt.toLowerCase()}`}
                      >
                        <img src={logo.src} alt={logo.alt} />
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>

            <div className="common-expenses-payment-note">
              <strong>Medios de pago sin costo</strong>
              <span>
                Disponible si el edificio posee una cuenta bancaria propia, caja de ahorro o cuenta corriente.
              </span>
            </div>

          </div>
        </div>
      </section>

      <ContactSection />
    </div>
  );
}
