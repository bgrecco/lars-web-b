import { useState } from "react";
import type { FormEvent } from "react";

type OwnerIconKind =
  | "award"
  | "bill"
  | "chart"
  | "check"
  | "clock"
  | "handCoins"
  | "home"
  | "key"
  | "scroll"
  | "shield"
  | "tools"
  | "users";

type OwnerCard = {
  title: string;
  description: string;
  icon?: OwnerIconKind;
  highlights?: string[];
};

type OwnerMetric = {
  value: string;
  label: string;
  description: string;
};

type OwnerStep = {
  number: string;
  title: string;
  description: string;
};

type OwnerTestimonial = {
  text: string;
  author: string;
  location: string;
};

const ownerMetrics: OwnerMetric[] = [
  {
    value: "+1.500",
    label: "inquilinos buscando",
    description: "Posibles inquilinos en los últimos 30 días",
  },
  {
    value: "+55",
    label: "años en el mercado",
    description: "Respaldando a propietarios desde 1971",
  },
  {
    value: "24hrs",
    label: "respuesta",
    description: "Te contactaremos a la brevedad",
  },
];

const ownerPainPoints: OwnerCard[] = [
  {
    title: "Inquilinos que no pagan",
    description:
      "Pasás todo el mes preocupado porque no te pagan el alquiler. Se atrasan con los gastos comunes, tributos domiciliarios y tenés que estar llamando, insistiendo, negociando.",
    icon: "bill",
  },
  {
    title: "Mantenimiento de la propiedad",
    description:
      "Tenés que buscar técnicos de confianza, coordinar horarios y supervisar cada reparación. Un problema que puede surgir a cualquier hora.",
    icon: "clock",
  },
  {
    title: "Propiedad desocupada por meses",
    description:
      "Hay más de 1.500 personas buscando alquilar ahora mismo, pero tu propiedad no les llega. Mientras tanto, seguís pagando gastos comunes, tributos y no generás ingresos.",
    icon: "key",
  },
  {
    title: "Trámites legales y contratos",
    description:
      "Contratos de alquiler, garantías e inventarios. Un dolor de cabeza que no sabés si está bien hecho.",
    icon: "scroll",
  },
];

const ownerServices: OwnerCard[] = [
  {
    title: "Alquilamos tu propiedad",
    description:
      "Publicamos tu propiedad en nuestras redes, nuestra web y los principales portales, coordinamos visitas y gestionamos la firma del contrato.",
    icon: "home",
  },
  {
    title: "Cobro, control y seguimiento",
    description:
      "Nos encargamos del cobro mensual y te lo depositamos el primer día hábil del mes. Controlamos tributos domiciliarios, gastos comunes y atrasos.",
    icon: "handCoins",
  },
  {
    title: "Mantenimiento",
    description:
      "Coordinamos reparaciones y supervisamos el trabajo para asegurarnos de que la propiedad quede en perfectas condiciones.",
    icon: "tools",
  },
];

const ownerSteps: OwnerStep[] = [
  {
    number: "1",
    title: "Te contactamos",
    description: "Completás el formulario y nos ponemos en contacto a la brevedad.",
  },
  {
    number: "2",
    title: "Tasación sin costo",
    description:
      "Un agente altamente capacitado concurre a la propiedad, la tasa sin costo y propone un plan de acción personalizado.",
  },
  {
    number: "3",
    title: "Firma de contrato",
    description:
      "Confeccionamos el contrato asegurando garantías que brinden al propietario mayor seguridad y respaldo.",
  },
  {
    number: "4",
    title: "Administramos tu propiedad",
    description:
      "Obtené el servicio premium, integral y serio que merece tu propiedad. Elegí Lars.",
  },
];

const ownerTestimonials: OwnerTestimonial[] = [
  {
    text:
      "Es una inmobiliaria seria, con mucha trayectoria y responsable. Uno puede hacer un contrato y tener la certeza de que no van a ser nada fuera de la norma. Recomiendo plenamente.",
    author: "Lucía R. Novellino",
    location: "Reseña en Google",
  },
  {
    text:
      "Inmobiliaria ágil, responsable y en mi experiencia siempre interesada en responder todas mis consultas. Cuando las cosas se hacen bien está bueno decirlo. Excelente servicio.",
    author: "Mauro Verdun",
    location: "Reseña en Google",
  },
  {
    text:
      "Excelente inmobiliaria. Súper profesionales, atentos y transparentes en todo el proceso. Desde el primer contacto se nota el compromiso y la seriedad con la que trabajan.",
    author: "Ismael Gradin",
    location: "Reseña en Google",
  },
];

const ownerReasons: OwnerCard[] = [
  {
    title: "Más de 55 años de seriedad",
    description:
      "Somos una empresa uruguaya posicionada en el rubro que cuenta con más de medio siglo en Uruguay. Esa trayectoria es tu respaldo.",
    icon: "award",
    highlights: [
      "Empresa uruguaya con más de medio siglo de respaldo",
      "Referentes en administración de propiedades",
      "Tu tranquilidad respaldada por experiencia",
    ],
  },
  {
    title: "Equipo profesional dedicado",
    description: "Todo para alquilar o vender tu propiedad de la mejor manera.",
    icon: "users",
    highlights: [
      "+15 funcionarios altamente capacitados",
      "Vehículos propios para cada visita",
      "Agencia de marketing dedicada",
      "Presencia activa en redes sociales",
      "2 oficinas para atenderte",
    ],
  },
  {
    title: "Servicio integral",
    description:
      "Nos encargamos de todo el proceso para que vos no tengas que preocuparte por nada.",
    icon: "check",
    highlights: [
      "Tasación sin costo",
      "Análisis de mercado",
      "Fotografía profesional",
      "Publicación en principales portales",
      "Atención personalizada",
    ],
  },
  {
    title: "Demanda real de inquilinos",
    description: "No tenés que salir a buscar inquilinos, ya los tenemos.",
    icon: "chart",
    highlights: [
      "+1.500 personas buscando en los últimos 30 días",
      "Base activa de posibles inquilinos",
      "Conexión directa con la demanda del mercado",
    ],
  },
];

function OwnerIcon(props: { kind: OwnerIconKind }) {
  const { kind } = props;

  if (kind === "award") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="8" r="5" />
        <path d="m8.8 12.1-1.4 8 4.6-2.5 4.6 2.5-1.4-8" />
      </svg>
    );
  }

  if (kind === "bill") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect width="20" height="12" x="2" y="6" rx="2" />
        <circle cx="12" cy="12" r="2" />
        <path d="M6 12h.01M18 12h.01" />
      </svg>
    );
  }

  if (kind === "chart") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
        <polyline points="16 7 22 7 22 13" />
      </svg>
    );
  }

  if (kind === "clock") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    );
  }

  if (kind === "handCoins") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M11 15h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 17" />
        <path d="m7 21 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9" />
        <path d="m2 16 6 6" />
        <circle cx="16" cy="9" r="2.9" />
        <circle cx="6" cy="5" r="3" />
      </svg>
    );
  }

  if (kind === "home") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 11.4 12 4l9 7.4" />
        <path d="M6 10.5V20h12v-9.5" />
        <path d="M10 20v-5h4v5" />
      </svg>
    );
  }

  if (kind === "key") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z" />
        <circle cx="16.5" cy="7.5" r=".5" fill="currentColor" />
      </svg>
    );
  }

  if (kind === "scroll") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M15 12h-5" />
        <path d="M15 8h-5" />
        <path d="M19 17V5a2 2 0 0 0-2-2H4" />
        <path d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3" />
      </svg>
    );
  }

  if (kind === "shield") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3 5 6v5.7c0 4.2 2.8 7.9 7 9.3 4.2-1.4 7-5.1 7-9.3V6z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    );
  }

  if (kind === "tools") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    );
  }

  if (kind === "users") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M16 20c0-2.2-1.8-4-4-4s-4 1.8-4 4" />
        <circle cx="12" cy="9" r="3" />
        <path d="M4.5 19c0-1.7 1-3.1 2.5-3.7" />
        <path d="M19.5 19c0-1.7-1-3.1-2.5-3.7" />
        <path d="M6.5 10.5a2.4 2.4 0 0 1 2-2.4" />
        <path d="M17.5 10.5a2.4 2.4 0 0 0-2-2.4" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12.4 2.4 2.4 4.8-5.6" />
    </svg>
  );
}

function QuoteIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M10.7 5.5c-2.1.5-3.7 1.5-4.8 3-1.2 1.5-1.8 3.3-1.8 5.5v4.5h6.8v-6.8H7.5c.1-1 .5-1.9 1.1-2.5.6-.7 1.5-1.1 2.6-1.4l-.5-2.3z" />
      <path d="M20 5.5c-2.1.5-3.7 1.5-4.8 3-1.2 1.5-1.8 3.3-1.8 5.5v4.5h6.8v-6.8h-3.4c.1-1 .5-1.9 1.1-2.5.6-.7 1.5-1.1 2.6-1.4L20 5.5z" />
    </svg>
  );
}

function OwnerLeadForm(props: { compact?: boolean; id?: string }) {
  const { compact = false, id } = props;
  const [status, setStatus] = useState<"idle" | "sent">("idle");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.currentTarget.reset();
    setStatus("sent");
  };

  return (
    <form className={`owners-lead-form${compact ? " owners-lead-form-compact" : ""}`} onSubmit={handleSubmit}>
      <div className="owners-form-head">
        <h2 id={id}>Quiero que alquilen y/o vendan mi propiedad</h2>
        <p>Completá el formulario y te contactamos a la brevedad.</p>
      </div>

      <fieldset className="owners-intent-group" aria-label="Qué querés hacer con tu propiedad">
        <legend>¿Qué querés hacer con tu propiedad?</legend>
        <label>
          <input type="radio" name="intent" value="vender" required />
          <span>Quiero vender mi propiedad</span>
        </label>
        <label>
          <input type="radio" name="intent" value="alquilar" />
          <span>Quiero alquilar mi propiedad</span>
        </label>
        <label>
          <input type="radio" name="intent" value="ambos" />
          <span>Ambos</span>
        </label>
      </fieldset>

      <div className="owners-form-grid">
        <label>
          <span>Tipo de propiedad</span>
          <select name="propertyType" required defaultValue="">
            <option value="" disabled>
              Seleccioná el tipo
            </option>
            <option>Apartamento</option>
            <option>Casa</option>
            <option>Oficina</option>
            <option>Local</option>
          </select>
        </label>

        <label>
          <span>Zona</span>
          <select name="zone" required defaultValue="">
            <option value="" disabled>
              Seleccioná la zona
            </option>
            <option>Montevideo</option>
            <option>Ciudad de la Costa</option>
          </select>
        </label>

        <label>
          <span>Nombre completo</span>
          <input type="text" name="fullName" placeholder="Juan Pérez" autoComplete="name" required />
        </label>

        <label>
          <span>Email</span>
          <input type="email" name="email" placeholder="tu@email.com" autoComplete="email" required />
        </label>

        <label>
          <span>Celular</span>
          <input type="tel" name="phone" placeholder="099 000 000" autoComplete="tel" required />
        </label>

        <label className="owners-form-wide">
          <span>Comentarios sobre tu propiedad</span>
          <textarea
            name="comments"
            rows={compact ? 3 : 4}
            placeholder="Ej: Apartamento de 2 dormitorios en Pocitos, actualmente desocupado..."
          />
        </label>
      </div>

      <button type="submit" className="primary-button owners-submit-button">
        Enviar
      </button>

      <p className="owners-form-note">
        {status === "sent" ? (
          "Gracias. Te contactaremos en menos de 24 horas."
        ) : (
          <>
            <OwnerIcon kind="shield" />
            <span>Tus datos están seguros. No enviamos spam.</span>
          </>
        )}
      </p>
    </form>
  );
}

function OwnerSectionHeader(props: { eyebrow?: string; title: string; description: string; inverse?: boolean }) {
  const { eyebrow, title, description, inverse = false } = props;

  return (
    <div className={`owners-section-head reveal${inverse ? " owners-section-head-inverse" : ""}`}>
      {eyebrow ? <span>{eyebrow}</span> : null}
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}

export default function PropertyAdminPage() {
  return (
    <div className="owners-page">
      <section className="owners-hero">
        <img
          src="/propietarios-hero.jpg"
          alt="Casa moderna administrada por Lars"
          className="owners-hero-image"
        />
        <div className="owners-hero-scrim" aria-hidden="true" />

        <div className="container owners-hero-layout">
          <div className="owners-hero-copy reveal">
            <h1>+1.500 personas buscan alquilar ya.</h1>
            <p>
              En los últimos 30 días, más de 1.500 posibles inquilinos buscaron propiedades con
              nosotros. Te brindamos un servicio integral desde conectarte con el futuro inquilino
              hasta publicar en los principales portales, nuestra web y redes sociales.
            </p>

            <div className="owners-metrics-grid owners-hero-metrics" aria-label="Datos del servicio">
              {ownerMetrics.map((metric, index) => (
                <article className={`owners-metric-card reveal reveal-delay-${(index % 3) + 1}`} key={metric.label}>
                  <span>{metric.value}</span>
                  <strong>{metric.label}</strong>
                  <p>{metric.description}</p>
                </article>
              ))}
            </div>
          </div>

          <aside className="owners-hero-form-card reveal reveal-delay-2" aria-labelledby="lead-form-admin">
            <OwnerLeadForm id="lead-form-admin" />
          </aside>
        </div>
      </section>

      <nav className="owners-anchor-nav" aria-label="Secciones de propietarios">
        <div className="container owners-anchor-nav-inner">
          <a href="#servicios">Servicios</a>
          <a href="#como-funciona">Cómo funciona</a>
          <a href="#testimonios">Testimonios</a>
          <a href="#lead-form-admin" className="owners-anchor-cta">
            Solicitar contacto
          </a>
        </div>
      </nav>

      <section className="owners-section owners-pain-section">
        <div className="container">
          <OwnerSectionHeader
            eyebrow="Administrar por cuenta propia"
            title="Cuando no hay respaldo, cada problema queda de tu lado"
            description="Estas son algunas de las problemáticas que enfrentan los propietarios que administran por su cuenta sus propiedades."
          />

          <div className="owners-card-grid owners-pain-grid">
            {ownerPainPoints.map((item, index) => (
              <article className={`owners-card owners-pain-card reveal reveal-delay-${(index % 4) + 1}`} key={item.title}>
                <span className="owners-card-icon">
                  <OwnerIcon kind={item.icon ?? "check"} />
                </span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>

          <div className="owners-solution-arrow reveal" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M12 5v14" />
              <path d="m19 12-7 7-7-7" />
            </svg>
          </div>

          <a className="owners-solution-card reveal" href="#lead-form-admin">
            <span>Si te identificás con alguna de estas situaciones,</span>
            <strong>tenemos la solución.</strong>
          </a>
        </div>
      </section>

      <section className="owners-section owners-services-section" id="servicios">
        <div className="container">
          <OwnerSectionHeader
            eyebrow="Servicio integral"
            title="Nos encargamos de todo"
            description="Administración de alquileres para que vos no tengas que preocuparte por nada."
          />

          <div className="owners-card-grid owners-service-grid">
            {ownerServices.map((item, index) => (
              <article className={`owners-card owners-service-card reveal reveal-delay-${(index % 3) + 1}`} key={item.title}>
                <span className="owners-card-icon owners-card-icon-dark">
                  <OwnerIcon kind={item.icon ?? "check"} />
                </span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="owners-process-section" id="como-funciona">
        <div className="container">
          <OwnerSectionHeader
            eyebrow="Proceso"
            title="¿Querés que administremos tu propiedad?"
            description="Un recorrido claro desde el primer contacto hasta la administración cotidiana."
            inverse
          />

          <div className="owners-steps-grid">
            {ownerSteps.map((step, index) => (
              <article className={`owners-step-card reveal reveal-delay-${(index % 4) + 1}`} key={step.number}>
                <span>{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="owners-section owners-testimonials-section" id="testimonios">
        <div className="container">
          <OwnerSectionHeader
            eyebrow="Experiencias"
            title="Algunas de las personas que confían en nosotros"
            description="Propietarios e inquilinos valoran la seriedad, la agilidad y el acompañamiento del equipo."
          />

          <div className="owners-testimonials-grid">
            {ownerTestimonials.map((testimonial, index) => (
              <article className={`owners-testimonial-card reveal reveal-delay-${(index % 3) + 1}`} key={testimonial.author}>
                <span className="owners-quote-mark" aria-hidden="true">
                  <QuoteIcon />
                </span>
                <blockquote>{testimonial.text}</blockquote>
                <footer>
                  <strong>{testimonial.author}</strong>
                  <span>{testimonial.location}</span>
                </footer>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="owners-section owners-why-section">
        <div className="container">
          <OwnerSectionHeader
            eyebrow="Por qué Lars"
            title="Lo que nos diferencia"
            description="Trayectoria, equipo y demanda real trabajando juntos para cuidar el valor de tu propiedad."
          />

          <div className="owners-reasons-grid">
            {ownerReasons.map((reason, index) => (
              <article className={`owners-reason-card reveal reveal-delay-${(index % 4) + 1}`} key={reason.title}>
                <div className="owners-reason-head">
                  <span className="owners-card-icon">
                    <OwnerIcon kind={reason.icon ?? "check"} />
                  </span>
                  <h3>{reason.title}</h3>
                </div>
                <p>{reason.description}</p>
                {reason.highlights ? (
                  <ul>
                    {reason.highlights.map((highlight) => (
                      <li key={highlight}>
                        <OwnerIcon kind="check" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="owners-final-section">
        <div className="container owners-final-layout">
          <div className="owners-final-copy reveal">
            <h2>Empezá a disfrutar de tu propiedad sin preocupaciones</h2>
            <p>Completá el formulario y te contactamos a la brevedad.</p>
            <div className="owners-final-badges" aria-label="Condiciones del contacto">
              <span>
                <OwnerIcon kind="check" />
                Asesoría gratuita
              </span>
              <span>
                <OwnerIcon kind="check" />
                Sin compromiso
              </span>
              <span>
                <OwnerIcon kind="check" />
                Respuesta en 24hs
              </span>
            </div>
          </div>

          <aside className="owners-final-form-card reveal reveal-delay-2">
            <OwnerLeadForm compact />
          </aside>
        </div>
      </section>
    </div>
  );
}
