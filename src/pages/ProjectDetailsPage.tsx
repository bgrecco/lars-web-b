import { useEffect, useMemo, useState, type FormEvent } from "react";
import ImageLightbox from "../components/ImageLightbox";
import WhatsAppIcon from "../components/WhatsAppIcon";
import {
  getProjectBySlug,
  getProjectUrl,
  getSimilarProjects,
  type Project,
  type ProjectParking,
  type ProjectUnit,
} from "../data/projectsCatalog";

type ProjectDetailsPageProps = {
  projectSlug: string | null;
};

type UnitSortKey = keyof ProjectUnit;
type ParkingSortKey = keyof ProjectParking;
type SortDirection = "asc" | "desc";

function BackArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M10.5 5.5 4 12l6.5 6.5" />
      <path d="M5 12h15" />
    </svg>
  );
}

function formatUsd(value: number) {
  return `US$ ${value.toLocaleString("es-UY")}`;
}

function formatArea(value: number) {
  return `${value} m²`;
}

function formatBedrooms(value: number) {
  return value === 0 ? "Mono" : String(value);
}

function sortValues<T extends Record<string, string | number>>(
  rows: T[],
  orderBy: keyof T,
  direction: SortDirection,
) {
  const multiplier = direction === "asc" ? 1 : -1;

  return [...rows].sort((left, right) => {
    const leftValue = left[orderBy];
    const rightValue = right[orderBy];

    if (typeof leftValue === "number" && typeof rightValue === "number") {
      return (leftValue - rightValue) * multiplier;
    }

    return String(leftValue).localeCompare(String(rightValue), "es-UY") * multiplier;
  });
}

function ProjectDetailList(props: { items: string[] }) {
  return (
    <ul className="property-detail-list">
      {props.items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function ProjectAmenityGrid(props: { items: string[] }) {
  return (
    <ul className="property-detail-list property-amenity-list project-amenity-list">
      {props.items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function ProjectSimilarCard(props: { project: Project; index: number }) {
  const { project, index } = props;

  return (
    <a
      href={getProjectUrl(project.slug)}
      className={`property-similar-card project-similar-card reveal reveal-delay-${(index % 3) + 1}`}
    >
      <div className="property-similar-media">
        <img
          src={project.cardImage}
          alt={project.title}
          width="700"
          height={project.slug === "tempo-guayabos" ? 543 : project.slug === "vila" ? 804 : 750}
          loading="lazy"
          decoding="async"
          style={{ objectPosition: project.imagePosition ?? "center center" }}
        />
        <div className="property-similar-badges">
          <span className="property-similar-pill">{project.tag}</span>
        </div>
      </div>

      <div className="property-similar-body">
        <div className="property-similar-meta">
          <span>{project.location}</span>
        </div>
        <h3>{project.title}</h3>
        <div className="project-similar-summary">
          <span>{project.unitSummary[0] ?? "Unidades disponibles"}</span>
          <span>{project.deliveryDates[0] ?? "Consultar entrega"}</span>
        </div>
      </div>
    </a>
  );
}

function SortButton(props: {
  label: string;
  active: boolean;
  direction: SortDirection;
  onClick: () => void;
}) {
  return (
    <button type="button" className="project-table-sort-button" onClick={props.onClick}>
      {props.label}
      <span aria-hidden="true">{props.active ? (props.direction === "asc" ? "↑" : "↓") : "↕"}</span>
    </button>
  );
}

function ProjectUnitsTable(props: { rows: ProjectUnit[] }) {
  const [orderBy, setOrderBy] = useState<UnitSortKey>("unit");
  const [direction, setDirection] = useState<SortDirection>("asc");
  const sortedRows = useMemo(
    () => sortValues(props.rows, orderBy, direction),
    [props.rows, orderBy, direction],
  );

  const handleSort = (key: UnitSortKey) => {
    setDirection((currentDirection) => (orderBy === key && currentDirection === "asc" ? "desc" : "asc"));
    setOrderBy(key);
  };

  return (
    <div className="project-table-wrap">
      <table className="project-availability-table">
        <thead>
          <tr>
            <th>
              <SortButton label="Unidad" active={orderBy === "unit"} direction={direction} onClick={() => handleSort("unit")} />
            </th>
            <th>
              <SortButton label="Disposición" active={orderBy === "orientation"} direction={direction} onClick={() => handleSort("orientation")} />
            </th>
            <th>
              <SortButton label="Dorms." active={orderBy === "bedrooms"} direction={direction} onClick={() => handleSort("bedrooms")} />
            </th>
            <th>
              <SortButton label="Sup. cubierta" active={orderBy === "coveredArea"} direction={direction} onClick={() => handleSort("coveredArea")} />
            </th>
            <th>
              <SortButton label="Sup. total" active={orderBy === "totalArea"} direction={direction} onClick={() => handleSort("totalArea")} />
            </th>
            <th>
              <SortButton label="Importe" active={orderBy === "price"} direction={direction} onClick={() => handleSort("price")} />
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((row) => (
            <tr key={row.unit}>
              <td data-label="Unidad">
                <span className="project-unit-chip">{row.unit}</span>
              </td>
              <td data-label="Disposición">{row.orientation}</td>
              <td data-label="Dorms.">{formatBedrooms(row.bedrooms)}</td>
              <td data-label="Sup. cubierta">{formatArea(row.coveredArea)}</td>
              <td data-label="Sup. total">{formatArea(row.totalArea)}</td>
              <td data-label="Importe">{formatUsd(row.price)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProjectParkingTable(props: { rows: ProjectParking[] }) {
  const [orderBy, setOrderBy] = useState<ParkingSortKey>("number");
  const [direction, setDirection] = useState<SortDirection>("asc");
  const sortedRows = useMemo(
    () => sortValues(props.rows, orderBy, direction),
    [props.rows, orderBy, direction],
  );

  const handleSort = (key: ParkingSortKey) => {
    setDirection((currentDirection) => (orderBy === key && currentDirection === "asc" ? "desc" : "asc"));
    setOrderBy(key);
  };

  if (!props.rows.length) {
    return (
      <div className="project-empty-state">
        Cocheras sujetas a disponibilidad. Consultá al equipo comercial por opciones vigentes.
      </div>
    );
  }

  return (
    <div className="project-table-wrap project-parking-table-wrap">
      <table className="project-availability-table project-parking-table">
        <thead>
          <tr>
            <th>
              <SortButton label="Nº" active={orderBy === "number"} direction={direction} onClick={() => handleSort("number")} />
            </th>
            <th>
              <SortButton label="Capacidad" active={orderBy === "capacity"} direction={direction} onClick={() => handleSort("capacity")} />
            </th>
            <th>
              <SortButton label="Importe" active={orderBy === "price"} direction={direction} onClick={() => handleSort("price")} />
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((row) => (
            <tr key={row.number}>
              <td data-label="Nº">
                <span className="project-unit-chip">{row.number}</span>
              </td>
              <td data-label="Capacidad">{row.capacity}</td>
              <td data-label="Importe">{formatUsd(row.price)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProjectUnitsPreview(props: { rows: ProjectUnit[] }) {
  const previewRows = props.rows.slice(0, 3);

  return (
    <div className="project-preview-card">
      <div className="project-preview-card-head">
        <h3>Unidades disponibles</h3>
        <a href="#tabla-unidades">Ver tabla</a>
      </div>

      <div className="project-preview-list">
        {previewRows.map((row) => (
          <div key={row.unit} className="project-preview-item">
            <div className="project-preview-item-main">
              <span className="project-unit-chip">{row.unit}</span>
              <strong>{formatBedrooms(row.bedrooms)} dorm.</strong>
            </div>
            <div className="project-preview-item-meta">
              <span>{formatArea(row.totalArea)}</span>
              <span>{formatUsd(row.price)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectParkingPreview(props: { rows: ProjectParking[] }) {
  const previewRows = props.rows.slice(0, 3);

  return (
    <div className="project-preview-card">
      <div className="project-preview-card-head">
        <h3>Cocheras disponibles</h3>
        <a href="#tabla-cocheras">Ver tabla</a>
      </div>

      {previewRows.length ? (
        <div className="project-preview-list">
          {previewRows.map((row) => (
            <div key={row.number} className="project-preview-item">
              <div className="project-preview-item-main">
                <span className="project-unit-chip">{row.number}</span>
                <strong>{row.capacity}</strong>
              </div>
              <div className="project-preview-item-meta">
                <span>{formatUsd(row.price)}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="project-preview-empty">
          Cocheras sujetas a disponibilidad. Consultá al equipo comercial por opciones vigentes.
        </div>
      )}
    </div>
  );
}

export default function ProjectDetailsPage(props: ProjectDetailsPageProps) {
  const project = useMemo(
    () => (props.projectSlug === null ? undefined : getProjectBySlug(props.projectSlug)),
    [props.projectSlug],
  );
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxImageIndex, setLightboxImageIndex] = useState<number | null>(null);

  useEffect(() => {
    setActiveImageIndex(0);
    setLightboxImageIndex(null);
  }, [project?.slug]);

  useEffect(() => {
    document.title = project ? `Lars | ${project.title}` : "Lars | Proyecto";
  }, [project]);

  useEffect(() => {
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>(".project-details-page .reveal:not(.is-visible)"),
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
  }, [project?.slug]);

  if (!project) {
    return (
      <div className="property-details-page project-details-page property-details-page-missing">
        <section className="property-missing-section">
          <div className="container">
            <div className="property-missing-card reveal is-visible">
              <h1>Proyecto no encontrado</h1>
              <p>La ficha que intentaste abrir ya no está disponible o todavía no tiene información cargada.</p>
              <a href="/proyectos" className="primary-button search-cta-button property-return-button">
                <BackArrowIcon />
                Volver a proyectos
              </a>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const gallery = project.gallery.length
    ? project.gallery
    : [{ image: project.image, alt: project.title, objectPosition: project.imagePosition }];
  const activeImage = gallery[Math.min(activeImageIndex, gallery.length - 1)];
  const similarProjects = getSimilarProjects(project, 3);
  const quickFacts = [
    `Tipo: ${project.tag}`,
    `Ubicación: ${project.location}`,
    `Dirección: ${project.address}`,
    `Entrega: ${project.deliveryDates.join(" / ")}`,
    `Unidades disponibles: ${project.availableUnits.length}`,
    `Cocheras disponibles: ${project.availableParking.length || "Consultar"}`,
  ];
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

  return (
    <div className="property-details-page project-details-page">
      <section className="property-details-hero project-details-hero">
        <div className="container">
          <div className="property-gallery-shell project-gallery-shell reveal reveal-delay-1" id="galeria">
            <div className="property-gallery-main">
              <button
                type="button"
                className="property-gallery-main-button"
                onClick={() => handleOpenLightbox(activeImageIndex)}
                aria-label={`Abrir imagen ${activeImageIndex + 1} de ${project.title}`}
              >
                <img
                  src={activeImage.image}
                  alt={activeImage.alt}
                  width="1400"
                  height="900"
                  fetchPriority="high"
                  decoding="async"
                  style={{ objectPosition: activeImage.objectPosition ?? "center center" }}
                />
              </button>
            </div>

            <div className="property-gallery-rail" aria-label={`Galería de ${project.title}`}>
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

          <ImageLightbox
            images={gallery}
            activeIndex={lightboxImageIndex}
            title={project.title}
            onClose={() => setLightboxImageIndex(null)}
            onIndexChange={handleLightboxIndexChange}
          />

          <div className="property-intro-shell reveal reveal-delay-2">
            <div className="property-intro-copy">
              <div className="property-headline-row">
                <div className="property-headline-copy">
                  <h1>{project.title}</h1>
                </div>
              </div>

              <div className="property-location-line">
                <span className="property-location-item">
                  <span>{project.address}</span>
                </span>
              </div>

              <div className="project-delivery-row" aria-label={`Fechas de entrega de ${project.title}`}>
                {project.deliveryDates.map((date) => (
                  <span key={date}>{date}</span>
                ))}
              </div>

              <div className="project-intro-previews">
                <ProjectUnitsPreview rows={project.availableUnits} />
                <ProjectParkingPreview rows={project.availableParking} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="property-page-content project-page-content">
        <div className="container">
          <div className="property-page-layout">
            <div className="property-main-column">
              <section className="property-flow-section reveal" id="descripcion">
                <div className="property-section-header">
                  <h2>Descripción</h2>
                </div>

                <div className="property-section-copy">
                  <p>{project.description}</p>
                </div>
              </section>

              <section className="property-flow-section reveal reveal-delay-1" id="datos">
                <div className="property-section-header">
                  <h2>Datos y beneficios</h2>
                </div>

                <div className="property-section-grid">
                  <div className="property-section-column">
                    <ProjectDetailList items={quickFacts} />
                  </div>

                  <div className="property-section-column">
                    <ProjectDetailList items={project.benefits} />
                  </div>
                </div>
              </section>

              <section className="property-flow-section reveal reveal-delay-2" id="unidades">
                <div className="property-section-header">
                  <h2>Unidades</h2>
                </div>

                <ProjectAmenityGrid items={project.unitSummary} />
              </section>

              <section className="property-flow-section reveal reveal-delay-2" id="amenities">
                <div className="property-section-header">
                  <h2>Amenities</h2>
                </div>

                <ProjectAmenityGrid items={project.amenities} />
              </section>

              <section className="property-flow-section reveal reveal-delay-2" id="servicios">
                <div className="property-section-header">
                  <h2>Servicios incluidos</h2>
                </div>

                <ProjectAmenityGrid items={project.services} />
              </section>
            </div>

            <aside className="property-contact-sidebar">
              <div className="property-contact-card reveal reveal-delay-2">
                <h2>Quiero recibir información sobre este proyecto</h2>

                <form className="property-contact-form" onSubmit={handleContactSubmit}>
                  <input type="text" placeholder="Nombre" />
                  <input type="email" placeholder="Email" />
                  <input type="text" placeholder="Teléfono" />
                  <textarea
                    rows={4}
                    defaultValue={`Me interesa ${project.title}. Quiero recibir más información sobre unidades disponibles.`}
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

      <section className="project-availability-section">
        <div className="container project-availability-layout">
          <div className="project-availability-block reveal" id="tabla-unidades">
            <div className="property-section-header">
              <h2>Unidades disponibles</h2>
            </div>
            <ProjectUnitsTable rows={project.availableUnits} />
          </div>

          <div className="project-availability-block reveal reveal-delay-1" id="tabla-cocheras">
            <div className="property-section-header">
              <h2>Cocheras disponibles</h2>
            </div>
            <ProjectParkingTable rows={project.availableParking} />
          </div>
        </div>
      </section>

      {similarProjects.length ? (
        <section className="property-similar-section project-similar-section">
          <div className="container">
            <div className="property-similar-head section-title-frame reveal">
              <h2>Más proyectos</h2>
            </div>

            <div className="property-similar-grid project-similar-grid">
              {similarProjects.map((similarProject, index) => (
                <ProjectSimilarCard key={similarProject.slug} project={similarProject} index={index} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
