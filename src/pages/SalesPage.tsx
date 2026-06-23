import { startTransition, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import ContactSection from "../components/ContactSection";
import LarsLogoLoader from "../components/LarsLogoLoader";
import { getSalesPropertyUrl, salesCatalog, type SalesProperty } from "../data/salesCatalog";

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

type SalesFilters = {
  tipo: string;
  barrio: string;
  dormitorios: string;
  precioMoneda: "usd" | "uyu";
  precioMinimo: string;
  precioMaximo: string;
  ref: string;
  orden: string;
};

const initialFilters: SalesFilters = {
  tipo: "",
  barrio: "",
  dormitorios: "",
  precioMoneda: "usd",
  precioMinimo: "",
  precioMaximo: "",
  ref: "",
  orden: "",
};

const pageSize = 6;
const salesPriceMinLimit = 0;
const salesPriceMaxLimit = 500000;

function SearchDropdownField(props: SearchDropdownFieldProps) {
  const { active, className, label, onSelect, onToggle, options, value } = props;
  const selectedOption = options.find((option) => option.value === value) ?? options[0];

  return (
    <label className={`${className} search-field-select`}>
      {label}
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
              key={`${label}-${option.value || "default"}`}
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

function clampSalesPriceValue(value: number) {
  return Math.min(salesPriceMaxLimit, Math.max(salesPriceMinLimit, value));
}

function formatSalesPriceValue(currency: SalesFilters["precioMoneda"], value: number) {
  const symbol = currency === "usd" ? "US$" : "$";
  return `${symbol} ${value.toLocaleString("es-UY")}`;
}

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
    precioMoneda: (searchParams.get("precioMoneda") as SalesFilters["precioMoneda"]) ?? "usd",
    precioMinimo: searchParams.get("precioMinimo") ?? "",
    precioMaximo: searchParams.get("precioMaximo") ?? "",
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

  if (filters.precioMinimo || filters.precioMaximo) {
    const minimum = filters.precioMinimo ? Number(filters.precioMinimo) : salesPriceMinLimit;
    const maximum = filters.precioMaximo ? Number(filters.precioMaximo) : salesPriceMaxLimit;
    chips.push(`Precio: ${formatSalesPriceValue(filters.precioMoneda, minimum)} - ${formatSalesPriceValue(filters.precioMoneda, maximum)}`);
  }

  if (filters.ref) {
    chips.push(`Ref: ${filters.ref}`);
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
  resultsTitle = "Ventas",
  showLoaderDemo = false,
}: SalesPageProps) {
  const [draftFilters, setDraftFilters] = useState<SalesFilters>(() => getInitialFiltersFromUrl());
  const [appliedFilters, setAppliedFilters] = useState<SalesFilters>(() => getInitialFiltersFromUrl());
  const [isLoaderVisible, setIsLoaderVisible] = useState(showLoaderDemo);
  const [page, setPage] = useState(1);
  const [activeDropdown, setActiveDropdown] = useState<"tipo" | "barrio" | "dormitorios" | null>(null);
  const [isCompactFiltersOpen, setIsCompactFiltersOpen] = useState(false);
  const [isCompactFilterViewport, setIsCompactFilterViewport] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(max-width: 480px)").matches : false,
  );
  const [salesPriceFieldValue, setSalesPriceFieldValue] = useState(() => getInitialFiltersFromUrl().precioMaximo || "");
  const [isSalesPriceFieldEditing, setIsSalesPriceFieldEditing] = useState(false);
  const filterPanelRef = useRef<HTMLDivElement | null>(null);

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

  const typeDropdownOptions = useMemo<SearchDropdownOption[]>(
    () => [{ value: "", label: "Todos" }, ...typeOptions.map((option) => ({ value: option, label: option }))],
    [typeOptions],
  );

  const neighborhoodDropdownOptions = useMemo<SearchDropdownOption[]>(
    () => [{ value: "", label: "Todos" }, ...neighborhoodOptions.map((option) => ({ value: option, label: option }))],
    [neighborhoodOptions],
  );

  const bedroomDropdownOptions = useMemo<SearchDropdownOption[]>(
    () => [
      { value: "", label: "Todos" },
      { value: "Monoambiente", label: "Monoambiente" },
      { value: "1", label: "1" },
      { value: "2", label: "2" },
      { value: "3", label: "3" },
      { value: "4+", label: "4+" },
    ],
    [],
  );

  const filteredProperties = useMemo(() => {
    const normalizedRef = appliedFilters.ref.trim();
    const maximumPrice = Number(appliedFilters.precioMaximo || salesPriceMaxLimit);

    const filtered = salesCatalog.filter((property) => {
      const matchesType = appliedFilters.tipo ? property.type === appliedFilters.tipo : true;
      const matchesLocation = appliedFilters.barrio ? property.location === appliedFilters.barrio : true;
      const matchesRef = normalizedRef
        ? property.ref.includes(normalizedRef) || String(property.id).includes(normalizedRef)
        : true;
      const matchesMinimum = true;
      const matchesMaximum = appliedFilters.precioMaximo ? property.priceValue <= maximumPrice : true;

      return (
        matchesType &&
        matchesLocation &&
        matchesBedrooms(property, appliedFilters.dormitorios) &&
        matchesMinimum &&
        matchesMaximum &&
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
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(max-width: 480px)");
    const handleMediaQueryChange = (event: MediaQueryListEvent) => {
      setIsCompactFilterViewport(event.matches);
      if (!event.matches) {
        setIsCompactFiltersOpen(false);
      }
    };

    setIsCompactFilterViewport(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleMediaQueryChange);

    return () => mediaQuery.removeEventListener("change", handleMediaQueryChange);
  }, []);

  useEffect(() => {
    if (!activeDropdown) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!filterPanelRef.current?.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveDropdown(null);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeDropdown]);

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

  useEffect(() => {
    if (!isSalesPriceFieldEditing) {
      setSalesPriceFieldValue(draftFilters.precioMaximo || "");
    }
  }, [draftFilters.precioMaximo, isSalesPriceFieldEditing]);

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
      [field]: value,
    }));
  };

  const handleSalesPriceFieldFocus = () => {
    setIsSalesPriceFieldEditing(true);
    setSalesPriceFieldValue(draftFilters.precioMaximo || "");
  };

  const handleSalesPriceFieldChange = (value: string) => {
    setSalesPriceFieldValue(value.replace(/\D/g, ""));
  };

  const handleSalesPriceFieldBlur = () => {
    setIsSalesPriceFieldEditing(false);
    const normalizedValue = salesPriceFieldValue.replace(/\D/g, "");
    const nextMax = normalizedValue ? String(clampSalesPriceValue(Number(normalizedValue))) : "";

    setSalesPriceFieldValue(nextMax);
    setDraftFilters((currentFilters) => ({
      ...currentFilters,
      precioMoneda: listingContext === "alquileres" ? "uyu" : "usd",
      precioMinimo: "",
      precioMaximo: nextMax,
    }));
  };

  const handleApplyFilters = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    startTransition(() => {
      setAppliedFilters({ ...draftFilters });
      setPage(1);
    });
    setActiveDropdown(null);
    if (isCompactFilterViewport) {
      setIsCompactFiltersOpen(false);
    }
  };

  const handleResetFilters = () => {
    startTransition(() => {
      setDraftFilters(initialFilters);
      setAppliedFilters(initialFilters);
      setSalesPriceFieldValue("");
      setPage(1);
    });
    setActiveDropdown(null);
    if (isCompactFilterViewport) {
      setIsCompactFiltersOpen(false);
    }
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
            <button
              type="button"
              className={`sales-filter-toggle${isCompactFiltersOpen ? " is-open" : ""}`}
              onClick={() => setIsCompactFiltersOpen((currentValue) => !currentValue)}
              aria-expanded={isCompactFilterViewport ? isCompactFiltersOpen : true}
              aria-controls={`${listingContext}-filters-panel`}
            >
              <span className="sales-filter-toggle-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="M4 7h16M7 12h10M10 17h4" />
                </svg>
              </span>
              <span>Filtros</span>
              <span className="sales-filter-toggle-caret" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </span>
            </button>

            <div
              id={`${listingContext}-filters-panel`}
              className={`sales-filter-collapse${isCompactFiltersOpen ? " is-open" : ""}`}
              aria-hidden={isCompactFilterViewport ? !isCompactFiltersOpen : undefined}
              ref={filterPanelRef}
            >
              <div className="sales-filter-grid">
                <SearchDropdownField
                  active={activeDropdown === "tipo"}
                  className={`sales-filter-field sales-filter-field-type${
                    draftFilters.tipo.toLowerCase() === "casa" ? " sales-filter-field-type-house" : " sales-filter-field-type-building"
                  }`}
                  label="Tipo"
                  onSelect={(value) => {
                    handleDraftFilterChange("tipo", value);
                    setActiveDropdown(null);
                  }}
                  onToggle={() => {
                    setActiveDropdown((currentValue) => (currentValue === "tipo" ? null : "tipo"));
                  }}
                  options={typeDropdownOptions}
                  value={draftFilters.tipo}
                />

                <SearchDropdownField
                  active={activeDropdown === "barrio"}
                  className="sales-filter-field sales-filter-field-zone"
                  label="Barrio"
                  onSelect={(value) => {
                    handleDraftFilterChange("barrio", value);
                    setActiveDropdown(null);
                  }}
                  onToggle={() => {
                    setActiveDropdown((currentValue) => (currentValue === "barrio" ? null : "barrio"));
                  }}
                  options={neighborhoodDropdownOptions}
                  value={draftFilters.barrio}
                />

                <SearchDropdownField
                  active={activeDropdown === "dormitorios"}
                  className="sales-filter-field sales-filter-field-bedrooms"
                  label="Dormitorios"
                  onSelect={(value) => {
                    handleDraftFilterChange("dormitorios", value);
                    setActiveDropdown(null);
                  }}
                  onToggle={() => {
                    setActiveDropdown((currentValue) => (currentValue === "dormitorios" ? null : "dormitorios"));
                  }}
                  options={bedroomDropdownOptions}
                  value={draftFilters.dormitorios}
                />

                <div className="sales-filter-field sales-filter-field-price">
                  <span>Precio</span>
                  <div className="search-price-trigger-input-shell sales-price-trigger-input-shell">
                    <span className="search-price-trigger-prefix">
                      {`Hasta ${listingContext === "alquileres" ? "$" : "US$"}`}
                    </span>
                    <input
                      className="search-price-trigger-input sales-price-trigger-input"
                      type="text"
                      inputMode="numeric"
                      value={salesPriceFieldValue}
                      onFocus={handleSalesPriceFieldFocus}
                      onChange={(event) => handleSalesPriceFieldChange(event.currentTarget.value)}
                      onBlur={handleSalesPriceFieldBlur}
                    />
                  </div>
                </div>

                <label className="sales-filter-field sales-filter-field-reference">
                  <span>Referencia</span>
                  <input
                    type="text"
                    placeholder="Ej: 013"
                    value={draftFilters.ref}
                    onChange={(event) => handleDraftFilterChange("ref", event.target.value)}
                  />
                </label>

                <div className="sales-filter-buttons">
                  <button type="submit" className="primary-button search-cta-button">
                    Buscar
                  </button>
                </div>
              </div>

              {activeFilterChips.length ? (
                <div className="sales-filter-actions">
                  <div className="sales-filter-summary">
                    <span>Los filtros aplicados aparecen destacados abajo.</span>
                  </div>
                </div>
              ) : null}
            </div>
          </form>
        </div>
      </section>

      <section className="sales-results" id="ventas-resultados">
        <div className="container">
          <div className="sales-results-head reveal">
            <div className="sales-results-copy section-title-frame">
              <h2>{resultsTitle}</h2>
            </div>

            <div className="sales-active-filters">
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
                      src={property.cardImage}
                      alt={property.title}
                      className="sales-listing-image"
                      width="700"
                      height="394"
                      loading="lazy"
                      decoding="async"
                      style={{ objectPosition: property.imagePosition ?? "center center" }}
                    />

                    <div className="sales-listing-badges">
                      {!property.reserved ? (
                        <span className="sales-listing-pill">{property.type}</span>
                      ) : null}
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
                        <img src="/optimized/home/icon-dorm.webp" alt="" width="40" height="36" />
                        <span>{property.rooms === 0 ? 1 : property.rooms}</span>
                      </div>
                      <div className="sales-listing-stat">
                        <img src="/optimized/home/icon-banos.webp" alt="" width="39" height="40" />
                        <span>{property.bathrooms}</span>
                      </div>
                      <div className="sales-listing-stat">
                        <img src="/optimized/home/icon-sup.webp" alt="" width="40" height="36" />
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
              {page > 1 ? (
                <button
                  type="button"
                  className="sales-page-button sales-page-arrow-button"
                  onClick={() => handlePageChange(page - 1)}
                  aria-label="Página anterior"
                >
                  <PaginationArrowIcon direction="left" />
                </button>
              ) : null}

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

              {page < totalPages ? (
                <button
                  type="button"
                  className="sales-page-button sales-page-arrow-button"
                  onClick={() => handlePageChange(page + 1)}
                  aria-label="Página siguiente"
                >
                  <PaginationArrowIcon direction="right" />
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>

      <ContactSection />
    </div>
  );
}
