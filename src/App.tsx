import { useEffect, useRef, useState } from "react";
import ContactSection from "./components/ContactSection";
import { getSalesPropertyById } from "./data/salesCatalog";
import PropertyDetailsPage from "./pages/PropertyDetailsPage";
import SalesPage from "./pages/SalesPage";

type NavRoute = "home" | "ventas";

type NavLink = {
  label: string;
  href: string;
  route?: NavRoute;
};

type AppRoute =
  | { name: "home" }
  | { name: "ventas" }
  | { name: "propiedad"; propertyId: number | null };

type Metric = {
  value: string;
  label: string;
};

type QuickGroup = {
  title: string;
  items: Array<{
    label: string;
    href: string;
  }>;
};

type ListingMedia = {
  image: string;
  alt: string;
  objectPosition?: string;
};

type Listing = {
  operation: string;
  title: string;
  price: string;
  location: string;
  rooms: number;
  bathrooms: number;
  size: string;
  image: string;
  gallery: ListingMedia[];
  videoSrc?: string;
};

type Project = {
  tag: string;
  title: string;
  location: string;
  description: string;
  image: string;
};

type Service = {
  title: string;
  description: string;
};

type AboutTopic = {
  title: string;
  description: string;
};

function buildListingGallery(title: string, primaryImage: string): ListingMedia[] {
  return [
    {
      image: primaryImage,
      alt: `${title} vista principal`,
      objectPosition: "center center",
    },
    {
      image: "/1.png",
      alt: `${title} fachada y acceso`,
      objectPosition: "center center",
    },
    {
      image: "/2.png",
      alt: `${title} ambiente interior complementario`,
      objectPosition: "center center",
    },
    {
      image: "/3.png",
      alt: `${title} fachada alternativa`,
      objectPosition: "center center",
    },
  ];
}

const navLinks: NavLink[] = [
  { label: "Gastos Comunes", href: "/#servicios" },
  { label: "Ventas", href: "/ventas", route: "ventas" },
  { label: "Alquileres", href: "/#propiedades" },
  { label: "Proyectos", href: "/#proyectos" },
  { label: "Lars", href: "/#acerca" },
  { label: "Contacto", href: "/#contacto" },
];

const heroMetrics: Metric[] = [
  { value: "+55 años", label: "de experiencia y trayectoria familiar" },
  { value: "2 oficinas", label: "Cordón y Pocitos Nuevo para atención cercana" },
  { value: "24/7", label: "acceso online para pagos y consultas" },
  {
    value: "5 departamentos",
    label: "ventas, alquiler, gastos comunes, departamento contable y administración de propiedades",
  },
];

const heroHighlights = [
  {
    title: "Propiedades destacadas",
    detail: "Selección actualizada para compra, alquiler y oportunidades con seguimiento comercial.",
  },
  {
    title: "Gastos comunes",
    detail: "Administración, liquidación mensual y respaldo operativo para edificios y comunidades.",
  },
  {
    title: "Atención directa",
    detail: "Equipo disponible desde Cordón y Pocitos Nuevo para orientar cada consulta.",
  },
];

const quickGroups: QuickGroup[] = [
  {
    title: "Zonas destacadas",
    items: [
      { label: "Pocitos", href: "/ventas?barrio=Pocitos#ventas-filtros" },
      { label: "Tres Cruces", href: "/ventas?barrio=Tres%20Cruces#ventas-filtros" },
      { label: "Buceo", href: "/ventas?barrio=Buceo#ventas-filtros" },
      { label: "Carrasco", href: "/ventas?barrio=Carrasco#ventas-filtros" },
      { label: "Punta Carretas", href: "/ventas?barrio=Punta%20Carretas#ventas-filtros" },
    ],
  },
  {
    title: "Tipos de propiedad",
    items: [
      { label: "Casas", href: "/ventas?tipo=Casa#ventas-filtros" },
      { label: "Apartamentos", href: "/ventas?tipo=Apartamento#ventas-filtros" },
      { label: "Oficinas", href: "/ventas?tipo=Oficina#ventas-filtros" },
      { label: "Locales", href: "/ventas?tipo=Local#ventas-filtros" },
      { label: "Terrenos", href: "/ventas?tipo=Terreno#ventas-filtros" },
    ],
  },
  {
    title: "Cantidad de dormitorios",
    items: [
      { label: "1", href: "/ventas?dormitorios=1#ventas-filtros" },
      { label: "2", href: "/ventas?dormitorios=2#ventas-filtros" },
      { label: "3", href: "/ventas?dormitorios=3#ventas-filtros" },
      { label: "4+", href: "/ventas?dormitorios=4%2B#ventas-filtros" },
    ],
  },
];

const featuredListings: Listing[] = [
  {
    operation: "Alquiler",
    title: "Villa Dolores Loft",
    price: "$ 171.000",
    location: "Villa Dolores",
    rooms: 3,
    bathrooms: 2,
    size: "46 m2",
    image: "/property-villa-dolores.png",
    gallery: buildListingGallery("Villa Dolores Loft", "/property-villa-dolores.png"),
    videoSrc: "/hero-bg.mp4",
  },
  {
    operation: "Venta",
    title: "Pocitos Classic",
    price: "US$ 321.000",
    location: "Pocitos",
    rooms: 3,
    bathrooms: 2,
    size: "46 m2",
    image: "/property-pocitos.png",
    gallery: buildListingGallery("Pocitos Classic", "/property-pocitos.png"),
  },
  {
    operation: "Venta",
    title: "Punta Carretas Loft",
    price: "US$ 121.000",
    location: "Punta Carretas",
    rooms: 2,
    bathrooms: 1,
    size: "46 m2",
    image: "/property-punta-carretas.png",
    gallery: buildListingGallery("Punta Carretas Loft", "/property-punta-carretas.png"),
  },
  {
    operation: "Venta",
    title: "La Blanqueada Studio",
    price: "US$ 121.000",
    location: "La Blanqueada",
    rooms: 2,
    bathrooms: 1,
    size: "46 m2",
    image: "/property-la-blanqueada.png",
    gallery: buildListingGallery("La Blanqueada Studio", "/property-la-blanqueada.png"),
  },
];

const featuredProjects: Project[] = [
  {
    tag: "Proyecto destacado",
    title: "Tempo Guayabos",
    location: "Montevideo",
    description:
      "Una pieza principal para desarrollos con mucha presencia visual, identidad propia y CTA claro.",
    image: "/project-tempo.png",
  },
  {
    tag: "Edificio boutique",
    title: "Visca",
    location: "Montevideo",
    description:
      "Bloque pensado para presentar edificios y apartamentos con una lectura mas directa y editorial.",
    image: "/project-urban.png",
  },
  {
    tag: "Housing garden",
    title: "Vila",
    location: "Barra de Carrasco",
    description:
      "Una variante para proyectos con mas aire residencial, terrazas y vida de barrio.",
    image: "/project-garden.png",
  },
];

const services: Service[] = [
  {
    title: "Gastos Comunes",
    description:
      "Seguimiento real, liquidacion mensual, pago online 24/7 y respaldo contable, fiscal y operativo.",
  },
  {
    title: "Administracion de Propiedades",
    description:
      "Marketing del inmueble, gestion de garantias, control de pagos y acompañamiento durante todo el contrato.",
  },
  {
    title: "Ventas y Alquileres",
    description:
      "Tasacion, produccion fotografica, acompañamiento en visitas y un proceso comercial mas claro y cercano.",
  },
  {
    title: "Atencion Lars",
    description:
      "Empresa familiar y multigeneracional con una forma de trabajo personalizada, presente y resolutiva.",
  },
];

const aboutMetrics: Metric[] = [
  { value: "Trayectoria", label: "+55 años de experiencia" },
  { value: "Modelo", label: "Empresa familiar y multigeneracional" },
  { value: "Servicios", label: "Administracion, ventas y alquileres" },
];

const aboutTopics: AboutTopic[] = [
  {
    title: "Atencion personalizada",
    description:
      "Acompanamos cada consulta con un trato directo, seguimiento cercano y respuestas pensadas para la situacion real de cada cliente.",
  },
  {
    title: "Compromiso y confianza",
    description:
      "Trabajamos con continuidad, claridad en la informacion y una forma de gestionar que prioriza relaciones de largo plazo.",
  },
  {
    title: "Red de oficinas",
    description:
      "Nuestra presencia en Cordon y Pocitos Nuevo nos permite estar cerca de propietarios, inquilinos y compradores en zonas clave de Montevideo.",
  },
  {
    title: "Respuesta agil",
    description:
      "Ordenamos consultas, visitas y gestiones operativas para que cada paso avance con menos friccion y mayor previsibilidad.",
  },
  {
    title: "Mirada actual",
    description:
      "Combinamos trayectoria familiar con herramientas digitales, comunicacion clara y una lectura actual del mercado inmobiliario.",
  },
  {
    title: "Servicio integral",
    description:
      "Integramos administracion, ventas, alquileres y gastos comunes para resolver necesidades inmobiliarias desde un mismo equipo.",
  },
];

const topbarBranches = [
  {
    office: "Casa central Cordón",
    address: "Minas 1401",
    phone: "2401 01 01",
    phoneHref: "tel:+59824010101",
  },
  {
    office: "Sucursal Pocitos Nuevo",
    address: "Av. Gral Rivera 3471",
    phone: "2622 50 50",
    phoneHref: "tel:+59826225050",
  },
];

function SectionHeader(props: {
  title: string;
  description: string;
  inverse?: boolean;
}) {
  const { title, description, inverse = false } = props;

  return (
    <div className={`section-heading reveal${inverse ? " section-heading-inverse" : ""}`}>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}

function getWrappedIndex(index: number, length: number) {
  return ((index % length) + length) % length;
}

function getRouteFromPathname(pathname: string): AppRoute {
  const normalizedPathname = pathname.replace(/\/+$/, "") || "/";

  if (normalizedPathname === "/ventas") {
    return { name: "ventas" };
  }

  const propertyMatch = normalizedPathname.match(/^\/propiedades\/([^/]+)$/);

  if (propertyMatch) {
    const parsedId = Number(propertyMatch[1]);
    return { name: "propiedad", propertyId: Number.isFinite(parsedId) ? parsedId : null };
  }

  return { name: "home" };
}

type ListingShowcaseCardProps = {
  listing: Listing;
  activeMediaIndex?: number;
  className?: string;
  interactive?: boolean;
  ariaLive?: "off" | "polite";
  onMediaSelect?: (index: number) => void;
};

function ListingShowcaseCard(props: ListingShowcaseCardProps) {
  const {
    listing,
    activeMediaIndex = 0,
    className = "",
    interactive = false,
    ariaLive = "off",
    onMediaSelect,
  } = props;

  const currentMedia = listing.gallery[getWrappedIndex(activeMediaIndex, listing.gallery.length)];
  const [isVideoPreviewActive, setIsVideoPreviewActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hasVideoPreview = Boolean(listing.videoSrc);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    if (!isVideoPreviewActive || !listing.videoSrc) {
      video.pause();
      video.currentTime = 0;
      return;
    }

    const playback = video.play();
    playback?.catch(() => undefined);

    return () => {
      video.pause();
      video.currentTime = 0;
    };
  }, [isVideoPreviewActive, listing.videoSrc]);

  return (
    <article
      className={`listing-showcase-card${className ? ` ${className}` : ""}`}
      aria-live={ariaLive}
    >
      <div className="listing-showcase-media">
        <div
          className={`listing-showcase-main-image-wrap${hasVideoPreview ? " has-video-preview" : ""}${isVideoPreviewActive ? " is-video-active" : ""}`}
          onMouseEnter={hasVideoPreview ? () => setIsVideoPreviewActive(true) : undefined}
          onMouseLeave={hasVideoPreview ? () => setIsVideoPreviewActive(false) : undefined}
        >
          <span className="listing-operation-chip">{listing.operation}</span>
          <img
            src={currentMedia.image}
            alt={currentMedia.alt}
            className="listing-showcase-main-image"
            style={{ objectPosition: currentMedia.objectPosition ?? "center center" }}
          />
          {listing.videoSrc ? (
            <video
              ref={videoRef}
              className="listing-showcase-main-video"
              muted
              loop
              playsInline
              preload="metadata"
              poster={currentMedia.image}
              aria-hidden="true"
            >
              <source src={listing.videoSrc} type="video/mp4" />
            </video>
          ) : null}
        </div>
      </div>

      <div className="listing-showcase-side">
        <div className="listing-showcase-header">
          <div className="listing-showcase-copy">
            <h3>{listing.title}</h3>
            <p>{listing.location}</p>
          </div>

          <div className="listing-showcase-stats" aria-label="Detalles de la propiedad">
            <div className="listing-showcase-stat">
              <img src="/icon-dorm.png" alt="" />
              <span>{listing.rooms}</span>
            </div>
            <div className="listing-showcase-stat">
              <img src="/icon-banos.png" alt="" />
              <span>{listing.bathrooms}</span>
            </div>
            <div className="listing-showcase-stat">
              <img src="/icon-sup.png" alt="" />
              <span>{listing.size}</span>
            </div>
          </div>
        </div>

        <div className="listing-showcase-thumbs" aria-label={`Imagenes secundarias de ${listing.title}`}>
          {listing.gallery.map((media, index) =>
            interactive && onMediaSelect ? (
              <button
                key={`${listing.title}-${media.image}-${index}`}
                type="button"
                className={`listing-showcase-thumb${index === activeMediaIndex ? " is-active" : ""}`}
                onMouseEnter={() => onMediaSelect(index)}
                onFocus={() => onMediaSelect(index)}
                onClick={() => onMediaSelect(index)}
                aria-label={`Ver imagen ${index + 1} de ${listing.title}`}
                aria-pressed={index === activeMediaIndex}
              >
                <img
                  src={media.image}
                  alt=""
                  aria-hidden="true"
                  className="listing-showcase-thumb-image"
                  style={{ objectPosition: media.objectPosition ?? "center center" }}
                />
              </button>
            ) : (
              <div
                key={`${listing.title}-${media.image}-${index}`}
                className={`listing-showcase-thumb${index === 0 ? " is-active" : ""}`}
                aria-hidden="true"
              >
                <img
                  src={media.image}
                  alt=""
                  aria-hidden="true"
                  className="listing-showcase-thumb-image"
                  style={{ objectPosition: media.objectPosition ?? "center center" }}
                />
              </div>
            ),
          )}
        </div>

        <div className="listing-showcase-footer">
          <div className="listing-showcase-price">{listing.price}</div>
        </div>
      </div>
    </article>
  );
}

function ListingShowcasePreview(props: {
  listing: Listing;
  direction: "left" | "right";
  onClick: () => void;
}) {
  const { listing, direction, onClick } = props;

  return (
    <button
      type="button"
      className={`listing-showcase-preview listing-showcase-preview-${direction}`}
      onClick={onClick}
      aria-label={
        direction === "left"
          ? `Ver propiedad anterior: ${listing.title}`
          : `Ver propiedad siguiente: ${listing.title}`
      }
    >
      <img src={listing.image} alt="" aria-hidden="true" className="listing-showcase-preview-image" />
    </button>
  );
}

function TopActionIcon(props: { kind: "sueldos" | "clientes" }) {
  const { kind } = props;

  if (kind === "sueldos") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M7 3.5h8l3 3v13a1 1 0 0 1-1 1H7a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M15 3.5V7h3"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8.5 11h6M8.5 14.5h6M8.5 18h4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 11a3.25 3.25 0 1 0 0-6.5 3.25 3.25 0 0 0 0 6.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.5 19.5a6.5 6.5 0 0 1 13 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TopbarIcon(props: { kind: "location" | "phone" }) {
  const { kind } = props;

  if (kind === "phone") {
    return (
      <svg className="topbar-info-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M6.5 4.5 9 4l2 4.6-1.35 1.1a11.5 11.5 0 0 0 4.65 4.65L15.4 13l4.6 2-0.5 2.5c-0.18 0.9-1 1.55-1.92 1.48A15.7 15.7 0 0 1 5.02 6.42C4.95 5.5 5.6 4.68 6.5 4.5Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg className="topbar-info-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 21s7-5.3 7-11a7 7 0 1 0-14 0c0 5.7 7 11 7 11Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="12"
        cy="10"
        r="2.35"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
      />
    </svg>
  );
}

function FooterSocialIcon(props: { kind: "instagram" | "facebook" | "linkedin" }) {
  const { kind } = props;

  if (kind === "facebook") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M14 8.2h2.2V4.7A13 13 0 0 0 13 4.5c-3.2 0-5.35 1.95-5.35 5.5v3.1H4.1V17h3.55v2.5h4.3V17h3.45l0.55-3.9h-4v-2.7c0-1.12 0.32-2.2 2.05-2.2Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  if (kind === "linkedin") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M6.1 9.15h3.65V19.5H6.1V9.15Zm1.82-4.65a2.1 2.1 0 1 1 0 4.2 2.1 2.1 0 0 1 0-4.2Zm4.1 4.65h3.5v1.42h0.05c0.48-0.88 1.66-1.72 3.4-1.72 3.62 0 4.18 2.26 4.18 5.2v5.45H19.5v-4.84c0-1.15-0.02-2.62-1.7-2.62-1.72 0-1.98 1.26-1.98 2.55v4.91h-3.8V9.15Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect
        x="4.2"
        y="4.2"
        width="15.6"
        height="15.6"
        rx="4.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle
        cx="12"
        cy="12"
        r="3.7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle cx="16.9" cy="7.2" r="1.05" fill="currentColor" />
    </svg>
  );
}

function CarouselArrowIcon(props: { direction: "left" | "right" }) {
  const { direction } = props;

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d={direction === "left" ? "M14.5 5.5 8 12l6.5 6.5" : "m9.5 5.5 6.5 6.5-6.5 6.5"}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function App() {
  const route = getRouteFromPathname(window.location.pathname);
  const activeNavRoute: NavRoute = route.name === "propiedad" ? "ventas" : route.name;
  const activeProperty = route.name === "propiedad" && route.propertyId !== null
    ? getSalesPropertyById(route.propertyId)
    : undefined;
  const [listingIndex, setListingIndex] = useState(0);
  const [listingMediaIndex, setListingMediaIndex] = useState(0);
  const [listingTransitionDirection, setListingTransitionDirection] = useState<"left" | "right" | null>(null);
  const [listingMotionKey, setListingMotionKey] = useState(0);
  const [footerBranchIndex, setFooterBranchIndex] = useState(0);
  const [activeAboutTopicIndex, setActiveAboutTopicIndex] = useState(0);

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));

    if (!("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.16,
        rootMargin: "0px 0px -10% 0px",
      },
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (route.name === "ventas") {
      document.title = "Lars | Ventas";
      return;
    }

    if (route.name === "propiedad") {
      document.title = activeProperty ? `Lars | ${activeProperty.title}` : "Lars | Propiedad";
      return;
    }

    document.title = "Lars";
  }, [activeProperty, route.name]);

  const listingCount = featuredListings.length;
  const activeListing = featuredListings[getWrappedIndex(listingIndex, listingCount)];
  const previousPreviewListing = featuredListings[getWrappedIndex(listingIndex - 1, listingCount)];
  const nextPreviewListing = featuredListings[getWrappedIndex(listingIndex + 1, listingCount)];

  useEffect(() => {
    setListingMediaIndex(0);
  }, [listingIndex]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setFooterBranchIndex((currentIndex) => getWrappedIndex(currentIndex + 1, topbarBranches.length));
    }, 4200);

    return () => window.clearInterval(intervalId);
  }, []);

  const handlePreviousListings = () => {
    setListingTransitionDirection("left");
    setListingMotionKey((currentKey) => currentKey + 1);
    setListingIndex((currentIndex) => getWrappedIndex(currentIndex - 1, listingCount));
  };

  const handleNextListings = () => {
    setListingTransitionDirection("right");
    setListingMotionKey((currentKey) => currentKey + 1);
    setListingIndex((currentIndex) => getWrappedIndex(currentIndex + 1, listingCount));
  };

  const handleSelectListing = (index: number) => {
    if (index === listingIndex) {
      return;
    }

    setListingTransitionDirection(index > listingIndex ? "right" : "left");
    setListingMotionKey((currentKey) => currentKey + 1);
    setListingIndex(index);
  };

  const activeAboutTopic = aboutTopics[getWrappedIndex(activeAboutTopicIndex, aboutTopics.length)];
  const activeFooterBranch = topbarBranches[getWrappedIndex(footerBranchIndex, topbarBranches.length)];

  return (
    <div className={`page-shell${route.name !== "home" ? " page-shell-sales" : ""}`}>
      <div className="topbar">
        <div className="container topbar-inner">
          {topbarBranches.map((branch) => (
            <div className="topbar-branch" key={branch.office}>
              <span className="topbar-branch-name">{branch.office}</span>
              <span className="topbar-info-item">
                <TopbarIcon kind="location" />
                <span>{branch.address}</span>
              </span>
              <a className="topbar-info-item" href={branch.phoneHref}>
                <TopbarIcon kind="phone" />
                <span>{branch.phone}</span>
              </a>
            </div>
          ))}
        </div>
      </div>

      <header className="site-header">
        <div className="container header-inner">
          <a className="logo-link" href="/#inicio" aria-label="Volver al inicio">
            <img src="/logo.png" alt="Lars" className="brand-logo" />
          </a>
          <nav className="site-nav" aria-label="Principal">
            {navLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={item.route === activeNavRoute ? "is-active" : undefined}
                aria-current={item.route === activeNavRoute ? "page" : undefined}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="header-actions" aria-label="Accesos directos">
            <button type="button" className="header-action-button">
              <TopActionIcon kind="sueldos" />
              <span>Sueldos</span>
            </button>
            <button type="button" className="header-action-button">
              <TopActionIcon kind="clientes" />
              <span>Clientes</span>
            </button>
          </div>
        </div>
      </header>

      <main>
        {route.name === "ventas" ? (
          <SalesPage />
        ) : route.name === "propiedad" ? (
          <PropertyDetailsPage propertyId={route.propertyId} />
        ) : (
          <>
            <section className="hero" id="inicio">
          <div className="hero-media" aria-hidden="true">
            <video
              className="hero-video"
              autoPlay
              muted
              loop
              playsInline
              poster="/hero-building.png"
            >
              <source src="/hero-bg.mp4" type="video/mp4" />
            </video>
          </div>
          <div className="hero-backdrop" aria-hidden="true" />
          <div className="container hero-stage">
            <div className="hero-content reveal">
              <h1>"Servimos bien para servir siempre"</h1>
              <p>
                Una experiencia integral para vender, alquilar, administrar y acompañar decisiones
                inmobiliarias con cercanía, trayectoria y mirada actual.
              </p>
              <div className="hero-actions">
                <a className="primary-button search-cta-button" href="#propiedades">
                  Ver propiedades
                </a>
                <a className="hero-link-button" href="#servicios">
                  Consultar gastos comunes
                </a>
              </div>
            </div>

            <aside className="hero-insight-panel reveal reveal-delay-2" aria-label="Resumen de servicios Lars">
              <div className="hero-insight-heading">
                <span>Hoy en Lars</span>
                <strong>Información clave para empezar rápido</strong>
              </div>

              <div className="hero-insight-list">
                {heroHighlights.map((item, index) => (
                  <article key={item.title} className="hero-insight-item">
                    <span className="hero-insight-index">{String(index + 1).padStart(2, "0")}</span>
                    <div>
                      <h2>{item.title}</h2>
                      <p>{item.detail}</p>
                    </div>
                  </article>
                ))}
              </div>

              <a className="hero-panel-link" href="#contacto">
                Hablar con un asesor
              </a>
            </aside>

            <div className="hero-metrics">
              {heroMetrics.map((item, index) => (
                <article
                  key={item.value}
                  className={`hero-metric-card reveal reveal-delay-${index + 1}`}
                >
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </article>
              ))}
            </div>
          </div>
        </section>

            <section className="hero-search-band">
          <div className="container search-wrap" id="buscador">
            <div className="search-stack">
              <form className="search-card reveal reveal-delay-3">
                <div className="search-header">
                  <div>
                    <h2>Encontra propiedades y servicios Lars desde la home</h2>
                  </div>
                  <button type="button" className="ghost-button">
                    Ver filtros
                  </button>
                </div>

                <div className="search-grid">
                  <label>
                    Operacion
                    <select defaultValue="venta">
                      <option value="venta">Venta</option>
                      <option value="alquiler">Alquiler</option>
                      <option value="proyectos">Proyectos</option>
                    </select>
                  </label>
                  <label>
                    Tipo
                    <select defaultValue="apartamento">
                      <option value="apartamento">Apartamento</option>
                      <option value="casa">Casa</option>
                      <option value="oficina">Oficina</option>
                      <option value="terreno">Terreno</option>
                    </select>
                  </label>
                  <label>
                    Zona o referencia
                    <input type="text" placeholder="Ej: Pocitos, Carrasco o referencia" />
                  </label>
                  <label>
                    Presupuesto
                    <select defaultValue="mid">
                      <option value="mid">USD 120.000 - 250.000</option>
                      <option value="low">Hasta USD 120.000</option>
                      <option value="high">Mas de USD 250.000</option>
                    </select>
                  </label>
                </div>

                <div className="search-actions">
                  <div className="search-tags">
                    <span>Garaje</span>
                    <span>Barbacoa</span>
                    <span>Piscina</span>
                    <span>Entrega inmediata</span>
                  </div>
                  <button type="button" className="primary-button search-cta-button">
                    Buscar
                  </button>
                </div>
              </form>

              <div className="quick-grid">
                {quickGroups.map((group, index) => (
                  <article key={group.title} className={`quick-card reveal reveal-delay-${index + 1}`}>
                    <h3>{group.title}</h3>
                    <div className="quick-links">
                      {group.items.map((item) => (
                        <a key={item.label} href={item.href}>
                          {item.label}
                        </a>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

            <section className="section section-listings" id="propiedades">
          <div className="container">
            <SectionHeader
              title="Destacadas en venta y alquiler"
              description=""
            />

            <div className="listing-carousel reveal">
              <div className="listing-showcase-shell">
                {listingCount > 1 && (
                  <div
                    key={`preview-rail-${listingIndex}-${listingMotionKey}`}
                    className={`listing-showcase-preview-rail${listingTransitionDirection ? ` is-sliding-${listingTransitionDirection}` : ""}`}
                  >
                    <ListingShowcasePreview
                      listing={previousPreviewListing}
                      direction="left"
                      onClick={handlePreviousListings}
                    />
                    <ListingShowcasePreview
                      listing={nextPreviewListing}
                      direction="right"
                      onClick={handleNextListings}
                    />
                  </div>
                )}

                <div className="listing-showcase-frame">
                  <button
                    type="button"
                    className="listing-carousel-button listing-carousel-button-prev"
                    onClick={handlePreviousListings}
                    aria-label="Ver propiedades anteriores"
                  >
                    <CarouselArrowIcon direction="left" />
                  </button>

                  <ListingShowcaseCard
                    key={`listing-showcase-${listingIndex}-${listingMotionKey}`}
                    listing={activeListing}
                    activeMediaIndex={listingMediaIndex}
                    className={listingTransitionDirection ? `is-sliding-${listingTransitionDirection}` : ""}
                    interactive
                    ariaLive="polite"
                    onMediaSelect={setListingMediaIndex}
                  />

                  <button
                    type="button"
                    className="listing-carousel-button listing-carousel-button-next"
                    onClick={handleNextListings}
                    aria-label="Ver mas propiedades"
                  >
                    <CarouselArrowIcon direction="right" />
                  </button>
                </div>
              </div>

              <div className="listing-carousel-dots" aria-label="Paginacion de propiedades">
                {featuredListings.map((listing, index) => (
                  <button
                    key={listing.title}
                    type="button"
                    className={`listing-carousel-dot${index === listingIndex ? " is-active" : ""}`}
                    onClick={() => handleSelectListing(index)}
                    aria-label={`Ver propiedades desde ${listing.title}`}
                    aria-pressed={index === listingIndex}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

            <section className="section section-projects" id="proyectos">
          <div className="container">
            <SectionHeader
              title="Proyectos"
              description=""
            />

            <div className="projects-grid">
              {featuredProjects.map((project, index) => (
                <article
                  key={project.title}
                  className={`project-card reveal${index === 0 ? " project-card-wide" : ""}`}
                >
                  <div className="project-image-wrap">
                    <img src={project.image} alt={project.title} className="project-image" />
                  </div>
                  <div className="project-body">
                    <h3>{project.title}</h3>
                    <p className="project-meta">{project.location}</p>
                    <p>{project.description}</p>
                    <a href="#contacto" className="text-link">
                      Ver proyecto
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

            <section className="section section-dark" id="servicios">
          <div className="container services-layout">
            <div className="services-copy reveal">
              <SectionHeader
                title="Gastos comunes, administracion y atencion personalizada dentro de la misma experiencia"
                description=""
                inverse
              />

              <div className="service-pills">
                <span>Seguimiento continuo</span>
                <span>Pago online</span>
                <span>Gestion tributaria</span>
                <span>Atencion cercana</span>
              </div>
            </div>

            <div className="service-grid">
              {services.map((service, index) => (
                <article key={service.title} className={`service-feature-card reveal reveal-delay-${index + 1}`}>
                  <span className="service-number">0{index + 1}</span>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

            <section className="section section-about" id="acerca">
          <div className="container about-layout">
            <div className="about-copy">
              <SectionHeader
                title="Una empresa familiar que combina trayectoria, continuidad y cercania"
                description=""
              />

              <div className="metric-pills">
                {aboutMetrics.map((item) => (
                  <article key={item.value} className="metric-pill reveal">
                    <strong>{item.value}</strong>
                    <span>{item.label}</span>
                  </article>
                ))}
              </div>

              <div className="about-tags" aria-label="Temas sobre Lars">
                {aboutTopics.map((item, index) => (
                  <button
                    key={item.title}
                    type="button"
                    className={index === activeAboutTopicIndex ? "is-active" : undefined}
                    onClick={() => setActiveAboutTopicIndex(index)}
                    aria-controls="about-topic-card"
                    aria-pressed={index === activeAboutTopicIndex}
                  >
                    {item.title}
                  </button>
                ))}
              </div>

              <article
                key={activeAboutTopic.title}
                id="about-topic-card"
                className="about-topic-card"
                aria-live="polite"
              >
                <h3>{activeAboutTopic.title}</h3>
                <p>{activeAboutTopic.description}</p>
              </article>
            </div>

            <aside className="spotlight-panel reveal reveal-delay-2">
              <div className="spotlight-image-wrap">
                <img src="/ggcc-city.png" alt="Ciudad y edificios gestionados por Lars" />
              </div>
              <div className="spotlight-body">
                <h3>Servicio integral con mirada actual y una forma de trabajo cercana.</h3>
                <p>
                  Brindamos administracion de gastos comunes, ventas, alquileres y administracion
                  de propiedades con un equipo especializado, foco real en cada necesidad y una
                  experiencia mas clara para el cliente.
                </p>
              </div>
            </aside>
          </div>
        </section>

            <ContactSection />
          </>
        )}
      </main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <div
            className="footer-branch"
            key={activeFooterBranch.office}
            aria-live="polite"
            aria-label={`${activeFooterBranch.office}: ${activeFooterBranch.address}, ${activeFooterBranch.phone}`}
          >
            <span className="footer-branch-name">{activeFooterBranch.office}</span>
            <span className="footer-branch-details">
              <span>{activeFooterBranch.address}</span>
              <a href={activeFooterBranch.phoneHref}>{activeFooterBranch.phone}</a>
            </span>
          </div>
          <div className="footer-socials" aria-label="Redes sociales">
            <a href="https://www.instagram.com/" aria-label="Instagram">
              <FooterSocialIcon kind="instagram" />
            </a>
            <a href="https://www.facebook.com/" aria-label="Facebook">
              <FooterSocialIcon kind="facebook" />
            </a>
            <a href="https://www.linkedin.com/" aria-label="LinkedIn">
              <FooterSocialIcon kind="linkedin" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
