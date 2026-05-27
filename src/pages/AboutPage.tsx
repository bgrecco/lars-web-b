import ContactSection from "../components/ContactSection";

type Pillar = {
  title: string;
  description: string;
};

const pillars: Pillar[] = [
  {
    title: "Servicio integral con mirada actual",
    description:
      "Brindamos administración de gastos comunes, ventas, alquileres y administración de propiedades con un equipo especializado y foco real en cada necesidad.",
  },
  {
    title: "Atención personalizada",
    description:
      "Acompañamos procesos personales y empresariales con una forma de trabajo cercana, resolutiva y presente en cada etapa.",
  },
  {
    title: "Compromiso que construye vínculos",
    description:
      "Buscamos superar expectativas y sostener relaciones de confianza con la misma seriedad y transparencia que definieron la historia de Lars.",
  },
  {
    title: "Inmediatez sin perder calidez",
    description:
      "Contamos con diversas vías de comunicación para responder con agilidad y acompañar con criterio, no solo con velocidad.",
  },
  {
    title: "Red de atención estratégica",
    description:
      "Nuestras oficinas operativas están conectadas para dar más cobertura, mejor disponibilidad y una experiencia de atención más sólida.",
  },
  {
    title: "Vinculación y liderazgo",
    description:
      "La participación activa en el Colegio de Administradores de Propiedad Horizontal y en la Cámara Inmobiliaria del Uruguay refuerza nuestro compromiso con el rubro.",
  },
];

const closingPillars: Pillar[] = [
  {
    title: "Compromiso que también es humano",
    description:
      "La ética empresarial de Lars incluye una mirada pet-friendly y animalista, como parte de una forma de vincularnos que pone en valor el cuidado y la sensibilidad.",
  },
  {
    title: "Presencia activa en los espacios que mueven al sector",
    description:
      "Reforzamos nuestro compromiso profesional participando en instituciones clave del rubro inmobiliario y de administración de propiedad horizontal.",
  },
];

export default function AboutPage() {
  return (
    <div className="about-page">
      <section className="about-page-section" id="pilares-lars">
        <div className="container about-page-pillars-layout">
          <div className="about-page-pillars-copy">
            <div className="about-page-section-head reveal">
              <h2>Los pilares que sostienen la experiencia Lars</h2>
              <p>
                De la atención personalizada al compromiso con el sector, esta sección resume la forma
                en que trabajamos: servicio integral, cercanía, respuesta ágil, cobertura y confianza
                construida en el tiempo.
              </p>
            </div>

            <div className="about-page-pillar-grid">
              {pillars.map((pillar, index) => (
                <article key={pillar.title} className={`about-page-pillar-card reveal reveal-delay-${(index % 4) + 1}`}>
                  <h3>{pillar.title}</h3>
                  <p>{pillar.description}</p>
                </article>
              ))}
              {closingPillars.map((pillar) => (
                <article key={pillar.title} className="about-page-pillar-card about-page-pillar-card-featured">
                  <h3>{pillar.title}</h3>
                  <p>{pillar.description}</p>
                </article>
              ))}
            </div>
          </div>

          <aside className="spotlight-panel about-page-pillars-visual reveal reveal-delay-2">
            <div className="spotlight-image-wrap">
              <img src="/about/about-city.png" alt="Ciudad y edificios gestionados por Lars" />
            </div>
            <div className="spotlight-body">
              <h3>Servicio integral con mirada actual y una forma de trabajo cercana</h3>
              <p>
                Brindamos administración de gastos comunes, ventas, alquileres y administración
                de propiedades con un equipo especializado, foco real en cada necesidad y una
                experiencia más clara para el cliente.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <ContactSection variant="contrast" />
    </div>
  );
}
