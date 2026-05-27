import { useEffect, useMemo, useState, type FormEvent } from "react";
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
        <img src={property.image} alt={property.title} style={{ objectPosition: property.imagePosition ?? "center center" }} />
        <div className="property-similar-badges">
          <span className="property-similar-pill">{property.type}</span>
          {property.reserved ? <span className="property-similar-pill is-reserved">Reservada</span> : null}
        </div>
      </div>

      <div className="property-similar-body">
        <div className="property-similar-meta">
          <span>{property.location}</span>
          <span>Ref. {property.ref}</span>
        </div>
        <h3>{property.title}</h3>
        <div className="property-similar-stats" aria-label={`Datos de ${property.title}`}>
          <span>
            <img src="/icon-dorm.png" alt="" />
            {property.rooms === 0 ? "Mono" : property.rooms}
          </span>
          <span>
            <img src="/icon-banos.png" alt="" />
            {property.bathrooms}
          </span>
          <span>
            <img src="/icon-sup.png" alt="" />
            {property.size}
          </span>
        </div>
        <div className="property-similar-footer">
          <strong>{property.price}</strong>
          <span>Ver ficha</span>
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
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [property?.id]);

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

  return (
    <div className="property-details-page">
      <section className="property-details-hero">
        <div className="container">
          <div className="property-breadcrumb reveal">
            <a href={backCopy.href} className="property-back-link" aria-label={backCopy.label}>
              <BackArrowIcon />
            </a>
          </div>

          <div className="property-gallery-shell reveal reveal-delay-1" id="galeria">
            <div className="property-gallery-main">
              <img
                src={activeImage.image}
                alt={activeImage.alt}
                style={{ objectPosition: activeImage.objectPosition ?? "center center" }}
              />
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
                  onClick={() => setActiveImageIndex(index)}
                  aria-label={`Ver imagen ${index + 1}`}
                  aria-pressed={index === activeImageIndex}
                >
                  <img
                    src={image.image}
                    alt=""
                    style={{ objectPosition: image.objectPosition ?? "center center" }}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="property-intro-shell reveal reveal-delay-2">
            <div className="property-intro-copy">
              <div className="property-headline-row">
                <div className="property-headline-copy">
                  <h1>{property.title}</h1>
                </div>
              </div>

              <div className="property-location-line">
                <span className="property-location-item">
                  <span className="property-location-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24">
                      <path d="M12 20s6-5.4 6-10.2A6 6 0 0 0 6 9.8C6 14.6 12 20 12 20Z" />
                      <circle cx="12" cy="9.5" r="2.2" />
                    </svg>
                  </span>
                  <span>{property.address}</span>
                </span>
              </div>

              <div className="property-price-row">
                <strong className="property-price-value">{property.price}</strong>
              </div>

              <div className="property-intro-stats" aria-label={`Datos principales de ${property.title}`}>
                <div className="property-intro-stat">
                  <img src="/icon-dorm.png" alt="" />
                  <span>{getBedroomStatLabel(property.rooms)}</span>
                </div>
                <div className="property-intro-stat">
                  <img src="/icon-banos.png" alt="" />
                  <span>{property.bathrooms}</span>
                </div>
                <div className="property-intro-stat">
                  <img src="/icon-sup.png" alt="" />
                  <span>{property.size}</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      <section className="property-page-content">
        <div className="container">
          <div className="property-page-layout">
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

            <aside className="property-contact-sidebar">
              <div className="property-contact-card reveal reveal-delay-2">
                <h2>Quiero más información sobre esta propiedad</h2>

                <form className="property-contact-form" onSubmit={handleContactSubmit}>
                  <input type="text" placeholder="Nombre" />
                  <input type="email" placeholder="Email" />
                  <input type="text" placeholder="Teléfono" />
                  <textarea
                    rows={4}
                    defaultValue={`Me interesa ${property.title} (Ref. ${property.ref}). Quisiera recibir más información.`}
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
                  <a className="property-contact-quicklink property-contact-quicklink-email" href="mailto:inmobiliaria@lars.com.uy">
                    <span className="property-contact-quicklink-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24">
                        <path d="M3.5 5.25h17v13.5h-17V5.25Z" />
                        <path d="m4.2 6.2 7.8 6.25 7.8-6.25" />
                      </svg>
                    </span>
                    <span>Email</span>
                  </a>
                </div>

              </div>
            </aside>
          </div>
        </div>
      </section>

      {similarProperties.length ? (
        <section className="property-similar-section">
          <div className="container">
            <div className="property-similar-head reveal">
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
