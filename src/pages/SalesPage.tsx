import { startTransition, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { fetchProperties, getLarsApiErrorMessage, isAbortError, type PropertyListQuery } from "../api/larsApi";
import LarsLogoLoader from "../components/LarsLogoLoader";
import { canUseMockCatalogFallback, shouldUseMockCatalog } from "../config/dataSource";
import { getSalesPropertyUrl, salesCatalog, type SalesProperty } from "../data/salesCatalog";

type SearchDropdownOption = {
  value: string;
  label: string;
};

type SearchDropdownFieldProps = {
  active: boolean;
  className: string;
  label: string;
  multipleValues?: string[];
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

type ActiveSalesFilterKey = "tipo" | "barrio" | "dormitorios" | "precio" | "ref";

type SalesFilterChip = {
  key: ActiveSalesFilterKey;
  label: string;
  clearLabel: string;
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

const pageSize = 8;
const salesPriceMinLimit = 0;
const salesPriceMaxLimit = 500000;
const salesPriceStep = 5000;
const projectTypeFilterValue = "__proyectos__";

function SearchDropdownField(props: SearchDropdownFieldProps) {
  const { active, className, label, multipleValues, onSelect, onToggle, options, value } = props;
  const isMultiple = Boolean(multipleValues);
  const selectedValues = multipleValues ?? [];
  const selectedOption = options.find((option) => option.value === value) ?? options[0];
  const selectedMultipleOptions = options.filter((option) => selectedValues.includes(option.value));
  const selectedLabel = isMultiple
    ? selectedMultipleOptions.length
      ? selectedMultipleOptions.map((option) => option.label).join(", ")
      : options[0]?.label ?? ""
    : selectedOption.label;
  const tooltipItems = selectedMultipleOptions.filter((option) => option.value);
  const showTooltip = isMultiple && tooltipItems.length > 1;

  return (
    <label className={`${className} search-field-select`}>
      <span className="sales-filter-field-label">{label}</span>
      <button
        type="button"
        className={`search-select-trigger${active ? " is-open" : ""}`}
        aria-expanded={active}
        aria-haspopup="listbox"
        onClick={onToggle}
      >
        <span className="search-select-trigger-text">{selectedLabel}</span>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {showTooltip && !active ? (
        <span className="search-select-tooltip" role="tooltip">
          {tooltipItems.map((option) => (
            <span key={`tooltip-${option.value}`}>{option.label}</span>
          ))}
        </span>
      ) : null}
      {active ? (
        <div className="search-select-popover" role="listbox" aria-label={label} aria-multiselectable={isMultiple || undefined}>
          {options.map((option) => (
            <button
              key={`${label}-${option.value || "default"}`}
              type="button"
              className={`search-select-option${
                (isMultiple
                  ? option.value
                    ? selectedValues.includes(option.value)
                    : selectedValues.length === 0
                  : option.value === value)
                  ? " is-active"
                  : ""
              }`}
              aria-selected={
                isMultiple
                  ? option.value
                    ? selectedValues.includes(option.value)
                    : selectedValues.length === 0
                  : option.value === value
              }
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

function getDefaultPriceCurrency(listingContext: SalesPageProps["listingContext"]): SalesFilters["precioMoneda"] {
  return listingContext === "alquileres" ? "uyu" : "usd";
}

function parseSalesPriceCurrency(value: string | null, listingContext: SalesPageProps["listingContext"]) {
  return value === "usd" || value === "uyu" ? value : getDefaultPriceCurrency(listingContext);
}

function getEmptyFilters(listingContext: SalesPageProps["listingContext"]): SalesFilters {
  return {
    ...initialFilters,
    precioMoneda: getDefaultPriceCurrency(listingContext),
  };
}

function getInitialFiltersFromUrl(listingContext: SalesPageProps["listingContext"] = "ventas"): SalesFilters {
  if (typeof window === "undefined") {
    return getEmptyFilters(listingContext);
  }

  const searchParams = new URLSearchParams(window.location.search);

  return {
    ...getEmptyFilters(listingContext),
    tipo: searchParams.get("tipo") ?? "",
    barrio: searchParams.getAll("barrio").join(",") || (searchParams.get("barrio") ?? ""),
    dormitorios: searchParams.get("dormitorios") ?? "",
    precioMoneda: parseSalesPriceCurrency(searchParams.get("precioMoneda"), listingContext),
    precioMinimo: searchParams.get("precioMinimo") ?? "",
    precioMaximo: searchParams.get("precioMaximo") ?? "",
    ref: searchParams.get("ref") ?? "",
    orden: searchParams.get("orden") ?? "",
  };
}

function buildSalesFilterSearchParams(filters: SalesFilters) {
  const searchParams = new URLSearchParams();
  const selectedNeighborhoods = getSelectedNeighborhoods(filters.barrio);
  const hasPriceFilter = Boolean(filters.precioMinimo || filters.precioMaximo);

  if (filters.tipo) {
    searchParams.set("tipo", filters.tipo);
  }

  selectedNeighborhoods.forEach((neighborhood) => {
    searchParams.append("barrio", neighborhood);
  });

  if (filters.dormitorios) {
    searchParams.set("dormitorios", filters.dormitorios);
  }

  if (hasPriceFilter) {
    searchParams.set("precioMoneda", filters.precioMoneda);
  }

  if (filters.precioMinimo) {
    searchParams.set("precioMinimo", filters.precioMinimo);
  }

  if (filters.precioMaximo) {
    searchParams.set("precioMaximo", filters.precioMaximo);
  }

  if (filters.ref.trim()) {
    searchParams.set("ref", filters.ref.trim());
  }

  if (filters.orden) {
    searchParams.set("orden", filters.orden);
  }

  return searchParams;
}

function writeSalesFilterSearchParams(filters: SalesFilters) {
  if (typeof window === "undefined") {
    return;
  }

  const searchParams = buildSalesFilterSearchParams(filters);
  const nextSearch = searchParams.toString();
  const nextUrl = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ""}${window.location.hash}`;
  const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;

  if (nextUrl !== currentUrl) {
    window.history.pushState(null, "", nextUrl);
  }
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

function getSelectedNeighborhoods(value: string) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function getPropertyListQueryKey(listingContext: SalesPageProps["listingContext"], query: PropertyListQuery) {
  return JSON.stringify({
    listingContext,
    barrio: query.barrio ?? "",
    ref: query.ref ?? "",
    tipo: query.tipo ?? "",
  });
}

function getVisiblePaginationItems(page: number, totalPages: number) {
  return Array.from({ length: 3 }, (_, index) => page + index).filter((item) => item <= totalPages);
}

function scrollToCatalogTop() {
  const scrollToTarget = () => {
    const target = document.getElementById("ventas-catalogo") ?? document.getElementById("ventas-resultados");

    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  scrollToTarget();
  window.requestAnimationFrame(() => {
    scrollToTarget();
  });
  window.setTimeout(scrollToTarget, 80);
}

function PaginationArrowIcon(props: { direction: "left" | "right" }) {
  const { direction } = props;
  const primaryPath = direction === "left" ? "M14.5 5.5 8 12l6.5 6.5" : "m9.5 5.5 6.5 6.5-6.5 6.5";

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d={primaryPath}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function getFiltersWithClearedChip(
  filters: SalesFilters,
  filterKey: ActiveSalesFilterKey,
  listingContext: SalesPageProps["listingContext"],
): SalesFilters {
  if (filterKey === "precio") {
    return {
      ...filters,
      precioMoneda: getDefaultPriceCurrency(listingContext),
      precioMinimo: "",
      precioMaximo: "",
    };
  }

  return {
    ...filters,
    [filterKey]: "",
  };
}

function formatFilterChipValue(value: string) {
  if (!value) {
    return value;
  }

  return value.charAt(0).toLocaleUpperCase("es-UY") + value.slice(1);
}

function getActiveFilterChips(filters: SalesFilters) {
  const chips: SalesFilterChip[] = [];

  if (filters.tipo) {
    chips.push({
      key: "tipo",
      label: filters.tipo === projectTypeFilterValue ? "Proyecto" : formatFilterChipValue(filters.tipo),
      clearLabel: `Quitar filtro de tipo ${filters.tipo}`,
    });
  }

  if (filters.barrio) {
    const neighborhoods = filters.barrio.split(",").filter(Boolean).join(", ");

    chips.push({
      key: "barrio",
      label: neighborhoods,
      clearLabel: `Quitar filtro de barrios ${neighborhoods}`,
    });
  }

  if (filters.dormitorios) {
    chips.push({
      key: "dormitorios",
      label: filters.dormitorios,
      clearLabel: `Quitar filtro de dormitorios ${filters.dormitorios}`,
    });
  }

  if (filters.precioMinimo || filters.precioMaximo) {
    const minimum = filters.precioMinimo ? Number(filters.precioMinimo) : salesPriceMinLimit;
    const maximum = filters.precioMaximo ? Number(filters.precioMaximo) : salesPriceMaxLimit;
    chips.push({
      key: "precio",
      label: `${formatSalesPriceValue(filters.precioMoneda, minimum)} - ${formatSalesPriceValue(filters.precioMoneda, maximum)}`,
      clearLabel: "Quitar filtro de precio",
    });
  }

  if (filters.ref) {
    chips.push({
      key: "ref",
      label: filters.ref,
      clearLabel: `Quitar filtro de referencia ${filters.ref}`,
    });
  }

  return chips;
}

type SalesPageProps = {
  listingContext?: "ventas" | "alquileres";
  resultsTitle?: string;
  hideResultsTitle?: boolean;
  showLoaderDemo?: boolean;
};

export default function SalesPage({
  listingContext = "ventas",
  resultsTitle = "Ventas",
  hideResultsTitle = false,
  showLoaderDemo = false,
}: SalesPageProps) {
  const [draftFilters, setDraftFilters] = useState<SalesFilters>(() => getInitialFiltersFromUrl(listingContext));
  const [appliedFilters, setAppliedFilters] = useState<SalesFilters>(() => getInitialFiltersFromUrl(listingContext));
  const [properties, setProperties] = useState<SalesProperty[]>([]);
  const [loadedPropertiesQueryKey, setLoadedPropertiesQueryKey] = useState("");
  const [isLoadingProperties, setIsLoadingProperties] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isUsingFallbackCatalog, setIsUsingFallbackCatalog] = useState(false);
  const [isLoaderVisible, setIsLoaderVisible] = useState(showLoaderDemo);
  const [page, setPage] = useState(1);
  const [activeDropdown, setActiveDropdown] = useState<"tipo" | "barrio" | "precio" | "dormitorios" | null>(null);
  const [isCompactFiltersOpen, setIsCompactFiltersOpen] = useState(false);
  const [isCompactFilterViewport, setIsCompactFilterViewport] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(max-width: 480px)").matches : false,
  );
  const [salesPriceFieldValue, setSalesPriceFieldValue] = useState(
    () => getInitialFiltersFromUrl(listingContext).precioMaximo || "",
  );
  const [isSalesPriceFieldEditing, setIsSalesPriceFieldEditing] = useState(false);
  const filterPanelRef = useRef<HTMLDivElement | null>(null);

  const typeOptions = useMemo(
    () => Array.from(new Set(properties.map((property) => property.type))).sort((left, right) => left.localeCompare(right, "es")),
    [properties],
  );

  const neighborhoodOptions = useMemo(
    () =>
      Array.from(new Set(properties.map((property) => property.location))).sort((left, right) =>
        left.localeCompare(right, "es"),
      ),
    [properties],
  );

  const typeDropdownOptions = useMemo<SearchDropdownOption[]>(
    () => [
      { value: "", label: "Todos" },
      ...typeOptions.map((option) => ({ value: option, label: option })),
      { value: projectTypeFilterValue, label: "Proyecto" },
    ],
    [typeOptions],
  );

  const neighborhoodDropdownOptions = useMemo<SearchDropdownOption[]>(
    () => [{ value: "", label: "Todos" }, ...neighborhoodOptions.map((option) => ({ value: option, label: option }))],
    [neighborhoodOptions],
  );

  const bedroomDropdownOptions = useMemo<SearchDropdownOption[]>(
    () => [
      { value: "0", label: "0" },
      { value: "1", label: "1" },
      { value: "2", label: "2" },
      { value: "3", label: "3" },
      { value: "4+", label: "4 +" },
    ],
    [],
  );

  const propertyListQuery = useMemo<PropertyListQuery>(() => {
    const selectedNeighborhoods = getSelectedNeighborhoods(appliedFilters.barrio);

    return {
      tipo: appliedFilters.tipo || undefined,
      barrio: selectedNeighborhoods.length === 1 ? selectedNeighborhoods[0] : undefined,
      ref: appliedFilters.ref.trim() || undefined,
    };
  }, [appliedFilters.barrio, appliedFilters.ref, appliedFilters.tipo]);
  const propertyListQueryKey = useMemo(
    () => getPropertyListQueryKey(listingContext, propertyListQuery),
    [listingContext, propertyListQuery],
  );
  const hasLoadedCurrentProperties = loadedPropertiesQueryKey === propertyListQueryKey;

  useEffect(() => {
    const controller = new AbortController();

    setIsLoadingProperties(true);
    setLoadError("");
    setIsUsingFallbackCatalog(false);

    if (shouldUseMockCatalog) {
      setProperties(salesCatalog);
      setLoadedPropertiesQueryKey(propertyListQueryKey);
      setIsLoadingProperties(false);
      return;
    }

    fetchProperties(listingContext, propertyListQuery, controller.signal)
      .then((nextProperties) => {
        setProperties(nextProperties);
        setLoadedPropertiesQueryKey(propertyListQueryKey);
      })
      .catch((error: unknown) => {
        if (isAbortError(error)) {
          return;
        }

        setLoadError(getLarsApiErrorMessage(error));
        setProperties(canUseMockCatalogFallback ? salesCatalog : []);
        setLoadedPropertiesQueryKey(propertyListQueryKey);
        setIsUsingFallbackCatalog(canUseMockCatalogFallback);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoadingProperties(false);
        }
      });

    return () => controller.abort();
  }, [listingContext, propertyListQuery, propertyListQueryKey]);

  const filteredProperties = useMemo(() => {
    if (!hasLoadedCurrentProperties) {
      return [];
    }

    const normalizedRef = appliedFilters.ref.trim();
    const minimumPrice = Number(appliedFilters.precioMinimo || salesPriceMinLimit);
    const maximumPrice = Number(appliedFilters.precioMaximo || salesPriceMaxLimit);

    const filtered = properties.filter((property) => {
      const matchesType = appliedFilters.tipo ? property.type === appliedFilters.tipo : true;
      const selectedNeighborhoods = getSelectedNeighborhoods(appliedFilters.barrio);
      const matchesLocation = selectedNeighborhoods.length ? selectedNeighborhoods.includes(property.location) : true;
      const matchesRef = normalizedRef
        ? String(property.ref).includes(normalizedRef) || String(property.id).includes(normalizedRef)
        : true;
      const matchesMinimum = appliedFilters.precioMinimo ? property.priceValue >= minimumPrice : true;
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
  }, [appliedFilters, hasLoadedCurrentProperties, properties]);

  const totalPages = Math.max(1, Math.ceil(filteredProperties.length / pageSize));
  const visibleProperties = filteredProperties.slice((page - 1) * pageSize, page * pageSize);
  const isWaitingForCurrentProperties = !hasLoadedCurrentProperties || (isLoadingProperties && !properties.length);
  const isCatalogLoading = isLoaderVisible || isWaitingForCurrentProperties;
  const activeFilterChips = getActiveFilterChips(appliedFilters);
  const draftPriceMin = Number(draftFilters.precioMinimo || salesPriceMinLimit);
  const draftPriceMax = Number(draftFilters.precioMaximo || salesPriceMaxLimit);
  const hasDraftPriceRange = Boolean(draftFilters.precioMinimo || draftFilters.precioMaximo);
  const salesPriceSummary = !hasDraftPriceRange
    ? "Todos"
    : draftPriceMin > salesPriceMinLimit && draftPriceMax < salesPriceMaxLimit
      ? `${formatSalesPriceValue("usd", draftPriceMin)} - ${formatSalesPriceValue("usd", draftPriceMax)}`
      : draftPriceMin > salesPriceMinLimit
        ? `Desde ${formatSalesPriceValue("usd", draftPriceMin)}`
        : `Hasta ${formatSalesPriceValue("usd", draftPriceMax)}`;
  const hasFullDraftPriceRange = draftPriceMin > salesPriceMinLimit && draftPriceMax < salesPriceMaxLimit;

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

    const handlePopState = () => {
      const nextFilters = getInitialFiltersFromUrl(listingContext);

      setDraftFilters(nextFilters);
      setAppliedFilters(nextFilters);
      setSalesPriceFieldValue(nextFilters.precioMaximo || "");
      setIsSalesPriceFieldEditing(false);
      setPage(1);
      setActiveDropdown(null);
      setIsCompactFiltersOpen(false);
    };

    window.addEventListener("popstate", handlePopState);

    return () => window.removeEventListener("popstate", handlePopState);
  }, [listingContext]);

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
  }, [isLoaderVisible, isWaitingForCurrentProperties, page, totalPages, visibleProperties.length, activeFilterChips.length]);

  useEffect(() => {
    if (!isSalesPriceFieldEditing) {
      setSalesPriceFieldValue(draftFilters.precioMaximo || "");
    }
  }, [draftFilters.precioMaximo, isSalesPriceFieldEditing]);

  const handleDraftFilterChange = (field: keyof SalesFilters, value: string) => {
    setDraftFilters((currentFilters) => ({
      ...currentFilters,
      [field]: value,
    }));
  };

  const handleNeighborhoodFilterSelect = (value: string) => {
    if (!value) {
      handleDraftFilterChange("barrio", "");
      return;
    }

    const selectedNeighborhoods = getSelectedNeighborhoods(draftFilters.barrio);
    const nextNeighborhoods = selectedNeighborhoods.includes(value)
      ? selectedNeighborhoods.filter((neighborhood) => neighborhood !== value)
      : [...selectedNeighborhoods, value];

    handleDraftFilterChange("barrio", nextNeighborhoods.join(","));
  };

  const handleTypeFilterSelect = (value: string) => {
    if (value === projectTypeFilterValue) {
      window.location.href = "/proyectos";
      return;
    }

    handleDraftFilterChange("tipo", value);
    setActiveDropdown(null);
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

  const handleSalesPriceRangeChange = (field: "precioMinimo" | "precioMaximo", value: string) => {
    const nextValue = clampSalesPriceValue(Number(value));

    setDraftFilters((currentFilters) => {
      const currentMin = Number(currentFilters.precioMinimo || salesPriceMinLimit);
      const currentMax = Number(currentFilters.precioMaximo || salesPriceMaxLimit);
      const nextMin = field === "precioMinimo" ? Math.min(nextValue, currentMax) : currentMin;
      const nextMax = field === "precioMaximo" ? Math.max(nextValue, currentMin) : currentMax;

      return {
        ...currentFilters,
        precioMoneda: "usd",
        precioMinimo: nextMin > salesPriceMinLimit ? String(nextMin) : "",
        precioMaximo: nextMax < salesPriceMaxLimit ? String(nextMax) : "",
      };
    });
  };

  const handleSalesPriceRangeInputChange = (field: "precioMinimo" | "precioMaximo", value: string) => {
    const numericValue = value.replace(/\D/g, "");

    if (!numericValue) {
      setDraftFilters((currentFilters) => ({
        ...currentFilters,
        precioMoneda: "usd",
        [field]: "",
      }));
      return;
    }

    handleSalesPriceRangeChange(field, numericValue);
  };

  const handleApplyFilters = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextFilters = { ...draftFilters };

    writeSalesFilterSearchParams(nextFilters);

    startTransition(() => {
      setAppliedFilters(nextFilters);
      setPage(1);
    });
    setActiveDropdown(null);
    if (isCompactFilterViewport) {
      setIsCompactFiltersOpen(false);
    }
  };

  const handleResetFilters = () => {
    const nextFilters = getEmptyFilters(listingContext);

    writeSalesFilterSearchParams(nextFilters);

    startTransition(() => {
      setDraftFilters(nextFilters);
      setAppliedFilters(nextFilters);
      setSalesPriceFieldValue("");
      setPage(1);
    });
    setActiveDropdown(null);
    if (isCompactFilterViewport) {
      setIsCompactFiltersOpen(false);
    }
  };

  const handleClearActiveFilter = (filterKey: ActiveSalesFilterKey) => {
    const nextFilters = getFiltersWithClearedChip(appliedFilters, filterKey, listingContext);

    writeSalesFilterSearchParams(nextFilters);

    startTransition(() => {
      setDraftFilters(nextFilters);
      setAppliedFilters(nextFilters);
      setSalesPriceFieldValue(nextFilters.precioMaximo || "");
      setIsSalesPriceFieldEditing(false);
      setPage(1);
    });
    setActiveDropdown(null);
  };

  const handlePageChange = (nextPage: number) => {
    const clampedPage = Math.min(Math.max(nextPage, 1), totalPages);

    startTransition(() => {
      setPage(clampedPage);
    });
    scrollToCatalogTop();
  };

  const filterForm = (
    <form className="sales-filter-card search-card-variant-4 reveal" onSubmit={handleApplyFilters}>
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
            onSelect={handleTypeFilterSelect}
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
            multipleValues={getSelectedNeighborhoods(draftFilters.barrio)}
            onSelect={handleNeighborhoodFilterSelect}
            onToggle={() => {
              setActiveDropdown((currentValue) => (currentValue === "barrio" ? null : "barrio"));
            }}
            options={neighborhoodDropdownOptions}
            value={draftFilters.barrio}
          />

          <div className="sales-filter-field sales-filter-field-price">
            <span className="sales-filter-field-label">Precio</span>
            {listingContext === "ventas" ? (
              <>
                <button
                  type="button"
                  className={`search-select-trigger price-range-trigger${activeDropdown === "precio" ? " is-open" : ""}`}
                  aria-expanded={activeDropdown === "precio"}
                  aria-haspopup="dialog"
                  onClick={() => {
                    setActiveDropdown((currentValue) => (currentValue === "precio" ? null : "precio"));
                  }}
                >
                  <span className="price-range-trigger-text">{salesPriceSummary}</span>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>
                {hasFullDraftPriceRange ? (
                  <span className="search-select-tooltip price-range-tooltip" role="tooltip">
                    <span>Desde: {formatSalesPriceValue("usd", draftPriceMin)}</span>
                    <span>Hasta: {formatSalesPriceValue("usd", draftPriceMax)}</span>
                  </span>
                ) : null}
                {activeDropdown === "precio" ? (
                  <div className="price-range-popover sales-price-range-popover" role="dialog" aria-label="Rango de precio">
                    <div className="price-range-control sales-price-range-control">
                      <label>
                        <span>
                          <span>Desde</span>
                          <input
                            className="price-range-value-input"
                            type="text"
                            inputMode="numeric"
                            aria-label="Precio desde"
                            value={draftFilters.precioMinimo ? formatSalesPriceValue("usd", Number(draftFilters.precioMinimo)) : ""}
                            placeholder="Sin mínimo"
                            onChange={(event) => handleSalesPriceRangeInputChange("precioMinimo", event.currentTarget.value)}
                            onFocus={(event) => event.currentTarget.select()}
                          />
                        </span>
                        <input
                          type="range"
                          min={salesPriceMinLimit}
                          max={salesPriceMaxLimit}
                          step={salesPriceStep}
                          value={draftPriceMin}
                          onChange={(event) => handleSalesPriceRangeChange("precioMinimo", event.currentTarget.value)}
                        />
                      </label>
                      <label>
                        <span>
                          <span>Hasta</span>
                          <input
                            className="price-range-value-input"
                            type="text"
                            inputMode="numeric"
                            aria-label="Precio hasta"
                            value={draftFilters.precioMaximo ? formatSalesPriceValue("usd", Number(draftFilters.precioMaximo)) : ""}
                            placeholder="Sin máximo"
                            onChange={(event) => handleSalesPriceRangeInputChange("precioMaximo", event.currentTarget.value)}
                            onFocus={(event) => event.currentTarget.select()}
                          />
                        </span>
                        <input
                          type="range"
                          min={salesPriceMinLimit}
                          max={salesPriceMaxLimit}
                          step={salesPriceStep}
                          value={draftPriceMax}
                          onChange={(event) => handleSalesPriceRangeChange("precioMaximo", event.currentTarget.value)}
                        />
                      </label>
                    </div>
                  </div>
                ) : null}
              </>
            ) : (
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
            )}
          </div>

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

          <label className="sales-filter-field sales-filter-field-reference">
            <span className="sales-filter-field-label">REF.</span>
            <input
              type="text"
              placeholder="Ej: 1234"
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
          <div className="sales-filter-actions" aria-label="Filtros aplicados">
            {activeFilterChips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                className="sales-filter-chip"
                onClick={() => handleClearActiveFilter(chip.key)}
                aria-label={chip.clearLabel}
              >
                <span>{chip.label}</span>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </form>
  );

  return (
    <div className="sales-page">
      <section className="sales-results" id="ventas-resultados">
        <div className="container sales-results-container">
          {filterForm}

          {loadError ? (
            <div className="sales-data-alert reveal is-visible" role={isUsingFallbackCatalog ? "status" : "alert"}>
              <strong>
                {isUsingFallbackCatalog
                  ? "Mostrando datos de prueba mientras el catálogo público no responde."
                  : "No pudimos cargar el catálogo público."}
              </strong>
              <span>{loadError}</span>
            </div>
          ) : null}

          {!hideResultsTitle ? (
            <div className="sales-results-head reveal">
              <div className="sales-results-copy section-title-frame">
                <h2>{resultsTitle}</h2>
              </div>
            </div>
          ) : null}

          {isCatalogLoading ? (
            <section className="sales-loader-section sales-catalog-loader" aria-live="polite" aria-busy="true">
              <LarsLogoLoader />
            </section>
          ) : visibleProperties.length ? (
            <div className="sales-grid" id="ventas-catalogo">
              {visibleProperties.map((property, index) => (
                <article
                  key={property.id}
                  className={`sales-listing-card${property.reserved ? " is-reserved" : ""} reveal reveal-delay-${(index % 4) + 1}`}
                >
                  <a
                    href={getSalesPropertyUrl(property.ref, listingContext)}
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
                        <span>{property.rooms}</span>
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
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="sales-empty-state reveal reveal-delay-1">
              {loadError && !properties.length ? (
                <>
                  <h3>No pudimos cargar propiedades.</h3>
                </>
              ) : (
                <>
                  <h3>No se encontraron propiedades</h3>
                  <button type="button" className="primary-button search-cta-button" onClick={handleResetFilters}>
                    Limpiar filtros
                  </button>
                </>
              )}
            </div>
          )}

          {!isCatalogLoading && totalPages > 1 ? (
            <div className="sales-pagination reveal reveal-delay-2" aria-label="Paginación de propiedades">
              <button
                type="button"
                className={`sales-page-button sales-page-arrow-button${page <= 1 ? " is-placeholder" : ""}`}
                onClick={() => handlePageChange(page - 1)}
                aria-label="Página anterior"
                aria-hidden={page <= 1}
                disabled={page <= 1}
              >
                <PaginationArrowIcon direction="left" />
              </button>

              <div className="sales-page-numbers">
                {getVisiblePaginationItems(page, totalPages).map((paginationItem) => (
                  <button
                    key={paginationItem}
                    type="button"
                    className={`sales-page-button${paginationItem === page ? " is-current" : ""}`}
                    onClick={() => handlePageChange(paginationItem)}
                    aria-current={paginationItem === page ? "page" : undefined}
                  >
                    {paginationItem}
                  </button>
                ))}
              </div>

              <button
                type="button"
                className={`sales-page-button sales-page-arrow-button${page >= totalPages ? " is-placeholder" : ""}`}
                onClick={() => handlePageChange(page + 1)}
                aria-label="Página siguiente"
                aria-hidden={page >= totalPages}
                disabled={page >= totalPages}
              >
                <PaginationArrowIcon direction="right" />
              </button>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
