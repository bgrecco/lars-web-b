import { useEffect, useRef, useState, type FormEvent } from "react";
import { fetchHome, fetchPropertyByRef, isAbortError } from "./api/larsApi";
import ContactSection from "./components/ContactSection";
import WhatsAppFloatingButton from "./components/WhatsAppFloatingButton";
import { shouldUseMockCatalog } from "./config/dataSource";
import AboutPage from "./pages/AboutPage";
import CommonExpensesPage from "./pages/CommonExpensesPage";
import ProjectDetailsPage from "./pages/ProjectDetailsPage";
import PropertyAdminPage from "./pages/PropertyAdminPage";
import PropertyDetailsPage from "./pages/PropertyDetailsPage";
import PropertyManagementPage from "./pages/PropertyManagementPage";
import ProjectsPage from "./pages/ProjectsPage";
import SalesPage from "./pages/SalesPage";
import { getSalesPropertyUrl, type SalesProperty } from "./data/salesCatalog";

type NavRoute =
  | "home"
  | "ventas"
  | "alquileres"
  | "propietarios"
  | "proyectos"
  | "gastos"
  | "acerca"
  | "contacto";

type NavLink = {
  label: string;
  href: string;
  route?: NavRoute;
  children?: Array<{
    label: string;
    href: string;
  }>;
};

type AppRoute =
  | { name: "home" }
  | { name: "acerca" }
  | { name: "gastos" }
  | { name: "ventas" }
  | { name: "alquileres" }
  | { name: "administracion-propiedades" }
  | { name: "propietarios" }
  | { name: "proyectos" }
  | { name: "proyecto"; projectSlug: string | null }
  | { name: "contacto" }
  | { name: "propiedad"; propertyRef: string | null; propertyOrigin: "ventas" | "alquileres" };

type ListingMedia = {
  image: string;
  thumbImage?: string;
  alt: string;
  objectPosition?: string;
};

type Listing = {
  id: number;
  ref: string;
  origin?: "ventas" | "alquileres";
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

type SearchDropdownOption = {
  value: string;
  label: string;
};

type SearchDropdownFieldProps = {
  active: boolean;
  className: string;
  label: string;
  onSelect: (value: string) => void;
  onToggle: () => void;
  options: SearchDropdownOption[];
  value: string;
};

const homeSearchButtonVariant = "glow" as const;
const homeHeaderAccessVariant = "icon-links" as const;
const maxFeaturedListingSecondaryImages = 4;

function buildListingGallery(title: string, primaryImage: string): ListingMedia[] {
  return [
    {
      image: primaryImage,
      thumbImage: primaryImage.replace("-main.webp", "-thumb.webp"),
      alt: `${title} vista principal`,
      objectPosition: "center center",
    },
    {
      image: "/optimized/home/1-main.webp",
      thumbImage: "/optimized/home/1-thumb.webp",
      alt: `${title} fachada y acceso`,
      objectPosition: "center center",
    },
    {
      image: "/optimized/home/2-main.webp",
      thumbImage: "/optimized/home/2-thumb.webp",
      alt: `${title} ambiente interior complementario`,
      objectPosition: "center center",
    },
    {
      image: "/optimized/home/3-main.webp",
      thumbImage: "/optimized/home/3-thumb.webp",
      alt: `${title} fachada alternativa`,
      objectPosition: "center center",
    },
  ];
}

function getPropertyListingOrigin(property: SalesProperty): "ventas" | "alquileres" {
  const operationText = property.operation?.toLowerCase() ?? "";

  if (operationText.includes("alquiler")) {
    return "alquileres";
  }

  if (operationText.includes("venta")) {
    return "ventas";
  }

  const operationsText = (property.operations ?? []).join(" ").toLowerCase();

  return operationsText.includes("alquiler") ? "alquileres" : "ventas";
}

function getPropertyOperationLabel(property: SalesProperty) {
  const operation = property.operation?.trim();

  if (operation?.toLowerCase().includes("alquiler")) {
    return "Alquiler";
  }

  if (operation?.toLowerCase().includes("venta")) {
    return "Venta";
  }

  return getPropertyListingOrigin(property) === "alquileres" ? "Alquiler" : "Venta";
}

function propertyToListing(property: SalesProperty): Listing {
  const fallbackImage = property.image || property.cardImage;
  const gallery = property.gallery.length
    ? property.gallery
    : [
        {
          image: fallbackImage,
          thumbImage: property.cardImage || fallbackImage,
          alt: `${property.title} vista principal`,
          objectPosition: property.imagePosition,
        },
      ];
  const listingGallery = gallery.slice(0, maxFeaturedListingSecondaryImages + 1);
  const firstImage = listingGallery[0]?.image || fallbackImage;

  return {
    id: property.id,
    ref: property.ref,
    origin: getPropertyListingOrigin(property),
    operation: getPropertyOperationLabel(property),
    title: property.title,
    price: property.price,
    location: property.location,
    rooms: property.rooms,
    bathrooms: property.bathrooms,
    size: property.size,
    image: firstImage,
    gallery: listingGallery.map((media, index) => ({
      image: media.image,
      thumbImage: media.thumbImage,
      alt: media.alt || `${property.title} imagen ${index + 1}`,
      objectPosition: media.objectPosition ?? property.imagePosition,
    })),
  };
}

function SearchDropdownField(props: SearchDropdownFieldProps) {
  const { active, className, label, onSelect, onToggle, options, value } = props;
  const selectedOption = options.find((option) => option.value === value) ?? options[0];

  return (
    <label className={`${className} search-field-select`}>
      <span className="search-field-heading">{label}</span>
      <button
        type="button"
        className={`search-select-trigger${active ? " is-open" : ""}`}
        aria-expanded={active}
        aria-haspopup="listbox"
        onClick={onToggle}
      >
        <span>{selectedOption.label}</span>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {active ? (
        <div className="search-select-popover" role="listbox" aria-label={label}>
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`search-select-option${option.value === value ? " is-active" : ""}`}
              aria-selected={option.value === value}
              onClick={() => onSelect(option.value)}
            >
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      ) : null}
    </label>
  );
}

function HeaderAccessPayrollIcon() {
  return <img src="/optimized/sections/salary.svg" alt="" aria-hidden="true" />;
}

function HeaderAccessPersonIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" />
      <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
    </svg>
  );
}

const navLinks: NavLink[] = [
  { label: "Gastos Comunes", href: "/gastos-comunes", route: "gastos" },
  { label: "Ventas", href: "/ventas", route: "ventas" },
  {
    label: "Alquileres",
    href: "/alquileres",
    route: "alquileres",
    children: [
      { label: "Propiedades en alquiler", href: "/alquileres" },
      { label: "Administración de propiedades", href: "/alquileres/administracion-de-propiedades" },
    ],
  },
  { label: "Nosotros", href: "/acerca", route: "acerca" },
  { label: "Contacto", href: "/contacto", route: "contacto" },
];

const mobileNavLinks: NavLink[] = [
  ...navLinks.slice(0, 3),
  { label: "Proyectos", href: "/proyectos", route: "proyectos" },
  ...navLinks.slice(3),
];

const mobileQuickLinks = [
  { label: "Sueldos" },
  { label: "Clientes" },
];
const featuredPropertyRef = "10000";
const featuredListings: Listing[] = [
  {
    id: 4,
    ref: "0004",
    origin: "alquileres",
    operation: "Alquiler",
    title: "Villa Dolores Loft",
    price: "$171.000",
    location: "Villa Dolores",
    rooms: 3,
    bathrooms: 2,
    size: "46 m²",
    image: "/optimized/home/property-villa-dolores-main.webp",
    gallery: buildListingGallery("Villa Dolores Loft", "/optimized/home/property-villa-dolores-main.webp"),
    videoSrc: "/hero-bg.mp4",
  },
  {
    id: 1,
    ref: "0001",
    operation: "Venta",
    title: "Pocitos Classic",
    price: "US$ 321.000",
    location: "Pocitos",
    rooms: 3,
    bathrooms: 2,
    size: "46 m²",
    image: "/optimized/home/property-pocitos-main.webp",
    gallery: buildListingGallery("Pocitos Classic", "/optimized/home/property-pocitos-main.webp"),
  },
  {
    id: 2,
    ref: "0002",
    operation: "Venta",
    title: "Punta Carretas Loft",
    price: "US$ 121.000",
    location: "Punta Carretas",
    rooms: 2,
    bathrooms: 1,
    size: "46 m²",
    image: "/optimized/home/property-punta-carretas-main.webp",
    gallery: buildListingGallery("Punta Carretas Loft", "/optimized/home/property-punta-carretas-main.webp"),
  },
  {
    id: 3,
    ref: "0003",
    operation: "Venta",
    title: "La Blanqueada Studio",
    price: "US$ 121.000",
    location: "La Blanqueada",
    rooms: 2,
    bathrooms: 1,
    size: "46 m²",
    image: "/optimized/home/property-la-blanqueada-main.webp",
    gallery: buildListingGallery("La Blanqueada Studio", "/optimized/home/property-la-blanqueada-main.webp"),
  },
];

const topbarBranches = [
  {
    office: "Casa central",
    address: "Minas 1401",
    mapsHref: "https://www.google.com/maps/search/?api=1&query=Minas+1401,+Montevideo,+Uruguay",
    phone: "2401 01 01",
    phoneHref: "tel:+59824010101",
  },
  {
    office: "Sucursal Pocitos Nuevo",
    address: "Av. Gral Rivera 3471",
    mapsHref: "https://www.google.com/maps/search/?api=1&query=Av.+Gral+Rivera+3471,+Montevideo,+Uruguay",
    phone: "2622 50 50",
    phoneHref: "tel:+59826225050",
  },
];

const searchNeighborhoodOptions = [
  "Buceo",
  "Carrasco",
  "Centro",
  "Cordón",
  "La Blanqueada",
  "Malvin",
  "Parque Rodó",
  "Pocitos",
  "Punta Carretas",
  "Tres Cruces",
  "Villa Dolores",
];

const searchOperationOptions: SearchDropdownOption[] = [
  { value: "venta", label: "Venta" },
  { value: "alquiler", label: "Alquiler" },
  { value: "proyectos", label: "Proyectos" },
];

const searchTypeOptions: SearchDropdownOption[] = [
  { value: "apartamento", label: "Apartamento" },
  { value: "casa", label: "Casa" },
  { value: "oficina", label: "Oficina" },
  { value: "terreno", label: "Terreno" },
  { value: "proyectos", label: "Proyectos" },
];

const searchBedroomOptions: SearchDropdownOption[] = [
  { value: "0", label: "0" },
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4+", label: "4 +" },
];

const searchZoneDropdownOptions: SearchDropdownOption[] = [
  { value: "", label: "Todos" },
  ...searchNeighborhoodOptions.map((option) => ({ value: option, label: option })),
];

function SectionHeader(props: {
  title: string;
  description: string;
  className?: string;
  inverse?: boolean;
}) {
  const { title, description, className = "", inverse = false } = props;
  const hasDescription = description.trim().length > 0;

  return (
    <div className={`section-heading section-title-frame reveal${className ? ` ${className}` : ""}${inverse ? " section-heading-inverse" : ""}`}>
      <h2>{title}</h2>
      {hasDescription ? <p>{description}</p> : null}
    </div>
  );
}

function getWrappedIndex(index: number, length: number) {
  return ((index % length) + length) % length;
}

function normalizePathname(pathname: string) {
  return pathname.replace(/\/+$/, "") || "/";
}

function getCanonicalPropertyPath(pathname: string) {
  const normalizedPathname = normalizePathname(pathname);
  const legacyPropertyMatch = normalizedPathname.match(/^\/propiedades\/([^/]+)$/);
  const shortPropertyMatch = normalizedPathname.match(/^\/(\d+)$/);
  const propertyRef = legacyPropertyMatch?.[1] ?? shortPropertyMatch?.[1];

  return propertyRef ? `/ficha/${propertyRef}` : null;
}

function getPropertyOriginFromSearch() {
  const origin = new URLSearchParams(window.location.search).get("origen");

  return origin === "alquileres" || origin === "alquiler" ? "alquileres" : "ventas";
}

function getRouteFromPathname(pathname: string): AppRoute {
  const normalizedPathname = normalizePathname(pathname);

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

  if (
    normalizedPathname === "/administracion-propiedades" ||
    normalizedPathname === "/alquileres/administracion-de-propiedades"
  ) {
    return { name: "administracion-propiedades" };
  }

  if (normalizedPathname === "/propietarios") {
    return { name: "propietarios" };
  }

  if (normalizedPathname === "/proyectos") {
    return { name: "proyectos" };
  }

  const projectMatch = normalizedPathname.match(/^\/proyectos\/([^/]+)$/);

  if (projectMatch) {
    return { name: "proyecto", projectSlug: decodeURIComponent(projectMatch[1]) || null };
  }

  if (normalizedPathname === "/contacto") {
    return { name: "contacto" };
  }

  const propertyMatch = normalizedPathname.match(/^\/ficha\/([^/]+)$/);

  if (propertyMatch) {
    const propertyRef = decodeURIComponent(propertyMatch[1]).trim();
    return {
      name: "propiedad",
      propertyRef: propertyRef || null,
      propertyOrigin: getPropertyOriginFromSearch(),
    };
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
  const secondaryMedia = listing.gallery.slice(1, maxFeaturedListingSecondaryImages + 1);
  const listingHref = getSalesPropertyUrl(listing.ref, listing.origin);
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
        <a
          href={listingHref}
          className={`listing-showcase-main-image-wrap${hasVideoPreview ? " has-video-preview" : ""}${isVideoPreviewActive ? " is-video-active" : ""}`}
          onMouseEnter={hasVideoPreview ? () => setIsVideoPreviewActive(true) : undefined}
          onMouseLeave={hasVideoPreview ? () => setIsVideoPreviewActive(false) : undefined}
          aria-label={`Ver detalles de ${listing.title}`}
        >
          <img
            src={currentMedia.image}
            alt={currentMedia.alt}
            className="listing-showcase-main-image"
            loading="lazy"
            decoding="async"
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
        </a>
      </div>

      <div className="listing-showcase-side">
        <div className="listing-showcase-header">
          <div className="listing-showcase-copy">
            <h3>{listing.title}</h3>
            <p>{listing.location}</p>
          </div>

          <div className="listing-showcase-stats" aria-label="Detalles de la propiedad">
            <div className="listing-showcase-stat">
              <img src="/optimized/home/icon-dorm.webp" alt="" />
              <span>{listing.rooms}</span>
            </div>
            <div className="listing-showcase-stat">
              <img src="/optimized/home/icon-banos.webp" alt="" />
              <span>{listing.bathrooms}</span>
            </div>
            <div className="listing-showcase-stat">
              <img src="/optimized/home/icon-sup.webp" alt="" />
              <span>{listing.size}</span>
            </div>
          </div>
        </div>

        <div className="listing-showcase-thumbs" aria-label={`Imágenes secundarias de ${listing.title}`}>
          {secondaryMedia.map((media, mediaIndex) => {
            const index = mediaIndex + 1;

            return interactive && onMediaSelect ? (
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
                  src={media.thumbImage ?? media.image}
                  alt=""
                  aria-hidden="true"
                  className="listing-showcase-thumb-image"
                  loading="lazy"
                  decoding="async"
                  style={{ objectPosition: media.objectPosition ?? "center center" }}
                />
              </button>
            ) : (
              <div
                key={`${listing.title}-${media.image}-${index}`}
                className={`listing-showcase-thumb${index === 1 ? " is-active" : ""}`}
                aria-hidden="true"
              >
                <img
                  src={media.thumbImage ?? media.image}
                  alt=""
                  aria-hidden="true"
                  className="listing-showcase-thumb-image"
                  loading="lazy"
                  decoding="async"
                  style={{ objectPosition: media.objectPosition ?? "center center" }}
                />
              </div>
            );
          })}
        </div>

        <div className="listing-showcase-footer">
          <div className="listing-showcase-price">
            <span className="listing-showcase-price-value">{listing.price}</span>
          </div>
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
      <img
        src={listing.image}
        alt=""
        aria-hidden="true"
        className="listing-showcase-preview-image"
        loading="lazy"
        decoding="async"
      />
    </button>
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
      <a className="topbar-info-item topbar-address-link" href={branch.mapsHref} target="_blank" rel="noreferrer">
        <TopbarIcon kind="location" />
        <span>{branch.address}</span>
      </a>
      <a className="topbar-info-item" href={branch.phoneHref}>
        <TopbarIcon kind="phone" />
        <span>{branch.phone}</span>
      </a>
    </>
  );
}

function HamburgerIcon(props: { isOpen: boolean }) {
  const { isOpen } = props;

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {isOpen ? (
        <>
          <path d="M6 6 18 18" />
          <path d="M18 6 6 18" />
        </>
      ) : (
        <>
          <path d="M4 7h16" />
          <path d="M4 12h16" />
          <path d="M4 17h16" />
        </>
      )}
    </svg>
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

type SearchPriceCurrency = "usd" | "uyu";

const searchPriceMinLimit = 0;
const searchPriceMaxLimit = 500000;
const searchPriceStep = 5000;

function clampSearchPriceValue(value: number) {
  return Math.min(searchPriceMaxLimit, Math.max(searchPriceMinLimit, value));
}

function formatSearchPriceValue(currency: SearchPriceCurrency, value: number) {
  const symbol = currency === "usd" ? "US$" : "$";
  return `${symbol} ${value.toLocaleString("es-UY")}`;
}

function getHomeSearchTypeParam(type: string) {
  return searchTypeOptions.find((option) => option.value === type)?.label ?? "";
}

function App() {
  const canonicalPropertyPath = getCanonicalPropertyPath(window.location.pathname);

  if (canonicalPropertyPath) {
    window.history.replaceState(
      null,
      "",
      `${canonicalPropertyPath}${window.location.search}${window.location.hash}`,
    );
  }

  const pathname = normalizePathname(window.location.pathname);
  const route = getRouteFromPathname(pathname);
  const activeNavRoute: NavRoute =
    route.name === "propiedad"
      ? route.propertyOrigin
      : route.name === "proyecto"
        ? "proyectos"
        : route.name === "administracion-propiedades"
          ? "alquileres"
          : route.name === "propietarios"
            ? "propietarios"
            : route.name;
  const [listingIndex, setListingIndex] = useState(0);
  const [listingMediaIndex, setListingMediaIndex] = useState(0);
  const [listingTransitionDirection, setListingTransitionDirection] = useState<"left" | "right" | null>(null);
  const [listingMotionKey, setListingMotionKey] = useState(0);
  const [homeFeaturedListings, setHomeFeaturedListings] = useState<Listing[]>(featuredListings);
  const [footerBranchIndex, setFooterBranchIndex] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileRentMenuOpen, setIsMobileRentMenuOpen] = useState(false);
  const [isMobileSearchFiltersOpen, setIsMobileSearchFiltersOpen] = useState(false);
  const [shouldLoadHeroVideo, setShouldLoadHeroVideo] = useState(false);
  const [isHeroVideoPlaying, setIsHeroVideoPlaying] = useState(false);
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [searchPriceMin, setSearchPriceMin] = useState(0);
  const [searchPriceMax, setSearchPriceMax] = useState(searchPriceMaxLimit);
  const [hasSearchPriceRange, setHasSearchPriceRange] = useState(false);
  const [searchOperation, setSearchOperation] = useState("venta");
  const [searchType, setSearchType] = useState("apartamento");
  const [searchBedrooms, setSearchBedrooms] = useState("");
  const [searchZone, setSearchZone] = useState("");
  const [searchReference, setSearchReference] = useState("");
  const [activeSearchDropdown, setActiveSearchDropdown] = useState<"operation" | "type" | "zone" | "price" | "bedrooms" | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);
  const homeSearchFormRef = useRef<HTMLFormElement | null>(null);
  const heroVideoRef = useRef<HTMLVideoElement | null>(null);
  const isHomeRentalSearch = searchOperation === "alquiler";

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 480px)");

    const handleChange = (event: MediaQueryListEvent | MediaQueryList) => {
      setIsSmallScreen(event.matches);
    };

    handleChange(mediaQuery);

    if ("addEventListener" in mediaQuery) {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }

    const legacyMediaQuery = mediaQuery as MediaQueryList & {
      addListener: (listener: (event: MediaQueryListEvent) => void) => void;
      removeListener: (listener: (event: MediaQueryListEvent) => void) => void;
    };

    legacyMediaQuery.addListener(handleChange);
    return () => legacyMediaQuery.removeListener(handleChange);
  }, []);

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>(".reveal:not(.reveal-early)"));
    const earlyElements = Array.from(document.querySelectorAll<HTMLElement>(".reveal-early"));

    if (!("IntersectionObserver" in window)) {
      [...elements, ...earlyElements].forEach((element) => element.classList.add("is-visible"));
      return;
    }

    const handleRevealEntries: IntersectionObserverCallback = (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    };

    const observer = new IntersectionObserver(
      handleRevealEntries,
      {
        threshold: 0.16,
        rootMargin: "0px 0px -10% 0px",
      },
    );

    const earlyObserver = new IntersectionObserver(
      handleRevealEntries,
      {
        threshold: 0.01,
        rootMargin: "0px 0px 24% 0px",
      },
    );

    elements.forEach((element) => observer.observe(element));
    earlyElements.forEach((element) => earlyObserver.observe(element));

    return () => {
      observer.disconnect();
      earlyObserver.disconnect();
    };
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

    if (route.name === "administracion-propiedades") {
      document.title = "Lars | Administración de propiedades";
      return;
    }

    if (route.name === "propietarios") {
      document.title = "Lars | Propietarios";
      return;
    }

    if (route.name === "proyectos") {
      document.title = "Lars | Proyectos";
      return;
    }

    if (route.name === "proyecto") {
      document.title = "Lars | Proyecto";
      return;
    }

    if (route.name === "propiedad") {
      document.title = "Lars | Propiedad";
      return;
    }

    if (route.name === "contacto") {
      document.title = "Lars | Contacto";
      return;
    }

    document.title = "Lars";
  }, [route.name]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsMobileRentMenuOpen(false);
  }, [pathname]);

  const hasHomeScrollHeaderEffect =
    route.name === "home" || route.name === "acerca" || route.name === "ventas" || route.name === "alquileres";

  useEffect(() => {
    if (!hasHomeScrollHeaderEffect) {
      setIsHeaderScrolled(false);
      return;
    }

    const handleScroll = () => {
      setIsHeaderScrolled(window.scrollY > 8);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasHomeScrollHeaderEffect]);

  const listingCount = homeFeaturedListings.length;
  const activeListing = homeFeaturedListings[getWrappedIndex(listingIndex, listingCount)];
  const previousPreviewListing = homeFeaturedListings[getWrappedIndex(listingIndex - 1, listingCount)];
  const nextPreviewListing = homeFeaturedListings[getWrappedIndex(listingIndex + 1, listingCount)];
  const activeHomeSearchButtonDemo = homeSearchButtonVariant;
  const activeHomeHeaderAccessDemo = homeHeaderAccessVariant;

  useEffect(() => {
    if (route.name !== "home") {
      return;
    }

    if (shouldUseMockCatalog) {
      setHomeFeaturedListings(featuredListings);
      setListingIndex(0);
      setListingMediaIndex(0);
      setListingTransitionDirection(null);
      return;
    }

    const controller = new AbortController();

    Promise.all([
      fetchHome(controller.signal),
      fetchPropertyByRef(featuredPropertyRef, controller.signal).catch(() => undefined),
    ])
      .then(([home, featuredProperty]) => {
        const baseFeaturedProperties = home.destacadas.length
          ? home.destacadas
          : [...home.alquileres.slice(0, 1), ...home.ventas].slice(0, featuredListings.length);
        const featuredProperties =
          featuredProperty && !baseFeaturedProperties.some((property) => property.ref === featuredProperty.ref)
            ? [featuredProperty, ...baseFeaturedProperties].slice(0, featuredListings.length)
            : baseFeaturedProperties;
        const nextListings = featuredProperties.map(propertyToListing);

        if (!nextListings.length) {
          return;
        }

        setHomeFeaturedListings(nextListings);
        setListingIndex(0);
        setListingMediaIndex(0);
        setListingTransitionDirection(null);
        setListingMotionKey((currentKey) => currentKey + 1);
      })
      .catch((error: unknown) => {
        if (!isAbortError(error)) {
          setHomeFeaturedListings(featuredListings);
        }
      });

    return () => controller.abort();
  }, [route.name]);

  useEffect(() => {
    setListingMediaIndex(0);
  }, [listingIndex]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setFooterBranchIndex((currentIndex) => getWrappedIndex(currentIndex + 1, topbarBranches.length));
    }, 4200);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (route.name !== "home") {
      setShouldLoadHeroVideo(false);
      setIsHeroVideoPlaying(false);
      return;
    }

    setIsHeroVideoPlaying(false);

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const supportsConnection = "connection" in navigator;
    const connection = supportsConnection
      ? (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
      : undefined;

    if (reducedMotion || connection?.saveData) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setShouldLoadHeroVideo(true);
    }, 500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [route.name]);

  useEffect(() => {
    const video = heroVideoRef.current;

    if (!shouldLoadHeroVideo || !video) {
      return;
    }

    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");

    const playback = video.play();
    playback
      ?.then(() => {
        setIsHeroVideoPlaying(true);
      })
      .catch(() => {
        setIsHeroVideoPlaying(false);
      });
  }, [shouldLoadHeroVideo]);

  useEffect(() => {
    if (!activeSearchDropdown) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;

      if (!homeSearchFormRef.current?.contains(target)) {
        setActiveSearchDropdown(null);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveSearchDropdown(null);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeSearchDropdown]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1081px)");

    const handleChange = (event: MediaQueryListEvent | MediaQueryList) => {
      if (event.matches) {
        setIsMobileMenuOpen(false);
        setIsMobileRentMenuOpen(false);
      }
    };

    handleChange(mediaQuery);

    if ("addEventListener" in mediaQuery) {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }

    const legacyMediaQuery = mediaQuery as MediaQueryList & {
      addListener: (listener: (event: MediaQueryListEvent) => void) => void;
      removeListener: (listener: (event: MediaQueryListEvent) => void) => void;
    };

    legacyMediaQuery.addListener(handleChange);
    return () => legacyMediaQuery.removeListener(handleChange);
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!mobileMenuRef.current?.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
        setIsMobileRentMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
        setIsMobileRentMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileMenuOpen]);

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

  const handleSearchPriceMinChange = (value: string) => {
    if (isHomeRentalSearch) {
      setSearchPriceMin(searchPriceMinLimit);
      setHasSearchPriceRange(searchPriceMax < searchPriceMaxLimit);
      return;
    }

    const nextMin = Math.min(clampSearchPriceValue(Number(value)), searchPriceMax);
    setSearchPriceMin(nextMin);
    setHasSearchPriceRange(nextMin > searchPriceMinLimit || searchPriceMax < searchPriceMaxLimit);
  };

  const handleSearchPriceMaxChange = (value: string) => {
    const minimumPrice = isHomeRentalSearch ? searchPriceMinLimit : searchPriceMin;
    const nextMax = Math.max(clampSearchPriceValue(Number(value)), minimumPrice);
    setSearchPriceMax(nextMax);
    setHasSearchPriceRange(minimumPrice > searchPriceMinLimit || nextMax < searchPriceMaxLimit);
  };

  const handleSearchPriceMinInputChange = (value: string) => {
    const numericValue = value.replace(/\D/g, "");

    if (!numericValue) {
      setSearchPriceMin(searchPriceMinLimit);
      setHasSearchPriceRange(searchPriceMax < searchPriceMaxLimit);
      return;
    }

    handleSearchPriceMinChange(numericValue);
  };

  const handleSearchPriceMaxInputChange = (value: string) => {
    const numericValue = value.replace(/\D/g, "");

    if (!numericValue) {
      setSearchPriceMax(searchPriceMaxLimit);
      setHasSearchPriceRange(searchPriceMin > searchPriceMinLimit);
      return;
    }

    handleSearchPriceMaxChange(numericValue);
  };

  const searchPriceCurrency: SearchPriceCurrency = searchOperation === "venta" ? "usd" : "uyu";

  const handleHomeSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (searchOperation === "proyectos" || searchType === "proyectos") {
      window.location.href = "/proyectos";
      return;
    }

    const searchParams = new URLSearchParams();
    const typeParam = getHomeSearchTypeParam(searchType);
    const trimmedReference = searchReference.trim();
    const effectiveSearchPriceMin = isHomeRentalSearch ? searchPriceMinLimit : searchPriceMin;
    const hasPriceFilter = effectiveSearchPriceMin > searchPriceMinLimit || searchPriceMax < searchPriceMaxLimit;
    const targetPath = searchOperation === "alquiler" ? "/alquileres" : "/ventas";

    if (typeParam && typeParam !== "Proyectos") {
      searchParams.set("tipo", typeParam);
    }

    if (searchZone) {
      searchParams.set("barrio", searchZone);
    }

    if (searchBedrooms) {
      searchParams.set("dormitorios", searchBedrooms);
    }

    if (hasPriceFilter) {
      searchParams.set("precioMoneda", searchPriceCurrency);
    }

    if (effectiveSearchPriceMin > searchPriceMinLimit) {
      searchParams.set("precioMinimo", String(effectiveSearchPriceMin));
    }

    if (searchPriceMax < searchPriceMaxLimit) {
      searchParams.set("precioMaximo", String(searchPriceMax));
    }

    if (trimmedReference) {
      searchParams.set("ref", trimmedReference);
    }

    const queryString = searchParams.toString();

    window.location.href = `${targetPath}${queryString ? `?${queryString}` : ""}`;
  };

  const searchPriceSummary = !hasSearchPriceRange
    ? "Todos"
    : isHomeRentalSearch && searchPriceMax < searchPriceMaxLimit
      ? `Hasta ${formatSearchPriceValue(searchPriceCurrency, searchPriceMax)}`
      : searchPriceMin > searchPriceMinLimit && searchPriceMax < searchPriceMaxLimit
      ? `${formatSearchPriceValue(searchPriceCurrency, searchPriceMin)} - ${formatSearchPriceValue(searchPriceCurrency, searchPriceMax)}`
      : searchPriceMin > searchPriceMinLimit
        ? `Desde ${formatSearchPriceValue(searchPriceCurrency, searchPriceMin)}`
        : `Hasta ${formatSearchPriceValue(searchPriceCurrency, searchPriceMax)}`;
  const hasFullSearchPriceRange = searchPriceMin > searchPriceMinLimit && searchPriceMax < searchPriceMaxLimit;
  const activeFooterBranch = topbarBranches[getWrappedIndex(footerBranchIndex, topbarBranches.length)];
  const pageShellClassName = [
    "page-shell",
    route.name === "home" ? "page-shell-home" : "",
    route.name === "acerca" ? "page-shell-about" : "",
    route.name === "ventas" || route.name === "alquileres" ? "page-shell-catalog" : "",
    route.name === "ventas" ? "page-shell-ventas" : "",
    route.name === "alquileres" ? "page-shell-alquileres" : "",
    route.name !== "home" && route.name !== "acerca" ? "page-shell-sales" : "",
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

      <header className={`site-header${isMobileMenuOpen ? " is-mobile-menu-open" : ""}${isHeaderScrolled ? " is-header-scrolled" : ""}`}>
        <div className="container header-inner" ref={mobileMenuRef}>
          <a className="logo-link" href="/#inicio" aria-label="Volver al inicio">
            <img src="/optimized/home/logo.webp" alt="Lars" className="brand-logo" width="352" height="93" />
          </a>
          <nav className="site-nav" aria-label="Principal">
            {navLinks.map((item) =>
              item.children ? (
                <div
                  key={item.label}
                  className={`site-nav-dropdown${item.route === activeNavRoute ? " is-active" : ""}`}
                >
                  <a
                    href={item.href}
                    className="site-nav-dropdown-trigger"
                    aria-current={item.route === activeNavRoute ? "page" : undefined}
                  >
                    {item.label}
                    <span className="site-nav-dropdown-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24">
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </span>
                  </a>

                  <div className="site-nav-dropdown-menu">
                    {item.children.map((child) => (
                      <a key={child.label} href={child.href}>
                        {child.label}
                      </a>
                    ))}
                  </div>
                </div>
              ) : (
                <a
                  key={item.label}
                  href={item.href}
                  className={item.route === activeNavRoute ? "is-active" : undefined}
                  aria-current={item.route === activeNavRoute ? "page" : undefined}
                >
                  {item.label}
                </a>
              ),
            )}
          </nav>
          <div className="header-actions" aria-label="Accesos directos">
            <div className={`header-actions-demo-shell header-actions-demo-shell-${activeHomeHeaderAccessDemo}`}>
              <div className="header-access-demo header-access-demo-icon-links">
                <span className="header-access-divider" aria-hidden="true" />
                <button type="button" className="header-access-link header-access-link-icon header-access-link-salary">
                  <HeaderAccessPayrollIcon />
                  <span>Sueldos</span>
                </button>
                <button type="button" className="header-access-link header-access-link-icon">
                  <HeaderAccessPersonIcon />
                  <span>Clientes</span>
                </button>
              </div>
            </div>
          </div>
          <button
            type="button"
            className={`mobile-menu-toggle${isMobileMenuOpen ? " is-open" : ""}`}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-site-nav"
            aria-label={isMobileMenuOpen ? "Cerrar menu principal" : "Abrir menu principal"}
            onClick={() => setIsMobileMenuOpen((currentValue) => !currentValue)}
          >
            <HamburgerIcon isOpen={isMobileMenuOpen} />
            <span className="sr-only">{isMobileMenuOpen ? "Cerrar menu" : "Abrir menu"}</span>
          </button>
          <nav
            id="mobile-site-nav"
            className={`mobile-menu-panel${isMobileMenuOpen ? " is-open" : ""}`}
            aria-label="Principal"
            aria-hidden={!isMobileMenuOpen}
          >
            {mobileNavLinks.map((item) => (
              <div
                key={`mobile-${item.label}`}
                className={`mobile-menu-item${item.route === activeNavRoute ? " is-active" : ""}`}
              >
                {item.children ? (
                  <div className="mobile-menu-row">
                    <button
                      type="button"
                      className="mobile-menu-link mobile-menu-link-button"
                      aria-expanded={isMobileRentMenuOpen}
                      aria-controls="mobile-alquileres-subnav"
                      aria-current={item.route === activeNavRoute ? "page" : undefined}
                      onClick={() => setIsMobileRentMenuOpen((currentValue) => !currentValue)}
                    >
                      <span>{item.label}</span>
                    </button>
                    <button
                      type="button"
                      className={`mobile-menu-expand-toggle${isMobileRentMenuOpen ? " is-open" : ""}`}
                      aria-expanded={isMobileRentMenuOpen}
                      aria-controls="mobile-alquileres-subnav"
                      aria-label={isMobileRentMenuOpen ? "Cerrar submenu de alquileres" : "Abrir submenu de alquileres"}
                      onClick={() => setIsMobileRentMenuOpen((currentValue) => !currentValue)}
                    >
                      <span className="mobile-menu-link-badge" aria-hidden="true">
                        <svg viewBox="0 0 24 24">
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </span>
                    </button>
                  </div>
                ) : (
                  <a
                    href={item.href}
                    className="mobile-menu-link"
                    aria-current={item.route === activeNavRoute ? "page" : undefined}
                  >
                    <span>{item.label}</span>
                  </a>
                )}
                {item.children ? (
                  <div
                    id="mobile-alquileres-subnav"
                    className={`mobile-menu-subnav${isMobileRentMenuOpen ? " is-open" : ""}`}
                    aria-hidden={!isMobileRentMenuOpen}
                  >
                    {item.children.map((child) => (
                      <a
                        key={child.label}
                        href={child.href}
                        className={normalizePathname(child.href) === pathname ? "is-active" : undefined}
                        aria-current={normalizePathname(child.href) === pathname ? "page" : undefined}
                      >
                        {child.label}
                      </a>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
            {mobileQuickLinks.map((item) => (
              <div key={`mobile-quick-${item.label}`} className="mobile-menu-item">
                <button type="button" className="mobile-menu-link mobile-menu-link-button">
                  <span>{item.label}</span>
                </button>
              </div>
            ))}
          </nav>
        </div>
      </header>

      <main>
        {route.name === "acerca" ? (
          <AboutPage />
        ) : route.name === "gastos" ? (
          <CommonExpensesPage />
        ) : route.name === "ventas" ? (
          <SalesPage showLoaderDemo hideResultsTitle />
        ) : route.name === "alquileres" ? (
          <SalesPage listingContext="alquileres" resultsTitle="Alquileres" hideResultsTitle />
        ) : route.name === "administracion-propiedades" ? (
          <PropertyManagementPage />
        ) : route.name === "propietarios" ? (
          <PropertyAdminPage />
        ) : route.name === "proyectos" ? (
          <ProjectsPage />
        ) : route.name === "proyecto" ? (
          <ProjectDetailsPage projectSlug={route.projectSlug} />
        ) : route.name === "propiedad" ? (
          <PropertyDetailsPage propertyRef={route.propertyRef} propertyOrigin={route.propertyOrigin} />
        ) : route.name === "contacto" ? (
          <ContactSection />
        ) : (
          <>
            <section className="hero" id="inicio">
          <div className="hero-media" aria-hidden="true">
            <img
              className="hero-poster"
              src="/optimized/home/hero-video-poster.webp"
              alt=""
              width="1920"
              height="1080"
              decoding="async"
              fetchPriority="high"
            />
            {shouldLoadHeroVideo ? (
              <video
                ref={heroVideoRef}
                className={`hero-video${isHeroVideoPlaying ? " is-playing" : ""}`}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                controls={false}
                disablePictureInPicture
                controlsList="nodownload nofullscreen noremoteplayback"
                tabIndex={-1}
                onPlaying={() => setIsHeroVideoPlaying(true)}
                onPause={() => setIsHeroVideoPlaying(false)}
                onError={() => setIsHeroVideoPlaying(false)}
              >
                <source src="/hero-bg-desktop.mp4" type="video/mp4" media="(min-width: 761px)" />
                <source src="/hero-bg.mp4" type="video/mp4" />
              </video>
            ) : null}
          </div>
          <div className="hero-backdrop" aria-hidden="true" />
          <div className="container hero-stage">
            <div className="hero-content reveal">
              <div className="hero-brand-mark" aria-hidden={!isSmallScreen}>
                <img src="/optimized/home/logo.webp" alt="Lars" className="hero-brand-logo" width="352" height="93" />
              </div>
              <h1>Servimos bien para servir siempre</h1>
              <div className="hero-actions">
                <a className="primary-button" href="/proyectos">
                  Proyectos
                </a>
                <a className="hero-link-button" href="/propietarios">
                  Alquilá o vendé tu propiedad con Lars
                </a>
              </div>
            </div>

            <section className="hero-search-band" id="buscador">
              <div className="search-wrap">
                <div className="search-stack">
                  <form className="search-card search-card-variant-4" ref={homeSearchFormRef} onSubmit={handleHomeSearchSubmit}>
                    <div className="search-grid">
                      <SearchDropdownField
                        active={activeSearchDropdown === "operation"}
                        className="search-field-compact search-field-operation"
                        label="Operación"
                        onSelect={(value) => {
                          if (value === "proyectos") {
                            window.location.href = "/proyectos";
                            return;
                          }

                          setSearchOperation(value);
                          if (value === "alquiler") {
                            setSearchPriceMin(searchPriceMinLimit);
                            setHasSearchPriceRange(searchPriceMax < searchPriceMaxLimit);
                          }
                          setActiveSearchDropdown(null);
                        }}
                        onToggle={() => {
                          setActiveSearchDropdown((currentValue) =>
                            currentValue === "operation" ? null : "operation",
                          );
                        }}
                        options={searchOperationOptions}
                        value={searchOperation}
                      />
                      <SearchDropdownField
                        active={activeSearchDropdown === "type"}
                        className={`search-field-compact search-field-type${
                          searchType === "casa" ? " search-field-type-house" : " search-field-type-building"
                        }`}
                        label="Tipo"
                        onSelect={(value) => {
                          if (value === "proyectos") {
                            window.location.href = "/proyectos";
                            return;
                          }

                          setSearchType(value);
                          setActiveSearchDropdown(null);
                        }}
                        onToggle={() => {
                          setActiveSearchDropdown((currentValue) =>
                            currentValue === "type" ? null : "type",
                          );
                        }}
                        options={searchTypeOptions}
                        value={searchType}
                      />
                      <button
                        type="button"
                        className={`search-mobile-more-toggle${isMobileSearchFiltersOpen ? " is-open" : ""}`}
                        aria-expanded={isMobileSearchFiltersOpen}
                        aria-controls="search-mobile-advanced-fields"
                        onClick={() => setIsMobileSearchFiltersOpen((currentValue) => !currentValue)}
                      >
                        <span>Más filtros</span>
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </button>
                      <div
                        className={`search-mobile-advanced-panel${isMobileSearchFiltersOpen ? " is-open" : ""}`}
                        id="search-mobile-advanced-fields"
                        aria-hidden={isSmallScreen ? !isMobileSearchFiltersOpen : undefined}
                        inert={isSmallScreen && !isMobileSearchFiltersOpen ? true : undefined}
                      >
                        <SearchDropdownField
                          active={activeSearchDropdown === "zone"}
                          className="search-field-standard search-field-zone search-mobile-advanced-field"
                          label="Barrio"
                          onSelect={(value) => {
                            setSearchZone(value);
                            setActiveSearchDropdown(null);
                          }}
                          onToggle={() => {
                            setActiveSearchDropdown((currentValue) =>
                              currentValue === "zone" ? null : "zone",
                            );
                          }}
                          options={searchZoneDropdownOptions}
                          value={searchZone}
                        />
                        <div className="search-field-standard search-field-price search-mobile-advanced-field">
                          <span className="search-field-label search-field-heading" id="search-price-field-label">
                            Precio
                          </span>
                          <button
                            type="button"
                            className={`search-select-trigger price-range-trigger${activeSearchDropdown === "price" ? " is-open" : ""}`}
                            aria-expanded={activeSearchDropdown === "price"}
                            aria-haspopup="dialog"
                            aria-labelledby="search-price-field-label"
                            onClick={() => {
                              setActiveSearchDropdown((currentValue) => (currentValue === "price" ? null : "price"));
                            }}
                          >
                            <span className="price-range-trigger-text">{searchPriceSummary}</span>
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                              <path d="m6 9 6 6 6-6" />
                            </svg>
                          </button>
                          {hasFullSearchPriceRange ? (
                            <span className="search-select-tooltip price-range-tooltip" role="tooltip">
                              <span>Desde: {formatSearchPriceValue(searchPriceCurrency, searchPriceMin)}</span>
                              <span>Hasta: {formatSearchPriceValue(searchPriceCurrency, searchPriceMax)}</span>
                            </span>
                          ) : null}
                          {activeSearchDropdown === "price" ? (
                            <div className="price-range-popover" role="dialog" aria-label="Rango de precio">
                              <div className="price-range-control home-price-range-control">
                                {!isHomeRentalSearch ? (
                                  <label>
                                    <span>
                                      <span>Desde</span>
                                      <input
                                        className="price-range-value-input"
                                        type="text"
                                        inputMode="numeric"
                                        aria-label="Precio desde"
                                        value={searchPriceMin > searchPriceMinLimit ? formatSearchPriceValue(searchPriceCurrency, searchPriceMin) : ""}
                                        placeholder="Sin mínimo"
                                        onChange={(event) => handleSearchPriceMinInputChange(event.currentTarget.value)}
                                        onFocus={(event) => event.currentTarget.select()}
                                      />
                                    </span>
                                    <input
                                      type="range"
                                      min={searchPriceMinLimit}
                                      max={searchPriceMaxLimit}
                                      step={searchPriceStep}
                                      value={searchPriceMin}
                                      onChange={(event) => handleSearchPriceMinChange(event.currentTarget.value)}
                                    />
                                  </label>
                                ) : null}
                                <label>
                                  <span>
                                    <span>Hasta</span>
                                    <input
                                      className="price-range-value-input"
                                      type="text"
                                      inputMode="numeric"
                                      aria-label="Precio hasta"
                                      value={searchPriceMax < searchPriceMaxLimit ? formatSearchPriceValue(searchPriceCurrency, searchPriceMax) : ""}
                                      placeholder="Sin máximo"
                                      onChange={(event) => handleSearchPriceMaxInputChange(event.currentTarget.value)}
                                      onFocus={(event) => event.currentTarget.select()}
                                    />
                                  </span>
                                  <input
                                    type="range"
                                    min={searchPriceMinLimit}
                                    max={searchPriceMaxLimit}
                                    step={searchPriceStep}
                                    value={searchPriceMax}
                                    onChange={(event) => handleSearchPriceMaxChange(event.currentTarget.value)}
                                  />
                                </label>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </div>
                      <SearchDropdownField
                        active={activeSearchDropdown === "bedrooms"}
                        className="search-field-compact search-field-bedrooms"
                        label="Dormitorios"
                        onSelect={(value) => {
                          setSearchBedrooms(value);
                          setActiveSearchDropdown(null);
                        }}
                        onToggle={() => {
                          setActiveSearchDropdown((currentValue) =>
                            currentValue === "bedrooms" ? null : "bedrooms",
                          );
                        }}
                        options={searchBedroomOptions}
                        value={searchBedrooms}
                      />
                      <label className="search-field-compact search-field-reference">
                        <span className="search-field-heading">REF.</span>
                        <input
                          type="text"
                          placeholder="Ej: 1234"
                          inputMode="numeric"
                          value={searchReference}
                          onChange={(event) => setSearchReference(event.currentTarget.value.replace(/\D/g, ""))}
                        />
                      </label>
                      <div className="search-action-buttons">
                        <button
                          key={activeHomeSearchButtonDemo}
                          type="submit"
                          className={`primary-button search-cta-button search-cta-button-demo search-cta-button-demo-${activeHomeSearchButtonDemo}`}
                        >
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <circle cx="11" cy="11" r="7" />
                            <path d="m20 20-3.5-3.5" />
                          </svg>
                          <span>Buscar</span>
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </section>
          </div>
        </section>

            <section className="section section-listings" id="propiedades">
          <div className="container">
            <SectionHeader
              className="section-heading-featured is-visible"
              title="Propiedades destacadas"
              description=""
            />

            <div className="listing-carousel reveal reveal-early">
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
                {homeFeaturedListings.map((listing, index) => (
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

            <ContactSection showOffices={false} className="home-featured-contact" />
          </div>
        </section>
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
              <a href={activeFooterBranch.mapsHref} target="_blank" rel="noreferrer">{activeFooterBranch.address}</a>
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
