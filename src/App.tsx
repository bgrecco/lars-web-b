import { useEffect, useRef, useState } from "react";
import ContactSection from "./components/ContactSection";
import WhatsAppFloatingButton from "./components/WhatsAppFloatingButton";
import { getSalesPropertyById } from "./data/salesCatalog";
import AboutPage from "./pages/AboutPage";
import CommonExpensesPage from "./pages/CommonExpensesPage";
import PropertyDetailsPage from "./pages/PropertyDetailsPage";
import ProjectsPage from "./pages/ProjectsPage";
import SalesPage from "./pages/SalesPage";

type NavRoute = "home" | "ventas" | "alquileres" | "proyectos" | "gastos" | "acerca" | "contacto";

type NavLink = {
  label: string;
  href: string;
  route?: NavRoute;
};

type AppRoute =
  | { name: "home" }
  | { name: "acerca" }
  | { name: "gastos" }
  | { name: "ventas" }
  | { name: "alquileres" }
  | { name: "proyectos" }
  | { name: "contacto" }
  | { name: "propiedad"; propertyId: number | null };

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
  { label: "Gastos Comunes", href: "/gastos-comunes", route: "gastos" },
  { label: "Ventas", href: "/ventas", route: "ventas" },
  { label: "Alquileres", href: "/alquileres", route: "alquileres" },
  { label: "Proyectos", href: "/proyectos", route: "proyectos" },
  { label: "Lars", href: "/acerca", route: "acerca" },
  { label: "Contacto", href: "/contacto", route: "contacto" },
];

const heroHighlights = [
  {
    title: "Consultar por gastos comunes",
    detail: "Administración, liquidación mensual y respaldo operativo para edificios.",
    icon: "expenses",
    href: "/gastos-comunes",
  },
  {
    title: "Propiedades en alquiler",
    detail: "Visualizá todas nuestras propiedades disponibles para alquiler.",
    icon: "rent",
    href: "/alquileres",
  },
  {
    title: "Propiedades en venta",
    detail: "Visualizá todas nuestras propiedades disponibles para venta.",
    icon: "sale",
    href: "/ventas",
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
    size: "46 m²",
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
    size: "46 m²",
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
    size: "46 m²",
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
    size: "46 m²",
    image: "/property-la-blanqueada.png",
    gallery: buildListingGallery("La Blanqueada Studio", "/property-la-blanqueada.png"),
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

  if (normalizedPathname === "/gastos-comunes") {
    return { name: "gastos" };
  }

  if (normalizedPathname === "/acerca") {
    return { name: "acerca" };
  }

  if (normalizedPathname === "/ventas") {
    return { name: "ventas" };
  }

  if (normalizedPathname === "/alquileres") {
    return { name: "alquileres" };
  }

  if (normalizedPathname === "/proyectos") {
    return { name: "proyectos" };
  }

  if (normalizedPathname === "/contacto") {
    return { name: "contacto" };
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

          <div className="listing-showcase-thumbs" aria-label={`Imágenes secundarias de ${listing.title}`}>
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

function HeroInsightIcon(props: { kind: string }) {
  switch (props.kind) {
    case "expenses":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6.5 4.5h11v15h-11z" />
          <path d="M9 8h6" />
          <path d="M9 11.5h6" />
          <path d="M9 15h3" />
        </svg>
      );
    case "rent":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4.5 11.5 12 5l7.5 6.5" />
          <path d="M6.5 10.5v8h11v-8" />
          <path d="M10 18.5v-5h4v5" />
          <path d="M16.5 6.5h2v3" />
        </svg>
      );
    case "sale":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4.5 11.5 12 5l7.5 6.5" />
          <path d="M6.5 10.5v9h11v-9" />
          <path className="hero-insight-icon-detail" d="M12 9.6v7.3" />
          <path className="hero-insight-icon-detail" d="M14.4 11.1c-.5-.7-1.3-1-2.3-1-1.2 0-2 .6-2 1.5 0 2.2 4.4 1 4.4 3.4 0 .9-.8 1.5-2.1 1.5-1.1 0-2-.4-2.6-1.1" />
        </svg>
      );
    default:
      return null;
  }
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="5.5" />
      <path d="m15 15 4.5 4.5" />
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

function TopbarBranchInfo(props: {
  branch: (typeof topbarBranches)[number];
}) {
  const { branch } = props;

  return (
    <>
      <span className="topbar-branch-name">{branch.office}</span>
      <span className="topbar-info-item">
        <TopbarIcon kind="location" />
        <span>{branch.address}</span>
      </span>
      <a className="topbar-info-item" href={branch.phoneHref}>
        <TopbarIcon kind="phone" />
        <span>{branch.phone}</span>
      </a>
    </>
  );
}

function FooterSocialIcon(props: { kind: "instagram" | "facebook" | "tiktok" }) {
  const { kind } = props;

  if (kind === "facebook") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M12 2.9c-5.03 0-9.1 4.08-9.1 9.1 0 4.54 3.32 8.31 7.66 9v-6.39H8.25V12h2.31v-1.98c0-2.28 1.36-3.54 3.44-3.54 1 0 2.04.18 2.04.18v2.24h-1.15c-1.13 0-1.49.7-1.49 1.43V12h2.53l-.4 2.61H13.4V21c4.34-.69 7.66-4.46 7.66-9 0-5.02-4.07-9.1-9.06-9.1Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  if (kind === "tiktok") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M14.45 4.2c0.35 2.35 1.66 3.72 4.05 3.87v3.15c-1.38 0.13-2.58-0.32-3.95-1.16v5.9c0 2.98-1.84 4.92-4.66 4.92-2.66 0-4.39-1.58-4.39-3.98 0-2.7 2.06-4.18 5.13-3.84v3.25c-1.14-0.18-1.82 0.22-1.82 0.94 0 0.62 0.54 1.02 1.32 1.02 0.92 0 1.34-0.54 1.34-1.72V4.2h2.98Z"
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
    if (route.name === "acerca") {
      document.title = "Lars | Acerca";
      return;
    }

    if (route.name === "gastos") {
      document.title = "Lars | Gastos Comunes";
      return;
    }

    if (route.name === "ventas") {
      document.title = "Lars | Ventas";
      return;
    }

    if (route.name === "alquileres") {
      document.title = "Lars | Alquileres";
      return;
    }

    if (route.name === "proyectos") {
      document.title = "Lars | Proyectos";
      return;
    }

    if (route.name === "propiedad") {
      document.title = activeProperty ? `Lars | ${activeProperty.title}` : "Lars | Propiedad";
      return;
    }

    if (route.name === "contacto") {
      document.title = "Lars | Contacto";
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

  const activeFooterBranch = topbarBranches[getWrappedIndex(footerBranchIndex, topbarBranches.length)];
  const pageShellClassName = [
    "page-shell",
    route.name !== "home" ? "page-shell-sales" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={pageShellClassName}>
      <div className="topbar">
        <div className="container topbar-inner">
          <div className="topbar-branch">
            <TopbarBranchInfo branch={topbarBranches[0]} />
          </div>

          <div className="topbar-branch">
            <TopbarBranchInfo branch={topbarBranches[1]} />
          </div>

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
              <span>Clientes</span>
            </button>
            <button type="button" className="header-action-button">
              <span>Sueldos</span>
            </button>
          </div>
        </div>
      </header>

      <main>
        {route.name === "acerca" ? (
          <AboutPage />
        ) : route.name === "gastos" ? (
          <CommonExpensesPage />
        ) : route.name === "ventas" ? (
          <SalesPage showLoaderDemo />
        ) : route.name === "alquileres" ? (
          <SalesPage listingContext="alquileres" resultsTitle="Propiedades en alquiler" />
        ) : route.name === "proyectos" ? (
          <ProjectsPage />
        ) : route.name === "propiedad" ? (
          <PropertyDetailsPage propertyId={route.propertyId} />
        ) : route.name === "contacto" ? (
          <ContactSection />
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
              <p className="hero-tagline">
                Más de medio siglo de seriedad brindando un servicio integral y a la vanguardia en el rubro inmobiliario
              </p>
              <div className="hero-actions">
                <a className="primary-button search-cta-button" href="#propiedades">
                  Ver propiedades
                </a>
                <a className="hero-link-button" href="/gastos-comunes">
                  Consultar gastos comunes
                </a>
              </div>
            </div>

            <aside className="hero-insight-panel reveal reveal-delay-2" aria-label="Resumen de servicios Lars">
              <div className="hero-insight-heading">
                <span>Hoy en Lars</span>
                <strong>Información de interés general</strong>
              </div>

              <div className="hero-insight-list">
                {heroHighlights.map((item) => (
                  <a key={item.title} className="hero-insight-item" href={item.href}>
                    <span className="hero-insight-icon">
                      <HeroInsightIcon kind={item.icon} />
                    </span>
                    <div>
                      <h2>{item.title}</h2>
                      <p>{item.detail}</p>
                    </div>
                  </a>
                ))}
              </div>

              <a className="hero-panel-link" href="#contacto">
                Contactarme
              </a>
            </aside>

          </div>
        </section>

            <section className="hero-search-band">
          <div className="container search-wrap" id="buscador">
            <div className="search-stack">
              <form className="search-card reveal reveal-delay-3">
                <div className="search-header">
                  <div>
                    <h2>
                      <span className="search-title-icon">
                        <SearchIcon />
                      </span>
                      Buscador de propiedades
                    </h2>
                  </div>
                </div>

                <div className="search-grid">
                  <label className="search-field-compact">
                    Operación
                    <select defaultValue="venta">
                      <option value="venta">Venta</option>
                      <option value="alquiler">Alquiler</option>
                      <option value="proyectos">Proyectos</option>
                    </select>
                  </label>
                  <label className="search-field-compact">
                    Tipo
                    <select defaultValue="apartamento">
                      <option value="apartamento">Apartamento</option>
                      <option value="casa">Casa</option>
                      <option value="oficina">Oficina</option>
                      <option value="terreno">Terreno</option>
                    </select>
                  </label>
                  <label className="search-field-standard search-field-zone">
                    Zona
                    <input type="text" placeholder="Ej: Pocitos, Carrasco o referencia" />
                  </label>
                  <label className="search-field-compact">
                    Dormitorios
                    <select defaultValue="">
                      <option value="" />
                      <option value="1">1 dormitorio</option>
                      <option value="2">2 dormitorios</option>
                      <option value="3">3 dormitorios</option>
                      <option value="4+">4 o más</option>
                    </select>
                  </label>
                  <label className="search-field-compact">
                    Baños
                    <select defaultValue="">
                      <option value="" />
                      <option value="1">1 baño</option>
                      <option value="2">2 baños</option>
                      <option value="3">3 baños</option>
                      <option value="4+">4 o más</option>
                    </select>
                  </label>
                  <label className="search-field-compact search-field-reference">
                    Nº de ref.
                    <input type="text" placeholder="Ej: 1234" />
                  </label>
                  <label className="search-field-standard">
                    Precio
                    <select defaultValue="mid">
                      <option value="mid">US$ 120.000 - 250.000</option>
                      <option value="low">Hasta US$ 120.000</option>
                      <option value="high">Más de US$ 250.000</option>
                    </select>
                  </label>
                </div>

                <div className="search-actions">
                  <div className="search-action-buttons">
                    <button type="button" className="primary-button search-cta-button">
                      Buscar
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </section>

            <section className="section section-listings" id="propiedades">
          <div className="container">
            <SectionHeader
              title="Propiedades destacadas"
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
                    aria-label="Ver más propiedades"
                  >
                    <CarouselArrowIcon direction="right" />
                  </button>
                </div>
              </div>

              <div className="listing-carousel-dots" aria-label="Paginación de propiedades">
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

            <ContactSection />
          </>
        )}
      </main>

      <WhatsAppFloatingButton />

      <footer className="site-footer">
        <div className="container footer-inner">
          <div
            className="footer-branch"
            key={activeFooterBranch.office}
            aria-live="polite"
            aria-label={`${activeFooterBranch.office}: ${activeFooterBranch.address}, ${activeFooterBranch.phone}`}
          >
            <span className="footer-branch-name">{activeFooterBranch.office}</span>
            <span className="footer-branch-separator" aria-hidden="true">-</span>
            <span className="footer-branch-details">
              <span>{activeFooterBranch.address}</span>
              <span className="footer-branch-separator" aria-hidden="true">-</span>
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
            <a href="https://www.tiktok.com/" aria-label="TikTok">
              <FooterSocialIcon kind="tiktok" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
