import { useEffect, useLayoutEffect, useMemo, useRef, useState, type FormEvent } from "react";
import ImageLightbox from "../components/ImageLightbox";
import WhatsAppIcon from "../components/WhatsAppIcon";
import {
  getSalesPropertyById,
  getSalesPropertyUrl,
  getSimilarSalesProperties,
  type SalesProperty,
} from "../data/salesCatalog";

type PropertyDetailsPageProps = {
  propertyId: number | null;
};

type PropertyDetailsDemoVariant = "default" | "sticky-contact" | "hero-summary";

function getBedroomStatLabel(rooms: number) {
  return rooms === 0 ? "1" : String(rooms);
}

function getBedroomDetailLabel(rooms: number) {
  return rooms === 0 ? "Monoambiente" : `${rooms} dormitorio${rooms === 1 ? "" : "s"}`;
}

function getBathroomLabel(bathrooms: number) {
  return `${bathrooms} baño${bathrooms === 1 ? "" : "s"}`;
}

function PropertyDetailList(props: { items: string[] }) {
  return (
    <ul className="property-detail-list">
      {props.items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function PropertyAmenityGrid(props: { items: string[] }) {
  return (
    <ul className="property-detail-list property-amenity-list">
      {props.items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function getPropertyOrigin() {
  if (typeof window === "undefined") {
    return "ventas";
  }

  const origin = new URLSearchParams(window.location.search).get("origen");

  return origin === "alquileres" || origin === "alquiler" ? "alquileres" : "ventas";
}

function getPropertyBackCopy(origin: "ventas" | "alquileres") {
  return origin === "alquileres"
    ? { href: "/alquileres", label: "Volver a alquileres" }
    : { href: "/ventas", label: "Volver a ventas" };
}

function getPropertyDetailsDemoVariant(): PropertyDetailsDemoVariant {
  if (typeof window === "undefined") {
    return "sticky-contact";
  }

  const demo = new URLSearchParams(window.location.search).get("demo");

  if (demo === "default") {
    return "default";
  }

  if (demo === "sticky-contact") {
    return "sticky-contact";
  }

  if (demo === "hero-summary") {
    return "hero-summary";
  }

  return "sticky-contact";
}

function BackArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M10.5 5.5 4 12l6.5 6.5" />
      <path d="M5 12h15" />
    </svg>
  );
}

function SimilarPropertyCard(props: { property: SalesProperty; index: number; origin: "ventas" | "alquileres" }) {
  const { property, index, origin } = props;

  return (
    <a
      href={getSalesPropertyUrl(property.id, origin)}
      className={`property-similar-card${property.reserved ? " is-reserved" : ""} reveal reveal-delay-${(index % 3) + 1}`}
    >
      <div className="property-similar-media">
        <img
          src={property.cardImage}
          alt={property.title}
          width="700"
          height="394"
          loading="lazy"
          decoding="async"
          style={{ objectPosition: property.imagePosition ?? "center center" }}
        />
        {property.reserved ? (
          <div className="property-similar-badges">
            <span className="property-similar-pill is-reserved">Reservada</span>
          </div>
        ) : null}
      </div>

      <div className="property-similar-body">
        <div className="property-similar-meta">
          <span>{property.location}</span>
          <span>Ref. {property.ref}</span>
        </div>
        <h3>{property.title}</h3>
        <div className="property-similar-stats" aria-label={`Datos de ${property.title}`}>
          <span>
            <img src="/optimized/home/icon-dorm.webp" alt="" width="40" height="36" />
            {property.rooms === 0 ? "Mono" : property.rooms}
          </span>
          <span>
            <img src="/optimized/home/icon-banos.webp" alt="" width="39" height="40" />
            {property.bathrooms}
          </span>
          <span>
            <img src="/optimized/home/icon-sup.webp" alt="" width="40" height="36" />
            {property.size}
          </span>
        </div>
        <div className="property-similar-footer">
          <strong>{property.price}</strong>
        </div>
      </div>
    </a>
  );
}

export default function PropertyDetailsPage(props: PropertyDetailsPageProps) {
  const { propertyId } = props;
  const property = useMemo(
    () => (propertyId === null ? undefined : getSalesPropertyById(propertyId)),
    [propertyId],
  );
  const propertyOrigin = getPropertyOrigin();
  const backCopy = getPropertyBackCopy(propertyOrigin);
  const demoVariant = getPropertyDetailsDemoVariant();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxImageIndex, setLightboxImageIndex] = useState<number | null>(null);
  const galleryShellRef = useRef<HTMLDivElement>(null);
  const galleryMainRef = useRef<HTMLDivElement>(null);
  const stickyDemoStageRef = useRef<HTMLDivElement>(null);
  const stickyDemoHeroRef = useRef<HTMLElement>(null);
  const stickyDemoContentRef = useRef<HTMLElement>(null);
  const stickyContactColumnRef = useRef<HTMLDivElement>(null);
  const stickyContactSummaryRef = useRef<HTMLDivElement>(null);
  const contactSidebarRef = useRef<HTMLElement>(null);
  const contactCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveImageIndex(0);
    setLightboxImageIndex(null);
  }, [property?.id]);

  useEffect(() => {
    document.title = property ? `Lars | ${property.title}` : "Lars | Propiedad";
  }, [property]);

  useEffect(() => {
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>(".property-details-page .reveal:not(.is-visible)"),
    );

    if (!elements.length) {
      return;
    }

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
        threshold: 0.14,
        rootMargin: "0px 0px -8% 0px",
      },
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [property?.id]);

  useEffect(() => {
    if (!property || typeof window === "undefined" || window.location.hash !== "#consulta") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      contactCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      contactCardRef.current?.querySelector<HTMLInputElement>("input")?.focus({ preventScroll: true });
    }, 80);

    return () => window.clearTimeout(timeoutId);
  }, [property]);

  useLayoutEffect(() => {
    if (demoVariant !== "sticky-contact" || typeof window === "undefined") {
      return;
    }

    const stage = stickyDemoStageRef.current;
    const hero = stickyDemoHeroRef.current;
    const content = stickyDemoContentRef.current;
    const galleryShell = galleryShellRef.current;
    const galleryMain = galleryMainRef.current;
    const stickyContactColumn = stickyContactColumnRef.current;
    const stickyContactSummary = stickyContactSummaryRef.current;
    const contactSidebar = contactSidebarRef.current;
    const contact = contactCardRef.current;

    if (
      !stage ||
      !hero ||
      !content ||
      !galleryShell ||
      !galleryMain ||
      !stickyContactColumn ||
      !stickyContactSummary ||
      !contactSidebar ||
      !contact
    ) {
      return;
    }

    const updateStickyDemoDimensions = () => {
      const bodyZoomValue = window.getComputedStyle(document.body).getPropertyValue("zoom");
      const bodyZoom = Number.parseFloat(bodyZoomValue);
      const layoutScale = Number.isFinite(bodyZoom) && bodyZoom > 0 ? bodyZoom : 1;
      const stageRect = stage.getBoundingClientRect();
      const heroRect = hero.getBoundingClientRect();
      const galleryShellRect = galleryShell.getBoundingClientRect();
      const stickyContactSummaryRect = stickyContactSummary.getBoundingClientRect();
      const stickyContactColumnStyle = window.getComputedStyle(stickyContactColumn);
      const stickyContactGap = Number.parseFloat(stickyContactColumnStyle.rowGap || stickyContactColumnStyle.gap);
      const heroHeight = (heroRect.bottom - stageRect.top) / layoutScale;
      const galleryShellHeight = galleryShellRect.height / layoutScale;
      const stickyContactSummaryHeight = stickyContactSummaryRect.height / layoutScale;
      const contactCardHeight = Math.max(
        galleryShellHeight - stickyContactSummaryHeight - (Number.isFinite(stickyContactGap) ? stickyContactGap : 0) + 6,
        0,
      );

      stage.style.setProperty("--sticky-demo-hero-height", `${Math.ceil(heroHeight)}px`);
      stage.style.setProperty("--sticky-demo-gallery-shell-height", `${Math.ceil(galleryShellHeight)}px`);
      stage.style.setProperty("--sticky-demo-contact-card-height", `${Math.ceil(contactCardHeight)}px`);
    };

    updateStickyDemoDimensions();

    const animationFrameId = window.requestAnimationFrame(() => {
      updateStickyDemoDimensions();
    });

    window.addEventListener("resize", updateStickyDemoDimensions);

    const resizeObserver =
      "ResizeObserver" in window
        ? new ResizeObserver(() => {
            updateStickyDemoDimensions();
          })
        : null;

    resizeObserver?.observe(hero);
    resizeObserver?.observe(galleryShell);
    resizeObserver?.observe(galleryMain);
    resizeObserver?.observe(stickyContactColumn);
    resizeObserver?.observe(stickyContactSummary);
    resizeObserver?.observe(contactSidebar);
    resizeObserver?.observe(contact);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", updateStickyDemoDimensions);
      resizeObserver?.disconnect();
      stage.style.removeProperty("--sticky-demo-hero-height");
      stage.style.removeProperty("--sticky-demo-gallery-shell-height");
      stage.style.removeProperty("--sticky-demo-contact-card-height");
    };
  }, [demoVariant, property?.id]);

  if (!property) {
    return (
      <div className="property-details-page property-details-page-missing">
        <section className="property-missing-section">
          <div className="container">
            <div className="property-missing-card reveal is-visible">
              <h1>Propiedad no encontrada</h1>
              <p>La ficha que intentaste abrir ya no está disponible o todavía no tiene información cargada.</p>
              <a href={backCopy.href} className="primary-button search-cta-button property-return-button">
                <BackArrowIcon />
                {backCopy.label}
              </a>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const gallery = property.gallery.length
    ? property.gallery
    : [{ image: property.image, alt: property.title, objectPosition: property.imagePosition }];
  const activeImage = gallery[Math.min(activeImageIndex, gallery.length - 1)];
  const descriptionParagraphs = property.description.split(/\n{2,}/g);
  const profileFact = `Perfil: ${property.tags[0] ?? "Residencial"}`;
  const quickFacts = [
    `Tipo: ${property.type}`,
    `Barrio: ${property.location}`,
    `Dormitorios: ${getBedroomDetailLabel(property.rooms)}`,
    `Baños: ${getBathroomLabel(property.bathrooms)}`,
    `Superficie: ${property.size}`,
    `Estado: ${property.reserved ? "Reservada" : "Disponible para consulta"}`,
    profileFact,
  ];
  const characteristics = property.characteristics.filter((item) => item !== profileFact);
  const similarProperties = getSimilarSalesProperties(property, 4);
  const handleContactSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };
  const handleOpenLightbox = (index: number) => {
    setActiveImageIndex(index);
    setLightboxImageIndex(index);
  };
  const handleLightboxIndexChange = (index: number) => {
    setActiveImageIndex(index);
    setLightboxImageIndex(index);
  };

  const galleryBlock = (
    <div ref={galleryShellRef} className="property-gallery-shell reveal reveal-delay-1" id="galeria">
      <div ref={galleryMainRef} className="property-gallery-main">
        <button
          type="button"
          className="property-gallery-main-button"
          onClick={() => handleOpenLightbox(activeImageIndex)}
          aria-label={`Abrir imagen ${activeImageIndex + 1} de ${property.title}`}
        >
          <img
            src={activeImage.image}
            alt={activeImage.alt}
            width="1400"
            height="788"
            fetchPriority="high"
            decoding="async"
            style={{ objectPosition: activeImage.objectPosition ?? "center center" }}
          />
        </button>
        {property.reserved ? (
          <span className="property-status-pill property-gallery-status-pill is-reserved">
            Reservada
          </span>
        ) : null}
      </div>

      <div className="property-gallery-rail" aria-label={`Galería de ${property.title}`}>
        {gallery.map((image, index) => (
          <button
            key={`${image.image}-${index}`}
            type="button"
            className={`property-gallery-thumb${index === activeImageIndex ? " is-active" : ""}`}
            onClick={() => handleOpenLightbox(index)}
            aria-label={`Abrir imagen ${index + 1}`}
            aria-pressed={index === activeImageIndex}
          >
            <img
              src={image.thumbImage ?? image.image}
              alt=""
              width="480"
              height="270"
              loading="lazy"
              decoding="async"
              style={{ objectPosition: image.objectPosition ?? "center center" }}
            />
          </button>
        ))}
      </div>
    </div>
  );

  const introBlock = (
    <div className="property-intro-shell reveal reveal-delay-2">
      <div className="property-intro-copy">
        <div className="property-headline-row">
          <div className="property-headline-copy">
            <h1>{property.title}</h1>
          </div>
        </div>

        <div className="property-location-price-row">
          <div className="property-location-line">
            <span className="property-location-item">
              <span>{property.location}</span>
            </span>
          </div>

          <div className="property-price-row">
            <strong className="property-price-value property-price-font-lato">{property.price}</strong>
          </div>
        </div>

        <div className="property-intro-stats" aria-label={`Datos principales de ${property.title}`}>
          <div className="property-intro-stat">
            <img src="/optimized/home/icon-dorm.webp" alt="" width="40" height="36" />
            <span>{getBedroomStatLabel(property.rooms)}</span>
          </div>
          <div className="property-intro-stat">
            <img src="/optimized/home/icon-banos.webp" alt="" width="39" height="40" />
            <span>{property.bathrooms}</span>
          </div>
          <div className="property-intro-stat">
            <img src="/optimized/home/icon-sup.webp" alt="" width="40" height="36" />
            <span>{property.size}</span>
          </div>
        </div>

      </div>
    </div>
  );

  const stickyContactSummaryBlock = (
    <div
      ref={demoVariant === "sticky-contact" ? stickyContactSummaryRef : null}
      className={
        demoVariant === "sticky-contact"
          ? "property-sticky-contact-summary property-sticky-contact-summary-sidebar property-sticky-contact-fade property-sticky-contact-fade-delay-1"
          : "property-sticky-contact-summary"
      }
      aria-label={`Resumen de ${property.title}`}
    >
      <h1>{property.title}</h1>

      <div className="property-location-price-row">
        <div className="property-location-line">
          <span className="property-location-item">
            <span>{property.location}</span>
          </span>
        </div>

        <div className="property-price-row">
          <strong className="property-price-value property-price-font-lato">{property.price}</strong>
        </div>
      </div>

      <div className="property-intro-stats" aria-label={`Datos principales de ${property.title}`}>
        <div className="property-intro-stat">
          <img src="/optimized/home/icon-dorm.webp" alt="" width="40" height="36" />
          <span>{getBedroomStatLabel(property.rooms)}</span>
        </div>
        <div className="property-intro-stat">
          <img src="/optimized/home/icon-banos.webp" alt="" width="39" height="40" />
          <span>{property.bathrooms}</span>
        </div>
        <div className="property-intro-stat">
          <img src="/optimized/home/icon-sup.webp" alt="" width="40" height="36" />
          <span>{property.size}</span>
        </div>
      </div>
    </div>
  );

  const mobileStickyContactSummaryBlock = (
    <div className="property-sticky-contact-summary property-sticky-contact-summary-mobile" aria-label={`Resumen de ${property.title}`}>
      <h1>{property.title}</h1>

      <div className="property-location-price-row">
        <div className="property-location-line">
          <span className="property-location-item">
            <span>{property.location}</span>
          </span>
        </div>

        <div className="property-price-row">
          <strong className="property-price-value property-price-font-lato">{property.price}</strong>
        </div>
      </div>

      <div className="property-intro-stats" aria-label={`Datos principales de ${property.title}`}>
        <div className="property-intro-stat">
          <img src="/optimized/home/icon-dorm.webp" alt="" width="40" height="36" />
          <span>{getBedroomStatLabel(property.rooms)}</span>
        </div>
        <div className="property-intro-stat">
          <img src="/optimized/home/icon-banos.webp" alt="" width="39" height="40" />
          <span>{property.bathrooms}</span>
        </div>
        <div className="property-intro-stat">
          <img src="/optimized/home/icon-sup.webp" alt="" width="40" height="36" />
          <span>{property.size}</span>
        </div>
      </div>
    </div>
  );

  const contactCardClassName = [
    "property-contact-card",
    demoVariant === "sticky-contact"
      ? "property-sticky-contact-fade property-sticky-contact-fade-delay-2"
      : "reveal reveal-delay-2",
  ]
    .filter(Boolean)
    .join(" ");

  const contactCard = (
    <div
      ref={contactCardRef}
      className={contactCardClassName}
    >
      <h2>Quiero recibir información sobre esta propiedad</h2>

      <form id={`property-contact-form-${property.id}`} className="property-contact-form" onSubmit={handleContactSubmit}>
        <input type="text" placeholder="Nombre" aria-label="Nombre" />
        <input type="tel" placeholder="Celular" aria-label="Celular" />
        <input type="email" placeholder="Email" aria-label="Email" />
        <textarea
          rows={3}
          aria-label="Comentarios"
          placeholder="Comentarios"
          defaultValue={`Me interesa ${property.title} (Ref. ${property.ref}). Quiero recibir más información.`}
        />
      </form>

      <div className="property-contact-quicklinks">
        <a
          className="property-contact-quicklink property-contact-quicklink-whatsapp"
          href="https://wa.me/59824010101"
          target="_blank"
          rel="noreferrer"
        >
          <span className="property-contact-quicklink-icon" aria-hidden="true">
            <WhatsAppIcon />
          </span>
          <span>WhatsApp</span>
        </a>
        <button
          type="submit"
          className="property-contact-quicklink property-contact-quicklink-submit"
          form={`property-contact-form-${property.id}`}
        >
          <span>Enviar</span>
        </button>
      </div>

    </div>
  );

  const mainContent = (
    <div className="property-main-column">
      <section className="property-flow-section reveal" id="descripcion">
        <div className="property-section-header">
          <h2>Descripción</h2>
        </div>

        <div className="property-section-copy">
          {descriptionParagraphs.map((paragraph, index) => (
            <p key={`${property.id}-description-${index}`}>{paragraph}</p>
          ))}
        </div>
      </section>

      <section className="property-flow-section reveal reveal-delay-1" id="comodidades">
        <div className="property-section-header">
          <h2>Características</h2>
        </div>

        <div className="property-section-grid">
          <div className="property-section-column">
            <PropertyDetailList items={quickFacts} />
          </div>

          <div className="property-section-column">
            <PropertyDetailList items={characteristics} />
          </div>
        </div>
      </section>

      <section className="property-flow-section reveal reveal-delay-2" id="amenities">
        <div className="property-section-header">
          <h2>Amenities</h2>
        </div>

        <PropertyAmenityGrid items={property.amenities} />
      </section>

    </div>
  );

  const lightbox = (
    <ImageLightbox
      images={gallery}
      activeIndex={lightboxImageIndex}
      title={property.title}
      onClose={() => setLightboxImageIndex(null)}
      onIndexChange={handleLightboxIndexChange}
    />
  );

  const pageClassName = [
    "property-details-page",
    demoVariant === "sticky-contact" ? "property-details-page-demo-sticky-contact" : "",
    demoVariant === "hero-summary" ? "property-details-page-demo-hero-summary" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={pageClassName}>
      {demoVariant === "sticky-contact" ? (
        <div ref={stickyDemoStageRef} className="property-details-demo-sticky-stage">
          <div className="container property-details-demo-sticky-layout">
            <div className="property-details-demo-main">
              <section ref={stickyDemoHeroRef} className="property-details-hero">
                {galleryBlock}
                {mobileStickyContactSummaryBlock}
                {demoVariant === "sticky-contact" ? null : introBlock}
              </section>

              <section ref={stickyDemoContentRef} className="property-page-content property-page-content-demo">
                {mainContent}
              </section>
            </div>

            <div ref={stickyContactColumnRef} className="property-sticky-contact-column">
              {stickyContactSummaryBlock}

              <aside ref={contactSidebarRef} className="property-contact-sidebar" id="consulta">
                {contactCard}
              </aside>
            </div>
          </div>
        </div>
      ) : (
        <>
          <section className="property-details-hero">
            <div className="container">
              {demoVariant === "hero-summary" ? (
                <div className="property-details-hero-split-layout">
                  {galleryBlock}
                  {introBlock}
                </div>
              ) : (
                <>
                  {galleryBlock}
                  {introBlock}
                </>
              )}
            </div>
          </section>

          <section className="property-page-content">
            <div className="container">
              <div className="property-page-layout">
                {mainContent}

                <aside className="property-contact-sidebar" id="consulta">
                  {contactCard}
                </aside>
              </div>
            </div>
          </section>
        </>
      )}

      {lightbox}

      {similarProperties.length ? (
        <section className="property-similar-section">
          <div className="container">
            <div className="property-similar-head section-title-frame reveal">
              <h2>Propiedades similares</h2>
            </div>

            <div className="property-similar-grid">
              {similarProperties.map((similarProperty, index) => (
                <SimilarPropertyCard
                  key={similarProperty.id}
                  property={similarProperty}
                  index={index}
                  origin={propertyOrigin}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
