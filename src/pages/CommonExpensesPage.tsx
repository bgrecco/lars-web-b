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
        title: "ATENCIÓN PERSONALIZADA",
        body: "Nuestro compromiso es brindar soluciones adaptadas a cada necesidad, respaldadas por trayectoria y solidez empresarial. Su edificio contará con la atención directa de dos ejecutivos, quienes los asistirán en todos sus requerimientos.",
      },
      {
        title: "RED DE ATENCIÓN ESTRATÉGICA",
        body: "Oficinas operativas estratégicamente ubicadas e interconectadas, con amplio horario de atención para brindarle más y mejores prestaciones.",
      },
      {
        title: "ASAMBLEAS",
        body: "Asistencia sin costo de sus dos ejecutivos a la asamblea anual. Confeccionamos el acta en formato digital para simplificar y agilizar su firma en la propia instancia.",
      },
      {
        title: "REUNIONES",
        body: "Reuniones presenciales o virtuales, dentro del horario de oficina, con acompañamiento ejecutivo sin costo adicional para la copropiedad.",
      },
      {
        title: "VISITAS PERSONALIZADAS",
        body: "Cuando la temática requiera presencia ejecutiva, se coordinarán visitas puntuales con los referentes de la copropiedad, sin costo adicional.",
      },
    ],
  },
  {
    title: "Gestión digital y contable bien resuelta",
    description:
      "La administración combina procesos claros, soporte profesional y visibilidad permanente para los copropietarios.",
    items: [
      {
        title: "DEPARTAMENTO CONTABLE",
        body: "Contamos con un departamento contable propio y especializado, que garantiza una gestión transparente de las obligaciones laborales (BPS, MTSS y BSE), y en lo referente al personal dependiente brindamos un servicio integral conforme a la normativa vigente.",
      },
      {
        title: "SEGUROS",
        body: "Asesoramiento y gestión integral en contratación, seguimiento y renovación de seguros.",
      },
      {
        title: "TERCERIZACIÓN",
        body: "Gestionamos la contratación de servicios bajo estricto control documental (Leyes 18.099 y 18.251), supervisando el cumplimiento legal de los distintos prestadores.",
      },
    ],
  },
  {
    title: "Operación cuidada de punta a punta",
    description:
      "Supervisamos servicios, contratos y coberturas para reducir fricciones y mantener la operación del edificio bajo control.",
    items: [
      {
        title: "REGULARIZACIÓN",
        body: "Activación de contralores internos y emisión de notificaciones extrajudiciales, orientadas a prevenir la morosidad.",
      },
      {
        title: "STAFF DE PROFESIONALES",
        body: "Contamos con un staff externo de profesionales, de modo que, si el edificio requiere asistencia específica, proporcionamos el contacto correspondiente.",
      },
    ],
  },
];

const serviceItems = serviceGroups.flatMap((group) => group.items);
const serviceItemsSplitIndex = Math.ceil(serviceItems.length / 2);

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
              <h2>Gestión integral adaptada a cada edificio</h2>
            </div>

            <div className="common-expenses-card-grid">
              {serviceItems.slice(0, serviceItemsSplitIndex).map((item, index) => (
                <ServiceItemCard key={item.title} item={item} index={index} />
              ))}
            </div>
          </div>

          <aside className="spotlight-panel common-expenses-management-visual reveal reveal-delay-2">
            <div className="spotlight-image-wrap">
              <img
                src="/rent-city.jpg"
                alt="Edificio residencial administrado por Lars"
                width="900"
                height="1292"
                fetchPriority="high"
                decoding="async"
              />
            </div>
            <div className="spotlight-body">
              <p>
                Soluciones integrales para su edificio, con atención ejecutiva personalizada y respaldo
administrativo transparente.
              </p>
            </div>
          </aside>

          <div className="common-expenses-card-grid common-expenses-card-grid-secondary">
            {serviceItems.slice(serviceItemsSplitIndex).map((item, index) => (
              <ServiceItemCard
                key={item.title}
                item={item}
                index={index + serviceItemsSplitIndex}
              />
            ))}
          </div>
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
