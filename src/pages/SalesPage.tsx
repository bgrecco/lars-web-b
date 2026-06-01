import { startTransition, useEffect, useMemo, useState, type FormEvent } from "react";
import ContactSection from "../components/ContactSection";
import LarsLogoLoader from "../components/LarsLogoLoader";
import { getSalesPropertyUrl, salesCatalog, type SalesProperty } from "../data/salesCatalog";

type SalesFilters = {
  tipo: string;
  barrio: string;
  dormitorios: string;
  banos: string;
  minimoUsd: string;
  ref: string;
  orden: string;
};

const initialFilters: SalesFilters = {
  tipo: "",
  barrio: "",
  dormitorios: "",
  banos: "",
  minimoUsd: "",
  ref: "",
  orden: "",
};

const sortOptions = [
  { value: "", label: "Relevancia" },
  { value: "precio-asc", label: "Precio: menor a mayor" },
  { value: "precio-desc", label: "Precio: mayor a menor" },
  { value: "dorms-desc", label: "Dormitorios: mayor a menor" },
];

const currencyFormatter = new Intl.NumberFormat("es-UY");
const pageSize = 6;

function getInitialFiltersFromUrl(): SalesFilters {
  if (typeof window === "undefined") {
    return initialFilters;
  }

  const searchParams = new URLSearchParams(window.location.search);

  return {
    ...initialFilters,
    tipo: searchParams.get("tipo") ?? "",
    barrio: searchParams.get("barrio") ?? "",
    dormitorios: searchParams.get("dormitorios") ?? "",
    banos: searchParams.get("banos") ?? "",
  };
}

function matchesBedrooms(property: SalesProperty, dormitorios: string) {
  if (!dormitorios) {
    return true;
  }

  if (dormitorios === "Monoambiente") {
    return property.rooms === 0;
  }

  if (dormitorios === "4+") {
    return property.rooms >= 4;
  }

  return String(property.rooms) === dormitorios;
}

function matchesBathrooms(property: SalesProperty, banos: string) {
  if (!banos) {
    return true;
  }

  if (banos === "4+") {
    return property.bathrooms >= 4;
  }

  return String(property.bathrooms) === banos;
}

function PaginationArrowIcon(props: { direction: "left" | "right" }) {
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

function getActiveFilterChips(filters: SalesFilters) {
  const chips: string[] = [];

  if (filters.tipo) {
    chips.push(`Tipo: ${filters.tipo}`);
  }

  if (filters.barrio) {
    chips.push(`Barrio: ${filters.barrio}`);
  }

  if (filters.dormitorios) {
    chips.push(`Dormitorios: ${filters.dormitorios}`);
  }

  if (filters.banos) {
    chips.push(`Baños: ${filters.banos}`);
  }

  if (filters.minimoUsd) {
    chips.push(`Desde US$ ${currencyFormatter.format(Number(filters.minimoUsd))}`);
  }

  if (filters.ref) {
    chips.push(`Ref: ${filters.ref}`);
  }

  if (filters.orden) {
    chips.push(`Orden: ${sortOptions.find((option) => option.value === filters.orden)?.label ?? filters.orden}`);
  }

  return chips;
}

type SalesPageProps = {
  listingContext?: "ventas" | "alquileres";
  resultsTitle?: string;
  showLoaderDemo?: boolean;
};

export default function SalesPage({
  listingContext = "ventas",
  resultsTitle = "Propiedades en venta",
  showLoaderDemo = false,
}: SalesPageProps) {
  const [draftFilters, setDraftFilters] = useState<SalesFilters>(() => getInitialFiltersFromUrl());
  const [appliedFilters, setAppliedFilters] = useState<SalesFilters>(() => getInitialFiltersFromUrl());
  const [isLoaderVisible, setIsLoaderVisible] = useState(showLoaderDemo);
  const [page, setPage] = useState(1);

  const typeOptions = useMemo(
    () => Array.from(new Set(salesCatalog.map((property) => property.type))).sort((left, right) => left.localeCompare(right, "es")),
    [],
  );

  const neighborhoodOptions = useMemo(
    () =>
      Array.from(new Set(salesCatalog.map((property) => property.location))).sort((left, right) =>
        left.localeCompare(right, "es"),
      ),
    [],
  );

  const filteredProperties = useMemo(() => {
    const normalizedRef = appliedFilters.ref.trim();
    const minimumUsd = Number(appliedFilters.minimoUsd || 0);

    const filtered = salesCatalog.filter((property) => {
      const matchesType = appliedFilters.tipo ? property.type === appliedFilters.tipo : true;
      const matchesLocation = appliedFilters.barrio ? property.location === appliedFilters.barrio : true;
      const matchesRef = normalizedRef
        ? property.ref.includes(normalizedRef) || String(property.id).includes(normalizedRef)
        : true;
      const matchesMinimum = minimumUsd ? property.priceValue >= minimumUsd : true;

      return (
        matchesType &&
        matchesLocation &&
        matchesBedrooms(property, appliedFilters.dormitorios) &&
        matchesBathrooms(property, appliedFilters.banos) &&
        matchesMinimum &&
        matchesRef
      );
    });

    if (appliedFilters.orden === "precio-asc") {
      filtered.sort((left, right) => left.priceValue - right.priceValue);
    } else if (appliedFilters.orden === "precio-desc") {
      filtered.sort((left, right) => right.priceValue - left.priceValue);
    } else if (appliedFilters.orden === "dorms-desc") {
      filtered.sort((left, right) => right.rooms - left.rooms);
    }

    return filtered;
  }, [appliedFilters]);

  const totalPages = Math.max(1, Math.ceil(filteredProperties.length / pageSize));
  const visibleProperties = filteredProperties.slice((page - 1) * pageSize, page * pageSize);
  const activeFilterChips = getActiveFilterChips(appliedFilters);

  useEffect(() => {
    if (!showLoaderDemo) {
      setIsLoaderVisible(false);
      return;
    }

    setIsLoaderVisible(true);

    const timeoutId = window.setTimeout(() => {
      setIsLoaderVisible(false);
    }, 950);

    return () => window.clearTimeout(timeoutId);
  }, [showLoaderDemo]);

  useEffect(() => {
    if (isLoaderVisible) {
      return;
    }

    const elements = Array.from(document.querySelectorAll<HTMLElement>(".sales-page .reveal:not(.is-visible)"));

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
  }, [isLoaderVisible, page, totalPages, visibleProperties.length, activeFilterChips.length]);

  if (isLoaderVisible) {
    return (
      <div className="sales-page">
        <section className="sales-loader-section" aria-live="polite">
          <LarsLogoLoader />
        </section>
      </div>
    );
  }

  const handleDraftFilterChange = (field: keyof SalesFilters, value: string) => {
    setDraftFilters((currentFilters) => ({
      ...currentFilters,
      [field]: field === "minimoUsd" ? value.replace(/[^\d]/g, "") : value,
    }));
  };

  const handleApplyFilters = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    startTransition(() => {
      setAppliedFilters({ ...draftFilters });
      setPage(1);
    });
  };

  const handleResetFilters = () => {
    startTransition(() => {
      setDraftFilters(initialFilters);
      setAppliedFilters(initialFilters);
      setPage(1);
    });
  };

  const handlePageChange = (nextPage: number) => {
    const clampedPage = Math.min(Math.max(nextPage, 1), totalPages);

    startTransition(() => {
      setPage(clampedPage);
      document.getElementById("ventas-resultados")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <div className="sales-page">
      <section className="sales-filter-band" id="ventas-filtros">
        <div className="container">
          <form className="sales-filter-card reveal" onSubmit={handleApplyFilters}>
            <div className="sales-filter-header">
              <div>
                <h2>Filtros</h2>
              </div>
            </div>

            <div className="sales-filter-grid">
              <label className="sales-filter-field">
                <span>Tipo</span>
                <select
                  value={draftFilters.tipo}
                  onChange={(event) => handleDraftFilterChange("tipo", event.target.value)}
                >
                  <option value="">Todos</option>
                  {typeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="sales-filter-field">
                <span>Barrio</span>
                <select
                  value={draftFilters.barrio}
                  onChange={(event) => handleDraftFilterChange("barrio", event.target.value)}
                >
                  <option value="">Todos</option>
                  {neighborhoodOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="sales-filter-field">
                <span>Dormitorios</span>
                <select
                  value={draftFilters.dormitorios}
                  onChange={(event) => handleDraftFilterChange("dormitorios", event.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="Monoambiente">Monoambiente</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4+">4+</option>
                </select>
              </label>

              <label className="sales-filter-field">
                <span>Baños</span>
                <select
                  value={draftFilters.banos}
                  onChange={(event) => handleDraftFilterChange("banos", event.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4+">4+</option>
                </select>
              </label>

              <label className="sales-filter-field">
                <span>Mínimo US$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Ej: 180000"
                  value={draftFilters.minimoUsd}
                  onChange={(event) => handleDraftFilterChange("minimoUsd", event.target.value)}
                />
              </label>

              <label className="sales-filter-field">
                <span>Nro. ref</span>
                <input
                  type="text"
                  placeholder="Ej: 013"
                  value={draftFilters.ref}
                  onChange={(event) => handleDraftFilterChange("ref", event.target.value)}
                />
              </label>

              <label className="sales-filter-field">
                <span>Ordenar</span>
                <select
                  value={draftFilters.orden}
                  onChange={(event) => handleDraftFilterChange("orden", event.target.value)}
                >
                  {sortOptions.map((option) => (
                    <option key={option.value || "default"} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="sales-filter-actions">
              <div className="sales-filter-summary">
                {activeFilterChips.length ? (
                  <span>Los filtros aplicados aparecen destacados abajo.</span>
                ) : null}
              </div>

              <div className="sales-filter-buttons">
                <button type="submit" className="primary-button search-cta-button">
                  Buscar
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>

      <section className="sales-results" id="ventas-resultados">
        <div className="container">
          <div className="sales-results-head reveal">
            <div className="sales-results-copy">
              <h2>{resultsTitle}</h2>
            </div>

            <div className="sales-active-filters" aria-label="Filtros activos">
              {activeFilterChips.length ? (
                activeFilterChips.map((chip) => (
                  <span key={chip} className="sales-filter-chip">
                    {chip}
                  </span>
                ))
              ) : null}
            </div>
          </div>

          {visibleProperties.length ? (
            <div className="sales-grid">
              {visibleProperties.map((property, index) => (
                <article
                  key={property.id}
                  className={`sales-listing-card${property.reserved ? " is-reserved" : ""} reveal reveal-delay-${(index % 4) + 1}`}
                >
                  <a
                    href={getSalesPropertyUrl(property.id, listingContext)}
                    className="sales-listing-card-hitarea"
                    aria-label={`Ver detalles de ${property.title}`}
                  />

                  <div className="sales-listing-media">
                    <img
                      src={property.image}
                      alt={property.title}
                      className="sales-listing-image"
                      style={{ objectPosition: property.imagePosition ?? "center center" }}
                    />

                    <div className="sales-listing-badges">
                      <span className="sales-listing-pill">{property.type}</span>
                      {property.reserved ? (
                        <span className="sales-listing-pill is-reserved">Reservada</span>
                      ) : null}
                    </div>
                  </div>

                  <div className="sales-listing-body">
                    <div className="sales-listing-meta">
                      <span>{property.location}</span>
                      <span>Ref. {property.ref}</span>
                    </div>

                    <div className="sales-listing-copy">
                      <h3>{property.title}</h3>
                      <p>{property.summary}</p>
                    </div>

                    <div className="sales-listing-stats" aria-label={`Datos de ${property.title}`}>
                      <div className="sales-listing-stat">
                        <img src="/icon-dorm.png" alt="" />
                        <span>{property.rooms === 0 ? 1 : property.rooms}</span>
                      </div>
                      <div className="sales-listing-stat">
                        <img src="/icon-banos.png" alt="" />
                        <span>{property.bathrooms}</span>
                      </div>
                      <div className="sales-listing-stat">
                        <img src="/icon-sup.png" alt="" />
                        <span>{property.size}</span>
                      </div>
                    </div>

                    <div className="sales-listing-footer">
                      <strong>{property.price}</strong>
                      {!property.reserved ? (
                        <a href={`${getSalesPropertyUrl(property.id, listingContext)}#consulta`} className="text-link sales-listing-link">
                          Consultar
                        </a>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="sales-empty-state reveal reveal-delay-1">
              <h3>No encontramos propiedades con esos criterios.</h3>
              <p>
                Puedes limpiar filtros o ajustar barrio, dormitorios y presupuesto para volver a
                abrir el abanico.
              </p>
              <button type="button" className="primary-button search-cta-button" onClick={handleResetFilters}>
                Limpiar filtros
              </button>
            </div>
          )}

          {totalPages > 1 ? (
            <div className="sales-pagination reveal reveal-delay-2" aria-label="Paginación de propiedades">
              <button
                type="button"
                className="sales-page-button sales-page-arrow-button"
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                aria-label="Página anterior"
              >
                <PaginationArrowIcon direction="left" />
              </button>

              <div className="sales-page-numbers">
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                  <button
                    key={pageNumber}
                    type="button"
                    className={`sales-page-button${pageNumber === page ? " is-current" : ""}`}
                    onClick={() => handlePageChange(pageNumber)}
                    aria-current={pageNumber === page ? "page" : undefined}
                  >
                    {pageNumber}
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="sales-page-button sales-page-arrow-button"
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                aria-label="Página siguiente"
              >
                <PaginationArrowIcon direction="right" />
              </button>
            </div>
          ) : null}
        </div>
      </section>

      <ContactSection />
    </div>
  );
}
