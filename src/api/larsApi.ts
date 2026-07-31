import type { Project, ProjectGalleryItem } from "../data/projectsCatalog";
import type { SalesGalleryItem, SalesProperty } from "../data/salesCatalog";

export type PropertyOperation = "ventas" | "alquileres";

export type HomePayload = {
  ventas: SalesProperty[];
  alquileres: SalesProperty[];
  destacadas: SalesProperty[];
  proyectos: Project[];
};

export type PropertyListQuery = {
  limit?: number;
  tipo?: string;
  barrio?: string;
  ref?: string;
  destacadas?: boolean;
};

const defaultApiBaseUrl = "http://127.0.0.1:8000";
const publicWebNamespace = "/api/v1/publica/web";

function getApiBaseUrl() {
  const configuredBaseUrl = import.meta.env.VITE_LARS_API_BASE_URL;
  const baseUrl = typeof configuredBaseUrl === "string" && configuredBaseUrl.trim()
    ? configuredBaseUrl
    : defaultApiBaseUrl;

  return baseUrl.replace(/\/+$/, "");
}

function buildWebUrl(path: string, searchParams?: URLSearchParams) {
  const url = new URL(`${getApiBaseUrl()}${publicWebNamespace}${path}`);

  searchParams?.forEach((value, key) => {
    url.searchParams.append(key, value);
  });

  return url;
}

function appendOptionalSearchParam(searchParams: URLSearchParams, key: string, value: string | number | undefined) {
  if (value === undefined || value === "") {
    return;
  }

  searchParams.set(key, String(value));
}

function buildPropertySearchParams(operation: PropertyOperation, query: PropertyListQuery) {
  const searchParams = new URLSearchParams({ operacion: operation });

  appendOptionalSearchParam(searchParams, "limit", query.limit);
  appendOptionalSearchParam(searchParams, "tipo", query.tipo);
  appendOptionalSearchParam(searchParams, "barrio", query.barrio);
  appendOptionalSearchParam(searchParams, "ref", query.ref);

  if (query.destacadas) {
    searchParams.set("destacadas", "1");
  }

  return searchParams;
}

async function requestJson<T>(path: string, searchParams?: URLSearchParams, signal?: AbortSignal) {
  const response = await fetch(buildWebUrl(path, searchParams), {
    headers: {
      Accept: "application/json",
    },
    signal,
  });

  if (!response.ok) {
    throw new Error(`Error ${response.status} al cargar ${response.url}`);
  }

  return response.json() as Promise<T>;
}

function asStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];
}

function mergeStringArrays(...arrays: string[][]) {
  const seenItems = new Set<string>();
  const mergedItems: string[] = [];

  arrays.flat().forEach((item) => {
    const normalizedItem = normalizeSearchText(item).trim();

    if (!normalizedItem || seenItems.has(normalizedItem)) {
      return;
    }

    seenItems.add(normalizedItem);
    mergedItems.push(item);
  });

  return mergedItems;
}

function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function normalizeSquareMetersUnit(value: string) {
  return value.replace(/\bm\s*2\b/gi, "m²");
}

function getObjectValue(value: unknown) {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : undefined;
}

function getStringValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function getNumberValue(value: unknown) {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const number = Number(String(value).replace(",", "."));

  return Number.isFinite(number) ? number : undefined;
}

function getPublicDataNumber(property: SalesProperty, key: "m2" | "anio" | "dorms" | "banos") {
  const propertyPayload = getObjectValue(property);
  const publicData = getObjectValue(propertyPayload?.get_data_dest_publica);

  return getNumberValue(publicData?.[key]);
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseFeatureNumber(value: string) {
  const number = Number(value.replace(",", "."));

  return Number.isFinite(number) ? Math.trunc(number) : undefined;
}

function parseCharacteristicNumber(labels: string[], names: string[]) {
  const normalizedNames = names.map(normalizeSearchText).sort((left, right) => right.length - left.length);

  for (const label of labels) {
    const normalizedLabel = normalizeSearchText(label);

    for (const name of normalizedNames) {
      const escapedName = escapeRegExp(name);
      const numberBeforeName = normalizedLabel.match(new RegExp(`(?:^|\\D)(\\d+(?:[,.]\\d+)?)\\s+${escapedName}\\b`));
      const numberAfterName = normalizedLabel.match(new RegExp(`\\b${escapedName}\\b\\D{0,12}(\\d+(?:[,.]\\d+)?)`));
      const number = numberBeforeName?.[1] ?? numberAfterName?.[1];

      if (number) {
        return parseFeatureNumber(number);
      }
    }
  }

  return undefined;
}

function hasCharacteristicMention(labels: string[], names: string[]) {
  const normalizedNames = names.map(normalizeSearchText);

  return labels.some((label) => {
    const normalizedLabel = normalizeSearchText(label);

    return normalizedNames.some((name) => new RegExp(`\\b${escapeRegExp(name)}\\b`).test(normalizedLabel));
  });
}

function hasMonoambienteSignal(labels: string[]) {
  return labels.some((label) => normalizeSearchText(label).includes("monoambiente"));
}

function shouldDefaultMissingRoomsToOne(type: string) {
  const normalizedType = normalizeSearchText(type);

  return ["apartamento", "casa", "propiedad"].some((typeName) => normalizedType.includes(typeName));
}

function normalizeRooms(property: SalesProperty, labels: string[]) {
  const publicDataRooms = getPublicDataNumber(property, "dorms");

  if (publicDataRooms !== undefined) {
    return Math.trunc(publicDataRooms);
  }

  const rooms = Number(property.rooms);

  if (Number.isFinite(rooms) && rooms > 0) {
    return rooms;
  }

  if (hasMonoambienteSignal(labels)) {
    return 0;
  }

  const inferredRooms = parseCharacteristicNumber(labels, ["dormitorio", "dormitorios", "dorm"]);

  if (inferredRooms !== undefined) {
    return inferredRooms;
  }

  if (shouldDefaultMissingRoomsToOne(property.type || "")) {
    return 1;
  }

  return Number.isFinite(rooms) ? rooms : 0;
}

function normalizeBathrooms(property: SalesProperty, labels: string[]) {
  const publicDataBathrooms = getPublicDataNumber(property, "banos");

  if (publicDataBathrooms !== undefined) {
    return Math.trunc(publicDataBathrooms);
  }

  const bathrooms = Number(property.bathrooms);

  if (Number.isFinite(bathrooms) && bathrooms > 0) {
    return bathrooms;
  }

  const inferredBathrooms = parseCharacteristicNumber(labels, ["bano", "banos", "bathroom", "bathrooms"]);

  if (inferredBathrooms !== undefined) {
    return inferredBathrooms;
  }

  if (hasCharacteristicMention(labels, ["bano", "bathroom"])) {
    return 1;
  }

  return Number.isFinite(bathrooms) ? bathrooms : 0;
}

function normalizeGallery<T extends SalesGalleryItem | ProjectGalleryItem>(
  value: unknown,
  fallbackImage: string,
  title: string,
  imagePosition?: string,
) {
  const sourceItems = Array.isArray(value) ? value : [];
  const gallery = sourceItems
    .filter((item): item is Partial<T> & { image: string } => {
      return Boolean(item && typeof item === "object" && typeof (item as { image?: unknown }).image === "string");
    })
    .map((item, index) => ({
      image: item.image,
      thumbImage: typeof item.thumbImage === "string" ? item.thumbImage : undefined,
      alt: typeof item.alt === "string" && item.alt.trim() ? item.alt : `${title} imagen ${index + 1}`,
      objectPosition: typeof item.objectPosition === "string" ? item.objectPosition : imagePosition,
    }));

  if (gallery.length || !fallbackImage) {
    return gallery;
  }

  return [
    {
      image: fallbackImage,
      alt: `${title} imagen 1`,
      objectPosition: imagePosition,
    },
  ];
}

const rawAmenityCharacteristicNames = [
  "cowork",
  "coworking",
  "solarium",
  "piscina",
  "area verde",
  "areas verdes",
  "barbacoa",
  "gym",
  "gimnasio",
  "sum",
  "salon de usos multiples",
];

const rawServiceCharacteristicNames = [
  "porteria fisica",
  "porteria",
  "laundry",
  "loundry",
  "lavadero",
  "lavanderia",
  "gas natural",
  "vigilancia",
  "estacionamiento",
  "parking",
  "garaje",
  "garage",
  "cochera",
];

const categorizedRawCharacteristicNames = new Set([
  ...rawAmenityCharacteristicNames,
  ...rawServiceCharacteristicNames,
].map(normalizeSearchText));

function isEnabledRawCharacteristicValue(value: string) {
  const normalizedValue = normalizeSearchText(value).trim();

  return !["", "false", "no", "0", "n/i", "ni", "no tiene"].includes(normalizedValue);
}

function shouldShowRawCharacteristicValue(value: string) {
  const normalizedValue = normalizeSearchText(value).trim();

  return !["true", "si", "sí", "1"].includes(normalizedValue);
}

type RawSelectedCharacteristic = {
  name: string;
  normalizedName: string;
  value: string;
  isPublic: boolean;
  showSummary: boolean;
};

function formatRawSelectedCharacteristic(characteristic: RawSelectedCharacteristic) {
  return shouldShowRawCharacteristicValue(characteristic.value)
    ? `${characteristic.name}: ${characteristic.value}`
    : characteristic.name;
}

function getRawSelectedCharacteristics(property: SalesProperty) {
  const propertyPayload = getObjectValue(property);
  const rawItems = Array.isArray(propertyPayload?.get_caracteristicas) ? propertyPayload.get_caracteristicas : [];

  return rawItems.flatMap((item): RawSelectedCharacteristic[] => {
    const itemObject = getObjectValue(item);
    const characteristic = getObjectValue(itemObject?.caracteristica);
    const name = getStringValue(characteristic?.nombre_singular) ?? getStringValue(characteristic?.nombre_plural);
    const value = getStringValue(itemObject?.valor);

    if (!name || !value || !isEnabledRawCharacteristicValue(value)) {
      return [];
    }

    return [{
      name,
      normalizedName: normalizeSearchText(name),
      value,
      isPublic: itemObject?.mostrar_publico === true,
      showSummary: itemObject?.mostrar_resumen === true,
    }];
  });
}

function getRawCharacteristicsByName(characteristics: RawSelectedCharacteristic[], featureNames: string[]) {
  const normalizedFeatureNames = new Set(featureNames.map(normalizeSearchText));

  return characteristics
    .filter((characteristic) => characteristic.isPublic && normalizedFeatureNames.has(characteristic.normalizedName))
    .map(formatRawSelectedCharacteristic);
}

function getRawPublicCharacteristics(characteristics: RawSelectedCharacteristic[]) {
  return characteristics
    .filter((characteristic) => {
      return (
        characteristic.isPublic &&
        !categorizedRawCharacteristicNames.has(characteristic.normalizedName)
      );
    })
    .map(formatRawSelectedCharacteristic);
}

function normalizeSalesProperty(property: SalesProperty) {
  const title = property.title || `Propiedad ${property.ref || property.id}`;
  const image = property.image || property.cardImage || "";
  const publicDataSize = getPublicDataNumber(property, "m2");
  const propertySizeValue = getNumberValue(property.sizeValue);
  const sizeValue = propertySizeValue ?? publicDataSize;
  const size = typeof property.size === "string" ? normalizeSquareMetersUnit(property.size) : "";
  const tags = asStringArray(property.tags);
  const rawSelectedCharacteristics = getRawSelectedCharacteristics(property);
  const rawCharacteristics = getRawPublicCharacteristics(rawSelectedCharacteristics).map(normalizeSquareMetersUnit);
  const characteristics = mergeStringArrays(
    rawCharacteristics,
    asStringArray(property.characteristics).map(normalizeSquareMetersUnit),
  );
  const rawAmenities = getRawCharacteristicsByName(rawSelectedCharacteristics, rawAmenityCharacteristicNames);
  const rawServices = getRawCharacteristicsByName(rawSelectedCharacteristics, rawServiceCharacteristicNames);
  const infoLabels = [
    ...tags,
    ...characteristics,
    property.summary,
    property.description,
    title,
  ].filter((item): item is string => typeof item === "string" && item.trim().length > 0);

  return {
    ...property,
    id: Number(property.id),
    ref: String(property.ref ?? ""),
    type: property.type || "Propiedad",
    title,
    price: property.price || "",
    priceValue: Number(property.priceValue ?? 0),
    location: property.location || "",
    address: property.address || "",
    rooms: normalizeRooms(property, infoLabels),
    bathrooms: normalizeBathrooms(property, infoLabels),
    size: size || (sizeValue !== undefined ? `${Math.trunc(sizeValue)} m²` : ""),
    sizeValue,
    image,
    cardImage: property.cardImage || image,
    summary: property.summary || "",
    description: property.description || property.summary || "",
    tags,
    gallery: normalizeGallery<SalesGalleryItem>(property.gallery, image, title, property.imagePosition),
    characteristics,
    amenities: mergeStringArrays(rawAmenities, asStringArray(property.amenities)),
    services: mergeStringArrays(rawServices, asStringArray(property.services)),
    financialInfo: asStringArray(property.financialInfo),
    internalInfo: asStringArray(property.internalInfo),
  } satisfies SalesProperty;
}

function normalizeProject(project: Project) {
  const title = project.title || "Proyecto";
  const image = project.image || project.cardImage || "";

  return {
    ...project,
    slug: project.slug || "",
    tag: project.tag || "",
    title,
    location: project.location || "",
    address: project.address || "",
    description: project.description || "",
    image,
    cardImage: project.cardImage || image,
    gallery: normalizeGallery<ProjectGalleryItem>(project.gallery, image, title, project.imagePosition),
    deliveryDates: asStringArray(project.deliveryDates),
    benefits: asStringArray(project.benefits),
    unitSummary: asStringArray(project.unitSummary),
    amenities: asStringArray(project.amenities),
    services: asStringArray(project.services),
    availableUnits: Array.isArray(project.availableUnits) ? project.availableUnits : [],
    availableParking: Array.isArray(project.availableParking) ? project.availableParking : [],
    availableCommercialUnits: Array.isArray(project.availableCommercialUnits) ? project.availableCommercialUnits : [],
  } satisfies Project;
}

export function isAbortError(error: unknown) {
  return error instanceof Error && error.name === "AbortError";
}

export function getLarsApiErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "No pudimos cargar la información del catálogo.";
}

export async function fetchHome(signal?: AbortSignal) {
  const home = await requestJson<HomePayload>("/home/", undefined, signal);

  return {
    ventas: Array.isArray(home.ventas) ? home.ventas.map(normalizeSalesProperty) : [],
    alquileres: Array.isArray(home.alquileres) ? home.alquileres.map(normalizeSalesProperty) : [],
    destacadas: Array.isArray(home.destacadas) ? home.destacadas.map(normalizeSalesProperty) : [],
    proyectos: Array.isArray(home.proyectos) ? home.proyectos.map(normalizeProject) : [],
  } satisfies HomePayload;
}

export async function fetchProperties(
  operation: PropertyOperation,
  query: PropertyListQuery = {},
  signal?: AbortSignal,
) {
  const properties = await requestJson<SalesProperty[]>(
    "/propiedades/",
    buildPropertySearchParams(operation, query),
    signal,
  );

  return Array.isArray(properties) ? properties.map(normalizeSalesProperty) : [];
}

export async function fetchPropertyDetail(id: number, origin: PropertyOperation, signal?: AbortSignal) {
  const property = await requestJson<SalesProperty>(
    `/propiedades/${encodeURIComponent(String(id))}/`,
    new URLSearchParams({ origen: origin }),
    signal,
  );

  return normalizeSalesProperty(property);
}

export async function fetchPropertyByRef(referencia: string, signal?: AbortSignal) {
  const property = await requestJson<SalesProperty>(
    `/propiedades/ref/${encodeURIComponent(referencia)}/`,
    undefined,
    signal,
  );

  return normalizeSalesProperty(property);
}

export async function fetchProjects(signal?: AbortSignal) {
  const projects = await requestJson<Project[]>("/proyectos/", undefined, signal);

  return Array.isArray(projects) ? projects.map(normalizeProject) : [];
}

export async function fetchProjectDetail(slug: string, signal?: AbortSignal) {
  const project = await requestJson<Project>(`/proyectos/${encodeURIComponent(slug)}/`, undefined, signal);

  return normalizeProject(project);
}
