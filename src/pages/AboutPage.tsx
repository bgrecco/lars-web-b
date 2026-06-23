import ContactSection from "../components/ContactSection";

type Pillar = {
  title: string;
  description: string;
};

const pillars: Pillar[] = [
  {
    title: "NOSOTROS",
    description:
      "Somos una empresa familiar con más de medio siglo de trayectoria, manteniéndonos a la vanguardia gracias a una visión innovadora y continuidad generacional. Nuestra seriedad, transparencia y dedicación son los pilares que han forjado una sólida reputación, merecedora del reconocimiento de clientes y del sector, brindando soluciones respaldadas por décadas de experiencia.\n\nAdemás, nuestra ética empresarial incluye ser una empresa pet-friendly y animalista, reflejando un compromiso integral que va más allá de lo comercial.",
  },
  {
    title: "SERVICIO INTEGRAL",
    description:
      "Abarcamos todas las áreas del rubro inmobiliario: Ventas, Alquileres y Administración de gastos comunes. Contamos con un capital humano de primera línea y altamente especializado.",
  },
  {
    title: "COMPROMISO",
    description:
      "Nuestro objetivo es superar las expectativas de nuestros clientes y establecer vínculos sólidos y de confianza.",
  },
  {
    title: "Red de atención estratégica",
    description:
      "Oficinas operativas estratégicamente ubicadas e interconectadas, con amplio horario de atención, para brindarle más y mejores prestaciones.",
  },
  {
    title: "VINCULACIÓN Y LIDERAZGO",
    description:
      "Como miembros activos del Colegio de Administradores de Propiedad Horizontal, como también de la Cámara Inmobiliaria del Uruguay, reafirmamos nuestro compromiso con el desarrollo responsable del rubro inmobiliario.",
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
            </div>

            <div className="about-page-pillar-grid">
              {pillars.map((pillar, index) => (
                <article key={pillar.title} className={`about-page-pillar-card reveal reveal-delay-${(index % 4) + 1}`}>
                  <h3>{pillar.title}</h3>
                  <p>{pillar.description}</p>
                </article>
              ))}
            </div>
          </div>

          <aside className="spotlight-panel about-page-pillars-visual reveal reveal-delay-2">
            <div className="spotlight-image-wrap">
              <img
                src="/optimized/sections/about-city.webp"
                alt="Ciudad y edificios gestionados por Lars"
                width="960"
                height="960"
                fetchPriority="high"
                decoding="async"
              />
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
