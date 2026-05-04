import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  getSalesPropertyById,
  getSalesPropertyUrl,
  getSimilarSalesProperties,
  type SalesProperty,
} from "../data/salesCatalog";

type PropertyDetailsPageProps = {
  propertyId: number | null;
};

const demoTitleFonts = [
  { name: "Poppins", family: '"Poppins", sans-serif' },
  { name: "Roboto", family: 'Roboto, Arial, sans-serif' },
  { name: "Georgia", family: 'Georgia, "Times New Roman", serif' },
  { name: "Times New Roman", family: '"Times New Roman", Times, serif' },
  { name: "Arial", family: 'Arial, Helvetica, sans-serif' },
  { name: "Helvetica", family: '"Helvetica Neue", Helvetica, Arial, sans-serif' },
  { name: "Trebuchet", family: '"Trebuchet MS", Arial, sans-serif' },
  { name: "Verdana", family: 'Verdana, Geneva, sans-serif' },
  { name: "Garamond", family: 'Garamond, Georgia, serif' },
  { name: "Baskerville", family: 'Baskerville, "Times New Roman", serif' },
  { name: "Palatino", family: '"Palatino Linotype", Palatino, Georgia, serif' },
];

function getBedroomStatLabel(rooms: number) {
  return rooms === 0 ? "Mono" : `${rooms} dorm.`;
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

function getAmenityIconKind(label: string) {
  const lower = label.toLowerCase();

  if (lower.includes("barbacoa") || lower.includes("parrillero")) {
    return "grill";
  }

  if (lower.includes("terraza") || lower.includes("balcon")) {
    return "terrace";
  }

  if (lower.includes("patio") || lower.includes("jardin") || lower.includes("garden")) {
    return "leaf";
  }

  if (lower.includes("garaje")) {
    return "car";
  }

  if (lower.includes("porteria") || lower.includes("recepcion")) {
    return "shield";
  }

  if (lower.includes("luminos") || lower.includes("luz") || lower.includes("vista") || lower.includes("mar")) {
    return "sun";
  }

  if (lower.includes("renta") || lower.includes("rentable")) {
    return "chart";
  }

  if (lower.includes("oficina") || lower.includes("escritorio") || lower.includes("diseno")) {
    return "briefcase";
  }

  if (lower.includes("monoambiente") || lower.includes("loft") || lower.includes("duplex") || lower.includes("penthouse")) {
    return "building";
  }

  if (lower.includes("suite") || lower.includes("dorm")) {
    return "bed";
  }

  if (lower.includes("conectiv") || lower.includes("visible")) {
    return "signal";
  }

  if (lower.includes("entrega") || lower.includes("listo") || lower.includes("actualizada")) {
    return "check";
  }

  if (lower.includes("asesoramiento")) {
    return "chat";
  }

  if (lower.includes("metraje") || lower.includes("circulacion")) {
    return "plan";
  }

  return "star";
}

function PropertyAmenityIcon(props: { label: string }) {
  const kind = getAmenityIconKind(props.label);

  switch (kind) {
    case "grill":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 10h12" />
          <path d="M7.5 6.5v3.5" />
          <path d="M12 4.5v5.5" />
          <path d="M16.5 6.5v3.5" />
          <path d="M8 10v4.5" />
          <path d="M16 10v4.5" />
          <path d="M5.5 14.5h13" />
          <path d="M9.5 19.5h5" />
        </svg>
      );
    case "terrace":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4.5 18.5h15" />
          <path d="M6.5 18.5v-7h11v7" />
          <path d="M9 9.5h6" />
          <path d="M10.5 6.5h3" />
        </svg>
      );
    case "leaf":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18.5 5.5c-6 0-10 3.5-10 9 0 2.7 1.8 4.5 4.2 4.5 4.7 0 6.8-5.2 5.8-13.5Z" />
          <path d="M8.5 18.5c2.2-2.3 4.8-4.2 8-5.8" />
        </svg>
      );
    case "car":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5.5 15.5h13l-1-5h-11l-1 5Z" />
          <path d="M7.5 18.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z" />
          <path d="M16.5 18.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z" />
          <path d="M8 10.5l1.5-3h5L16 10.5" />
        </svg>
      );
    case "shield":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 4.5 18.5 7v4.8c0 4.2-2.7 6.6-6.5 7.7-3.8-1.1-6.5-3.5-6.5-7.7V7L12 4.5Z" />
          <path d="m9.5 11.8 1.7 1.7 3.3-3.5" />
        </svg>
      );
    case "sun":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="3.5" />
          <path d="M12 4.5v2.2" />
          <path d="M12 17.3v2.2" />
          <path d="M4.5 12h2.2" />
          <path d="M17.3 12h2.2" />
          <path d="m6.8 6.8 1.5 1.5" />
          <path d="m15.7 15.7 1.5 1.5" />
          <path d="m15.7 8.3 1.5-1.5" />
          <path d="m6.8 17.2 1.5-1.5" />
        </svg>
      );
    case "chart":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 18.5h14" />
          <path d="M7.5 15.5V12" />
          <path d="M12 15.5V8.5" />
          <path d="M16.5 15.5V10" />
          <path d="m7.5 10.5 4.5-3 4.5 1.5" />
        </svg>
      );
    case "briefcase":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5.5 8.5h13v9h-13z" />
          <path d="M9 8.5v-2h6v2" />
          <path d="M5.5 12h13" />
        </svg>
      );
    case "building":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6.5 19.5v-11h11v11" />
          <path d="M9.5 10.5h1" />
          <path d="M13.5 10.5h1" />
          <path d="M9.5 13.5h1" />
          <path d="M13.5 13.5h1" />
          <path d="M11.5 19.5v-3h1v3" />
        </svg>
      );
    case "bed":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5.5 16.5v-6h13v6" />
          <path d="M5.5 13h13" />
          <path d="M7.5 13v-2.5h3V13" />
          <path d="M5.5 18.5v-2" />
          <path d="M18.5 18.5v-2" />
        </svg>
      );
    case "signal":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6.5 17.5h2v-3h-2z" />
          <path d="M11 17.5h2V11h-2z" />
          <path d="M15.5 17.5h2V7.5h-2z" />
        </svg>
      );
    case "check":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m6.5 12.5 3.2 3.2 7.8-8.2" />
          <path d="M12 4.5a7.5 7.5 0 1 1 0 15 7.5 7.5 0 0 1 0-15Z" />
        </svg>
      );
    case "chat":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 7.5h12v8H11l-3.5 3v-3H6z" />
          <path d="M9 10.5h6" />
          <path d="M9 13h4" />
        </svg>
      );
    case "plan":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5.5 6.5h13v11h-13z" />
          <path d="M10.5 6.5v11" />
          <path d="M10.5 11.5h8" />
          <path d="M7 14.5h2" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m12 5 1.9 3.9 4.3.6-3.1 3 .7 4.3-3.8-2-3.8 2 .7-4.3-3.1-3 4.3-.6Z" />
        </svg>
      );
  }
}

function PropertyAmenityGrid(props: { items: string[] }) {
  return (
    <div className="property-amenity-grid">
      {props.items.map((item) => (
        <div key={item} className="property-amenity-item">
          <span className="property-amenity-icon">
            <PropertyAmenityIcon label={item} />
          </span>
          <span className="property-amenity-label">{item}</span>
        </div>
      ))}
    </div>
  );
}

function SimilarPropertyCard(props: { property: SalesProperty; index: number }) {
  const { property, index } = props;

  return (
    <a
      href={getSalesPropertyUrl(property.id)}
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
          <span>{getBedroomStatLabel(property.rooms)}</span>
          <span>{getBathroomLabel(property.bathrooms)}</span>
          <span>{property.size}</span>
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
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [titleFontIndex, setTitleFontIndex] = useState(0);
  const activeTitleFont = demoTitleFonts[titleFontIndex];

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
              <a href="/ventas" className="primary-button search-cta-button">
                Volver a ventas
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
  const quickFacts = [
    `Tipo: ${property.type}`,
    `Barrio: ${property.location}`,
    `Dormitorios: ${getBedroomDetailLabel(property.rooms)}`,
    `Baños: ${getBathroomLabel(property.bathrooms)}`,
    `Superficie: ${property.size}`,
    `Estado: ${property.reserved ? "Reservada" : "Disponible para consulta"}`,
  ];
  const similarProperties = getSimilarSalesProperties(property, 3);
  const sectionLinks = [
    { href: "#galeria", label: "Galeria" },
    { href: "#descripcion", label: "Descripcion" },
    { href: "#comodidades", label: "Comodidades" },
    { href: "#amenities", label: "Amenities" },
    { href: "#info", label: "Informacion" },
  ];

  const handleContactSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  const handleChangeTitleFont = (direction: "previous" | "next") => {
    setTitleFontIndex((currentIndex) => {
      const nextIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;
      return ((nextIndex % demoTitleFonts.length) + demoTitleFonts.length) % demoTitleFonts.length;
    });
  };

  return (
    <div className="property-details-page">
      <section className="property-details-hero">
        <div className="container">
          <div className="property-breadcrumb reveal">
            <a href="/ventas" className="property-back-link">
              Volver a ventas
            </a>
            <span className="property-ref-inline">Ref. {property.ref}</span>
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
                  <div className="property-title-font-demo">
                    <button
                      type="button"
                      className="property-title-font-button"
                      onClick={() => handleChangeTitleFont("previous")}
                      aria-label="Ver fuente anterior para el titulo"
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M14.5 5.5 8 12l6.5 6.5" />
                      </svg>
                    </button>
                    <h1
                      key={`${property.id}-${activeTitleFont.name}`}
                      style={{ fontFamily: activeTitleFont.family }}
                      title={`Fuente demo: ${activeTitleFont.name}`}
                    >
                      {property.title}
                    </h1>
                    <span className="property-title-font-name">({activeTitleFont.name})</span>
                    <button
                      type="button"
                      className="property-title-font-button"
                      onClick={() => handleChangeTitleFont("next")}
                      aria-label="Ver fuente siguiente para el titulo"
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="m9.5 5.5 6.5 6.5-6.5 6.5" />
                      </svg>
                    </button>
                  </div>
                  <p className="property-intro-summary">{property.summary}</p>
                </div>

                <div className="property-price-row">
                  <strong className="property-price-value">{property.price}</strong>
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

              <div className="property-intro-stats" aria-label={`Datos principales de ${property.title}`}>
                <div className="property-intro-stat">
                  <img src="/icon-dorm.png" alt="" />
                  <span>{getBedroomStatLabel(property.rooms)}</span>
                </div>
                <div className="property-intro-stat">
                  <img src="/icon-banos.png" alt="" />
                  <span>{getBathroomLabel(property.bathrooms)}</span>
                </div>
                <div className="property-intro-stat">
                  <img src="/icon-sup.png" alt="" />
                  <span>{property.size}</span>
                </div>
              </div>

              <div className="property-tag-row" aria-label={`Etiquetas de ${property.title}`}>
                {property.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="property-anchor-band">
        <div className="container">
          <nav className="property-anchor-nav reveal reveal-delay-3" aria-label="Secciones de la propiedad">
            {sectionLinks.map((sectionLink) => (
              <a key={sectionLink.href} href={sectionLink.href}>
                {sectionLink.label}
              </a>
            ))}
          </nav>
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
                    <p className="property-section-subtitle">Datos clave</p>
                    <PropertyDetailList items={quickFacts} />
                  </div>

                  <div className="property-section-column">
                    <p className="property-section-subtitle">Caracteristicas</p>
                    <PropertyDetailList items={property.characteristics} />
                  </div>
                </div>
              </section>

              <section className="property-flow-section reveal reveal-delay-2" id="amenities">
                <div className="property-section-header">
                  <h2>Amenities</h2>
                </div>

                <PropertyAmenityGrid items={property.amenities} />
              </section>

              <section className="property-flow-section reveal reveal-delay-3" id="info">
                <div className="property-section-header">
                  <h2>Información</h2>
                </div>

                <div className="property-section-grid">
                  <div className="property-section-column">
                    <p className="property-section-subtitle">Gastos y tributos</p>
                    <PropertyDetailList items={property.financialInfo} />
                  </div>

                  <div className="property-section-column">
                    <p className="property-section-subtitle">Seguimiento Lars</p>
                    <PropertyDetailList items={property.internalInfo} />
                  </div>
                </div>

                <p className="property-disclaimer-note">
                  La informacion contenida en esta ficha ha sido proporcionada por el propietario y
                  se comparte como guia comercial preliminar.
                </p>
              </section>
            </div>

            <aside className="property-contact-sidebar">
              <div className="property-contact-card reveal reveal-delay-2">
                <h2>Consultar propiedad</h2>

                <div className="property-contact-price">
                  <strong>{property.price}</strong>
                </div>

                <form className="property-contact-form" onSubmit={handleContactSubmit}>
                  <input type="text" placeholder="Nombre" />
                  <input type="email" placeholder="Email" />
                  <input type="text" placeholder="Telefono" />
                  <textarea
                    rows={4}
                    defaultValue={`Me interesa ${property.title} (Ref. ${property.ref}). Quisiera recibir mas informacion.`}
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
                      <svg viewBox="0 0 24 24">
                        <path d="M19.1 4.9A9.6 9.6 0 0 0 12.2 2C6.9 2 2.5 6.3 2.5 11.7c0 1.7.5 3.4 1.4 4.8L2.5 22l5.7-1.4a9.8 9.8 0 0 0 4 .8c5.3 0 9.7-4.3 9.7-9.7a9.5 9.5 0 0 0-2.8-6.8Z" />
                        <path d="M8.3 7.8c.2-.4.4-.4.7-.4h.6c.2 0 .4 0 .5.4l.7 1.8c.1.3.1.5 0 .7l-.3.5c-.1.2-.2.3-.1.5.3.5.8 1.2 1.4 1.7.7.6 1.5 1 2 .9.2 0 .3-.2.5-.4l.4-.5c.1-.2.4-.2.6-.1l1.8.9c.3.1.4.3.3.6l-.3 1.1c-.1.4-.6.7-1 .8-.7.1-1.7.1-3.2-.6a8.7 8.7 0 0 1-4.1-4.2c-.6-1.4-.6-2.5-.4-3.2.1-.4.4-.8.7-1Z" />
                      </svg>
                    </span>
                    <span>WhatsApp</span>
                  </a>
                  <a className="property-contact-quicklink" href="mailto:inmobiliaria@lars.com.uy">
                    <span className="property-contact-quicklink-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24">
                        <path d="M4.5 7.5h15v10h-15v-10Z" />
                        <path d="m5.2 8.2 6.8 5.1 6.8-5.1" />
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
              <p>Seleccionamos opciones cercanas por zona, tipología y perfil comercial.</p>
            </div>

            <div className="property-similar-grid">
              {similarProperties.map((similarProperty, index) => (
                <SimilarPropertyCard key={similarProperty.id} property={similarProperty} index={index} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
