import ContactSection from "../components/ContactSection";

type Pillar = {
  title: string;
  description: string;
};

const pillars: Pillar[] = [
  {
    title: "ACERCA DE LARS",
    description:
      "Somos una empresa familiar con más de medio siglo de trayectoria, manteniéndonos a la vanguardia gracias a una visión innovadora y continuidad generacional. Nuestra seriedad, transparencia y dedicación son pilares que han forjado una sólida reputación, reconocida por clientes y por el sector, brindando soluciones a medida respaldadas por décadas de experiencia. En coherencia con estos valores, nuestra ética empresarial incluye una política pet friendly y un compromiso animalista que trascienden lo estrictamente comercial.",
  },
  {
    title: "SERVICIO INTEGRAL",
    description:
      "Abarcamos todas las áreas del rubro inmobiliario: ventas, alquileres y administración de gastos comunes. Contamos con un capital humano de primera línea, altamente especializado.",
  },
  {
    title: "COMPROMISO",
    description:
      "Nuestro objetivo es superar las expectativas de nuestros clientes y establecer vínculos sólidos y de confianza.",
  },
  {
    title: "RED DE ATENCIÓN ESTRATÉGICA",
    description:
      "Disponemos de oficinas operativas estratégicamente ubicadas e interconectadas, con amplio horario de atención, lo que nos permite ofrecer más y mejores prestaciones, entre ellas la posibilidad de abonar en línea la liquidación de gastos comunes mediante usuario en nuestro sitio web.",
  },
  {
    title: "VINCULACIÓN Y LIDERAZGO",
    description:
      "Como miembros activos del Colegio de Administradores de Propiedad Horizontal y de la Cámara Inmobiliaria del Uruguay, reafirmamos nuestro compromiso con el desarrollo responsable del rubro inmobiliario.",
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
              <p>
                Empresa familiar con más de medio siglo de trayectoria, reconocida por su seriedad, innovación y compromiso ético que trasciende lo estrictamente comercial.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <ContactSection variant="contrast" />
    </div>
  );
}
