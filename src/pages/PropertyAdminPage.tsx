import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { FormEvent, PointerEvent } from "react";

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
  value: string[];
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

const showOwnerPainSection = false;
const showOwnerServicesSection = false;
const showOwnerProcessSection = false;
const showOwnerReasonsSection = false;
const showOwnerFinalSection = false;
const showOwnerAnchorNav = false;
const ownerTestimonialRotationMs = 11000;
const ownerTestimonialTransitionMs = 1600;
const ownerMetricRotationMs = 7000;
const ownerMetricTransitionMs = 900;
const larsFoundingYear = 1969;

const ownerMetrics: OwnerMetric[] = [
  {
    value: ["2", "oficinas"],
  },
  
  {
    value: ["+ 40", "funcionarios"],
  },
  {
    value: [`${new Date().getFullYear() - larsFoundingYear} años`, "de trayectoria"],
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
      "Excelente inmobiliaria. Súper profesionales, atentos y transparentes en todo el proceso. Desde el primer contacto se nota el compromiso y la seriedad con la que trabajan.",
    author: "Ismael Gradin",
    location: "Reseña en Google",
  },
  {
    text:
      "Excelente atención y muy buena disposición. Se nota el compromiso y la seriedad con la que trabajan. Súper recomendable ❤️",
    author: "Kati Cusmanich",
    location: "Reseña en Google",
  },
  {
    text:
      "Responden las consultas a tiempo, se interesan por ayudarte a encontrar el tipo de propiedad que estás buscando y resolver cualquier inconveniente que pueda surgir.",
    author: "Sara Rivero Villalba",
    location: "Reseña en Google",
  },
  {
    text: "Excelente servicio.",
    author: "Maria Etchegoyen",
    location: "Reseña en Google",
  },
  {
    text: "Brindan el mejor asesoramiento, me encantó el trato y la amabilidad, los recomiendo 100%.",
    author: "Matias Pellejero",
    location: "Reseña en Google",
  },
  {
    text: "Excelente atención.",
    author: "Eliz Partamian",
    location: "Reseña en Google",
  },
  {
    text:
      "Muy buena atención. El personal es muy amable y se esfuerzan al máximo por resolver cualquier situación. Totalmente recomendable.",
    author: "Melany Baldivieso",
    location: "Reseña en Google",
  },
  {
    text: "Muy bueno todo, una empresa muy confiable y segura.",
    author: "André Souberbielle",
    location: "Reseña en Google",
  },
  {
    text:
      "Excelente servicio. Muy recomendable y seria. Viví 12 años en Montevideo y siempre alquilé en Lars.",
    author: "Antonella Escobilla Borges",
    location: "Reseña en Google",
  },
  {
    text:
      "Inmobiliaria ágil, responsable y en mi experiencia siempre interesada en responder todas mis consultas. Cuando las cosas se hacen bien está bueno decirlo. Excelente servicio 💪🏼",
    author: "Mauro Verdun",
    location: "Reseña en Google",
  },
  {
    text:
      "Es una inmobiliaria seria, con mucha trayectoria y responsable. Uno puede hacer un contrato y tener la certeza de que no van a ser nada fuera de la norma. Recomiendo plenamente.",
    author: "Lucía R. Novellino",
    location: "Reseña en Google",
  },
  {
    text:
      "La verdad, excelente atención por parte de la Sra. Andrea, muy amable y pudo resolver todas mis dudas. Muchas gracias.",
    author: "Magali Mora",
    location: "Reseña en Google",
  },
  {
    text:
      "Excelente amabilidad del personal. Como empresa, siempre atentos y solucionando los problemas referente a las propiedades.",
    author: "Maria Reyes",
    location: "Reseña en Google",
  },
  {
    text:
      "Muy amable atención por parte de Andrea, mostrando opciones con seriedad, cordialidad y con su singular simpatía. Gracias.",
    author: "Rossana Méndez",
    location: "Reseña en Google",
  },
  {
    text:
      "En Lars todos sus trabajadores son respetuosos y con muy buena actitud para solucionar los temas vinculados a ventas y alquileres.",
    author: "Maria del Rosario Fernandez",
    location: "Reseña en Google",
  },
  {
    text: "Seriedad. Responsabilidad. Rapidez.",
    author: "Gabriel Mendez",
    location: "Reseña en Google",
  },
  {
    text: "Siempre atentos a los requerimientos solicitados. Excelente.",
    author: "Schubert Anandez",
    location: "Reseña en Google",
  },
  {
    text:
      "Lar's, excelente servicio. Muchos años administrando nuestro edificio, más de 20. Muy agradecida con Christian y Patricia, que siempre están a la orden, súper expeditivos y atentos.",
    author: "Nilsa Marquez",
    location: "Reseña en Google",
  },
  {
    text:
      "Inmobiliaria con gran trayectoria en el mercado. Siempre dispuestos a encontrar una solución a tus necesidades.",
    author: "Estela Imhof",
    location: "Reseña en Google",
  },
  {
    text: "Excelente servicio y atención.",
    author: "Alexis Bellati",
    location: "Reseña en Google",
  },
  {
    text: "Excelente, siempre me solucionan todo.",
    author: "Kari Nuñez",
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

function TestimonialAuthor(props: { author: string }) {
  const { author } = props;
  const authorRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const element = authorRef.current;

    if (!element) {
      return;
    }

    const resizeToFit = () => {
      const computedStyles = window.getComputedStyle(element);
      const rootFontSize = Number.parseFloat(
        window.getComputedStyle(document.documentElement).fontSize,
      );
      const resolveLengthToPx = (value: string, fallback: number) => {
        const trimmedValue = value.trim();
        const parsedValue = Number.parseFloat(trimmedValue);

        if (Number.isNaN(parsedValue)) {
          return fallback;
        }

        if (trimmedValue.endsWith("rem")) {
          return parsedValue * rootFontSize;
        }

        if (trimmedValue.endsWith("em")) {
          return parsedValue * fallback;
        }

        return parsedValue;
      };
      const baseSize =
        resolveLengthToPx(
          computedStyles.getPropertyValue("--owners-testimonial-author-font-size"),
          Number.parseFloat(computedStyles.fontSize),
        ) || Number.parseFloat(computedStyles.fontSize);
      const minSize =
        resolveLengthToPx(
          computedStyles.getPropertyValue("--owners-testimonial-author-min-font-size"),
          baseSize * 0.72,
        ) ||
        baseSize * 0.72;

      element.style.fontSize = `${baseSize}px`;

      let nextSize = baseSize;

      while (element.scrollWidth > element.clientWidth && nextSize > minSize) {
        nextSize = Math.max(minSize, nextSize - 0.25);
        element.style.fontSize = `${nextSize}px`;
      }
    };

    resizeToFit();

    const resizeObserver = new ResizeObserver(resizeToFit);
    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, [author]);

  return (
    <strong ref={authorRef} className="owners-testimonial-author">
      {author}
    </strong>
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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.currentTarget.reset();
  };

  return (
    <form className={`owners-lead-form${compact ? " owners-lead-form-compact" : ""}`} onSubmit={handleSubmit}>
      <div className="owners-form-head">
        <h2 id={id}>Quiero alquilar o vender mi propiedad</h2>
      </div>

      <div className="owners-form-grid">
        <label className="owners-form-span-3">
          <span className="sr-only">Tipo de propiedad</span>
          <select name="propertyType" aria-label="Tipo de propiedad" required defaultValue="">
            <option value="" disabled>
              Tipo de propiedad
            </option>
            <option>Apartamento</option>
            <option>Casa</option>
            <option>Oficina</option>
            <option>Local</option>
          </select>
        </label>

        <label className="owners-form-span-3">
          <span className="sr-only">Zona</span>
          <select name="zone" aria-label="Zona" required defaultValue="">
            <option value="" disabled>
              Zona
            </option>
            <option>Montevideo</option>
            <option>Ciudad de la Costa</option>
          </select>
        </label>

        <label className="owners-form-span-4">
          <span className="sr-only">Nombre</span>
          <input type="text" name="fullName" placeholder="Nombre" aria-label="Nombre" autoComplete="name" required />
        </label>

        <label className="owners-form-span-2">
          <span className="sr-only">Celular</span>
          <input type="tel" name="phone" placeholder="Celular" aria-label="Celular" autoComplete="tel" required />
        </label>

        <label className="owners-form-wide">
          <span className="sr-only">Email</span>
          <input type="email" name="email" placeholder="Email" aria-label="Email" autoComplete="email" required />
        </label>

        <label className="owners-form-wide">
          <span className="sr-only">Comentarios</span>
          <textarea
            name="comments"
            rows={compact ? 3 : 4}
            placeholder="Comentarios"
            aria-label="Comentarios"
          />
        </label>
      </div>

      <button type="submit" className="primary-button owners-submit-button">
        Enviar
      </button>
    </form>
  );
}

function OwnerSectionHeader(props: { title: string; description: string; inverse?: boolean }) {
  const { title, description, inverse = false } = props;

  return (
    <div className={`owners-section-head reveal${inverse ? " owners-section-head-inverse" : ""}`}>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}

type PropertyAdminPageProps = {
  variant?: "page" | "home-section";
};

export default function PropertyAdminPage({ variant = "page" }: PropertyAdminPageProps) {
  const isHomeSection = variant === "home-section";
  const [isAnchorNavCondensed, setIsAnchorNavCondensed] = useState(false);
  const [isMobileTestimonials, setIsMobileTestimonials] = useState(false);
  const [metricRotationPage, setMetricRotationPage] = useState(0);
  const [outgoingMetricRotationPage, setOutgoingMetricRotationPage] = useState<number | null>(null);
  const [metricTransitionDirection, setMetricTransitionDirection] = useState<"next" | "previous">("next");
  const [testimonialRotationPage, setTestimonialRotationPage] = useState(0);
  const [outgoingTestimonialRotationPage, setOutgoingTestimonialRotationPage] = useState<number | null>(null);
  const [testimonialTransitionDirection, setTestimonialTransitionDirection] = useState<"next" | "previous">("next");
  const testimonialSwipeStartX = useRef<number | null>(null);
  const visibleMetricCount = Math.min(isMobileTestimonials ? 1 : 3, ownerMetrics.length);
  const metricPageCount = visibleMetricCount === 0 ? 0 : Math.ceil(ownerMetrics.length / visibleMetricCount);
  const visibleTestimonialCount = Math.min(isMobileTestimonials ? 1 : 3, ownerTestimonials.length);
  const testimonialPageCount =
    visibleTestimonialCount === 0 ? 0 : Math.ceil(ownerTestimonials.length / visibleTestimonialCount);

  const getMetricsForPage = (pageIndex: number) =>
    Array.from({ length: visibleMetricCount }, (_, index) => {
      const metricIndex = (pageIndex * visibleMetricCount + index) % ownerMetrics.length;
      return ownerMetrics[metricIndex];
    });

  const getTestimonialsForPage = (pageIndex: number) =>
    Array.from({ length: visibleTestimonialCount }, (_, index) => {
      const testimonialIndex = (pageIndex * visibleTestimonialCount + index) % ownerTestimonials.length;
      return ownerTestimonials[testimonialIndex];
    });

  const changeMetricPage = (direction: "next" | "previous") => {
    if (metricPageCount <= 1) {
      return;
    }

    setMetricTransitionDirection(direction);
    setMetricRotationPage((currentPage) => {
      setOutgoingMetricRotationPage(currentPage);
      return direction === "next"
        ? (currentPage + 1) % metricPageCount
        : (currentPage - 1 + metricPageCount) % metricPageCount;
    });
  };

  const changeTestimonialPage = (direction: "next" | "previous") => {
    if (testimonialPageCount <= 1) {
      return;
    }

    setTestimonialTransitionDirection(direction);
    setTestimonialRotationPage((currentPage) => {
      setOutgoingTestimonialRotationPage(currentPage);
      return direction === "next"
        ? (currentPage + 1) % testimonialPageCount
        : (currentPage - 1 + testimonialPageCount) % testimonialPageCount;
    });
  };

  useEffect(() => {
    const page = document.querySelector<HTMLElement>(".owners-page");
    const header = document.querySelector<HTMLElement>(".site-header");
    const anchorNav = document.querySelector<HTMLElement>(".owners-anchor-nav");

    if (!page || !header || !anchorNav) {
      return;
    }

    const updateStickyOffset = () => {
      page.style.setProperty("--owners-sticky-offset", `${header.offsetHeight}px`);
    };

    const updateAnchorNavState = () => {
      const isSmallViewport = window.innerWidth <= 760;
      const stickyTop = header.offsetHeight;
      const anchorTop = anchorNav.getBoundingClientRect().top;

      setIsAnchorNavCondensed(isSmallViewport && anchorTop <= stickyTop + 1);
    };

    updateStickyOffset();
    updateAnchorNavState();
    window.addEventListener("resize", updateStickyOffset);
    window.addEventListener("resize", updateAnchorNavState);
    window.addEventListener("scroll", updateAnchorNavState, { passive: true });

    return () => {
      window.removeEventListener("resize", updateStickyOffset);
      window.removeEventListener("resize", updateAnchorNavState);
      window.removeEventListener("scroll", updateAnchorNavState);
      page.style.removeProperty("--owners-sticky-offset");
    };
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 760px)");
    const updateMobileTestimonials = () => {
      setIsMobileTestimonials(mediaQuery.matches);
      setMetricRotationPage(0);
      setOutgoingMetricRotationPage(null);
      setTestimonialRotationPage(0);
      setOutgoingTestimonialRotationPage(null);
    };

    updateMobileTestimonials();
    mediaQuery.addEventListener("change", updateMobileTestimonials);

    return () => {
      mediaQuery.removeEventListener("change", updateMobileTestimonials);
    };
  }, []);

  useEffect(() => {
    if (metricPageCount <= 1 || !isMobileTestimonials) {
      return;
    }

    const intervalId = window.setInterval(() => {
      changeMetricPage("next");
    }, ownerMetricRotationMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [metricPageCount, isMobileTestimonials]);

  useEffect(() => {
    if (outgoingMetricRotationPage === null) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setOutgoingMetricRotationPage(null);
    }, ownerMetricTransitionMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [outgoingMetricRotationPage]);

  useEffect(() => {
    if (testimonialPageCount <= 1) {
      return;
    }

    const intervalId = window.setInterval(() => {
      changeTestimonialPage("next");
    }, ownerTestimonialRotationMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [testimonialPageCount]);

  useEffect(() => {
    if (outgoingTestimonialRotationPage === null) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setOutgoingTestimonialRotationPage(null);
    }, ownerTestimonialTransitionMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [outgoingTestimonialRotationPage]);

  const visibleMetrics = getMetricsForPage(metricRotationPage);
  const outgoingVisibleMetrics =
    outgoingMetricRotationPage === null ? [] : getMetricsForPage(outgoingMetricRotationPage);
  const visibleTestimonials = getTestimonialsForPage(testimonialRotationPage);
  const outgoingVisibleTestimonials =
    outgoingTestimonialRotationPage === null
      ? []
      : getTestimonialsForPage(outgoingTestimonialRotationPage);
  const handleTestimonialPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!isMobileTestimonials) {
      return;
    }

    testimonialSwipeStartX.current = event.clientX;
  };
  const handleTestimonialPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (!isMobileTestimonials || testimonialSwipeStartX.current === null) {
      return;
    }

    const swipeDistance = event.clientX - testimonialSwipeStartX.current;
    testimonialSwipeStartX.current = null;

    if (Math.abs(swipeDistance) < 38) {
      return;
    }

    changeTestimonialPage(swipeDistance < 0 ? "next" : "previous");
  };
  const rootClassName = `owners-page${isHomeSection ? " owners-home-section" : ""}`;
  const HeroHeadingTag = isHomeSection ? "h2" : "h1";

  return (
    <div className={rootClassName}>
      <section className="owners-hero" id={isHomeSection ? "propietarios" : undefined}>
        <img
          src="/propietarios-hero.jpg"
          alt="Casa moderna administrada por Lars"
          className="owners-hero-image"
        />
        <div className="owners-hero-scrim" aria-hidden="true" />

        <div className="container owners-hero-layout">
          <div className="owners-hero-copy reveal">
            <HeroHeadingTag>+1.500 personas buscan alquilar ya</HeroHeadingTag>

            <div className="owners-metrics-shell">
              {outgoingMetricRotationPage !== null ? (
                <div
                  className={`owners-metrics-grid owners-hero-metrics owners-metrics-grid-outgoing owners-metrics-grid-${metricTransitionDirection}`}
                  aria-hidden="true"
                >
                  {outgoingVisibleMetrics.map((metric, index) => (
                    <article
                      className={`owners-metric-card owners-metric-card-${index + 1}`}
                      key={`${metric.value.join(" ")}-outgoing-${outgoingMetricRotationPage}-${index}`}
                    >
                      <span>
                        {metric.value.map((line, lineIndex) => (
                          <span className={`owners-metric-line-${lineIndex + 1}`} key={line}>
                            {line}
                          </span>
                        ))}
                      </span>
                    </article>
                  ))}
                </div>
              ) : null}

              <div
                className={`owners-metrics-grid owners-hero-metrics owners-metrics-grid-current owners-metrics-grid-${metricTransitionDirection}`}
                aria-label="Datos del servicio"
                key={`metrics-${metricRotationPage}-${metricTransitionDirection}`}
              >
                {visibleMetrics.map((metric, index) => (
                  <article
                    className={`owners-metric-card owners-metric-card-${index + 1}`}
                    key={`${metric.value.join(" ")}-${metricRotationPage}-${index}`}
                  >
                    <span>
                      {metric.value.map((line, lineIndex) => (
                        <span className={`owners-metric-line-${lineIndex + 1}`} key={line}>
                          {line}
                        </span>
                      ))}
                    </span>
                  </article>
                ))}
              </div>
            </div>

            <div className="owners-hero-testimonials" id="testimonios">
              <OwnerSectionHeader title="Testimonios" description="" />

              <div
                className="owners-testimonials-shell"
                onPointerDown={handleTestimonialPointerDown}
                onPointerUp={handleTestimonialPointerUp}
                onPointerCancel={() => {
                  testimonialSwipeStartX.current = null;
                }}
              >
                {outgoingTestimonialRotationPage !== null ? (
                  <div
                    className={`owners-testimonials-grid owners-testimonials-grid-outgoing owners-testimonials-grid-${testimonialTransitionDirection}`}
                    aria-hidden="true"
                  >
                    {outgoingVisibleTestimonials.map((testimonial, index) => (
                      <article
                        className="owners-testimonial-card"
                        key={`${testimonial.author}-outgoing-${outgoingTestimonialRotationPage}-${index}`}
                      >
                        <span className="owners-quote-mark" aria-hidden="true">
                          <QuoteIcon />
                        </span>
                        <blockquote>{testimonial.text}</blockquote>
                        <footer>
                          <TestimonialAuthor author={testimonial.author} />
                          <span>{testimonial.location}</span>
                        </footer>
                      </article>
                    ))}
                  </div>
                ) : null}

                <div
                  className={`owners-testimonials-grid owners-testimonials-grid-current owners-testimonials-grid-${testimonialTransitionDirection}`}
                  key={`testimonials-${testimonialRotationPage}-${testimonialTransitionDirection}`}
                >
                  {visibleTestimonials.map((testimonial, index) => (
                    <article className="owners-testimonial-card" key={`${testimonial.author}-${testimonialRotationPage}-${index}`}>
                      <span className="owners-quote-mark" aria-hidden="true">
                        <QuoteIcon />
                      </span>
                      <blockquote>{testimonial.text}</blockquote>
                      <footer>
                        <TestimonialAuthor author={testimonial.author} />
                        <span>{testimonial.location}</span>
                      </footer>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <aside className="owners-hero-form-card reveal reveal-delay-2" aria-labelledby="lead-form-admin">
            <OwnerLeadForm id="lead-form-admin" />
          </aside>
        </div>
      </section>

      {showOwnerAnchorNav ? (
        <nav
          className={`owners-anchor-nav${isAnchorNavCondensed ? " is-condensed" : ""}`}
          aria-label="Secciones de propietarios"
        >
          <div className="container owners-anchor-nav-inner">
            <a href="#servicios">Servicios</a>
            <a href="#como-funciona">Cómo funciona</a>
            <a href="#testimonios">Testimonios</a>
            <a href="#lead-form-admin" className="owners-anchor-cta">
              Solicitar contacto
            </a>
          </div>
        </nav>
      ) : null}

      {showOwnerPainSection ? (
        <section className="owners-section owners-pain-section">
          <div className="container">
            <OwnerSectionHeader
              title="Cuando no hay respaldo, cada problema queda de tu lado"
              description="Estas son algunas de las problemáticas que enfrentan los propietarios que administran por su cuenta sus propiedades."
            />

            <div className="owners-card-grid owners-pain-grid">
              {ownerPainPoints.map((item, index) => (
                <article className={`owners-card owners-pain-card reveal reveal-delay-${(index % 4) + 1}`} key={item.title}>
                  <div className="owners-pain-head">
                    <span className="owners-card-icon">
                      <OwnerIcon kind={item.icon ?? "check"} />
                    </span>
                    <h3>{item.title}</h3>
                  </div>
                  <p>{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {showOwnerServicesSection ? (
        <section className="owners-section owners-services-section" id="servicios">
          <div className="container">
            <OwnerSectionHeader
              title="Nos encargamos de todo"
              description="Administración de alquileres para que vos no tengas que preocuparte por nada."
            />

            <div className="owners-card-grid owners-service-grid">
              {ownerServices.map((item, index) => (
                <article className={`owners-card owners-service-card reveal reveal-delay-${(index % 3) + 1}`} key={item.title}>
                  <div className="owners-service-head">
                    <h3>{item.title}</h3>
                  </div>
                  <p>{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {showOwnerProcessSection ? (
        <section className="owners-process-section" id="como-funciona">
          <div className="container">
            <OwnerSectionHeader
              title="¿Querés que administremos tu propiedad?"
              description="Un recorrido claro desde el primer contacto hasta la administración cotidiana."
              inverse
            />

            <div className="owners-steps-grid">
              {ownerSteps.map((step, index) => (
                <article className={`owners-step-card reveal reveal-delay-${(index % 4) + 1}`} key={step.number}>
                  <div className="owners-step-head">
                    <span>{`Paso ${step.number}`}</span>
                    <h3>{step.title}</h3>
                  </div>
                  <p>{step.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {showOwnerReasonsSection ? (
        <section className="owners-section owners-why-section">
          <div className="container">
            <OwnerSectionHeader
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
      ) : null}

      {showOwnerFinalSection ? (
        <section className="owners-final-section">
          <div className="container owners-final-layout">
            <div className="owners-final-copy reveal">
              <h2>Empezá a disfrutar de tu propiedad sin preocupaciones</h2>
              <div className="owners-final-badges" aria-label="Condiciones del contacto">
                <span>
                  <OwnerIcon kind="check" />
                  Asesoría gratuita
                </span>
                <span>
                  <OwnerIcon kind="check" />
                  Respuesta en 24 h
                </span>
              </div>
            </div>

            <aside className="owners-final-form-card reveal reveal-delay-2">
              <OwnerLeadForm compact />
            </aside>
          </div>
        </section>
      ) : null}
    </div>
  );
}
