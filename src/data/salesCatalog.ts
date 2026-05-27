export type SalesGalleryItem = {
  image: string;
  alt: string;
  objectPosition?: string;
};

export type SalesProperty = {
  id: number;
  ref: string;
  type: string;
  title: string;
  price: string;
  priceValue: number;
  location: string;
  address: string;
  rooms: number;
  bathrooms: number;
  size: string;
  image: string;
  imagePosition?: string;
  reserved?: boolean;
  summary: string;
  description: string;
  tags: string[];
  gallery: SalesGalleryItem[];
  characteristics: string[];
  amenities: string[];
  financialInfo: string[];
  internalInfo: string[];
};

type SalesPropertySeed = Omit<
  SalesProperty,
  | "address"
  | "description"
  | "gallery"
  | "characteristics"
  | "amenities"
  | "financialInfo"
  | "internalInfo"
> & {
  address?: string;
  description?: string;
  gallery?: SalesGalleryItem[];
  characteristics?: string[];
  amenities?: string[];
  financialInfo?: string[];
  internalInfo?: string[];
};

function buildGallery(title: string, primaryImage: string, extraImages: string[]): SalesGalleryItem[] {
  return [primaryImage, ...extraImages].slice(0, 4).map((image, index) => ({
    image,
    alt: `${title} imagen ${index + 1}`,
    objectPosition: "center center",
  }));
}

function getRoomLabel(rooms: number) {
  if (rooms === 0) {
    return "Monoambiente";
  }

  if (rooms === 1) {
    return "1 dormitorio";
  }

  return `${rooms} dormitorios`;
}

function getEstimatedExpenses(priceValue: number) {
  return Math.max(3800, Math.round(priceValue * 0.00023));
}

function getEstimatedTax(priceValue: number, ratio: number) {
  return Math.max(2900, Math.round(priceValue * ratio));
}

function buildDescription(property: SalesPropertySeed) {
  const formatLabel = property.rooms === 0 ? "un monoambiente" : `una planta de ${getRoomLabel(property.rooms)}`;
  const reservationLine = property.reserved
    ? "Actualmente se encuentra reservada, pero podemos registrar tu interés por si se libera o aparece una alternativa con el mismo perfil."
    : "Hoy se presenta como una opción lista para coordinar visita y avanzar con asesoramiento comercial personalizado.";

  return [
    `${property.summary} La propuesta combina ${formatLabel}, ${property.size} bien aprovechados y una lectura comercial clara desde el primer recorrido.`,
    `${property.location} sigue siendo una zona muy buscada por conectividad, vida de barrio y demanda sostenida. ${reservationLine}`,
  ].join("\n\n");
}

function buildCharacteristics(property: SalesPropertySeed) {
  return [
    `Tipo: ${property.type}`,
    `Dormitorios: ${getRoomLabel(property.rooms)}`,
    `Baños: ${property.bathrooms}`,
    `Superficie: ${property.size}`,
    `Barrio: ${property.location}`,
    `Referencia: ${property.ref}`,
    `Estado: ${property.reserved ? "Reservada" : "Disponible para consulta"}`,
    `Perfil: ${property.tags[0] ?? "Residencial"}`,
  ];
}

function buildAmenities(property: SalesPropertySeed) {
  return [...property.tags, "Circulación funcional", "Buena entrada de luz", "Asesoramiento Lars"];
}

function buildFinancialInfo(property: SalesPropertySeed) {
  const commonExpenses = getEstimatedExpenses(property.priceValue);
  const contribution = getEstimatedTax(property.priceValue, 0.00016);
  const primaryTax = getEstimatedTax(property.priceValue, 0.00008);

  return [
    `Gastos comunes estimados: $ ${commonExpenses.toLocaleString("es-UY")}`,
    `Contribución inmobiliaria estimada: $ ${contribution.toLocaleString("es-UY")}`,
    `Impuesto de primaria estimado: $ ${primaryTax.toLocaleString("es-UY")}`,
    "Honorarios y documentación: consultar con el equipo comercial",
  ];
}

function buildInternalInfo(property: SalesPropertySeed) {
  return [
    `Ficha Lars: Ref. ${property.ref}`,
    "Coordinación de visitas sujeta a agenda",
    "Documentación y condiciones disponibles a solicitud",
    property.reserved
      ? "Estado actual: reservada, con posibilidad de seguimiento comercial"
      : "Estado actual: abierta a consultas y próxima coordinación",
  ];
}

function buildAddress(location: string) {
  return `${location}, Montevideo`;
}

function enrichProperty(property: SalesPropertySeed, extraImages: string[]) {
  return {
    ...property,
    address: property.address ?? buildAddress(property.location),
    description: property.description ?? buildDescription(property),
    gallery: property.gallery ?? buildGallery(property.title, property.image, extraImages),
    characteristics: property.characteristics ?? buildCharacteristics(property),
    amenities: property.amenities ?? buildAmenities(property),
    financialInfo: property.financialInfo ?? buildFinancialInfo(property),
    internalInfo: property.internalInfo ?? buildInternalInfo(property),
  } satisfies SalesProperty;
}

const salesCatalogSeeds: SalesPropertySeed[] = [
  {
    id: 9,
    ref: "0009",
    type: "Apartamento",
    title: "Villa Dolores Apartment",
    price: "US$ 121.000",
    priceValue: 121000,
    location: "Villa Dolores",
    rooms: 2,
    bathrooms: 1,
    size: "46 m²",
    image: "/property-villa-dolores.png",
    reserved: true,
    summary: "Una unidad compacta y rendidora, muy buscada para inversores que priorizan ubicación y rotación.",
    tags: ["Balcón", "Luminoso", "Ideal renta"],
  },
  {
    id: 10,
    ref: "0010",
    type: "Loft",
    title: "Punta Carretas Loft",
    price: "US$ 121.000",
    priceValue: 121000,
    location: "Punta Carretas",
    rooms: 2,
    bathrooms: 1,
    size: "46 m²",
    image: "/property-punta-carretas.png",
    summary: "Perfil joven, flexible y con una puesta más editorial para una zona con demanda sostenida.",
    tags: ["Loft", "Cerca del mar", "Entrega inmediata"],
  },
  {
    id: 11,
    ref: "0011",
    type: "Studio",
    title: "La Blanqueada Studio",
    price: "US$ 121.000",
    priceValue: 121000,
    location: "La Blanqueada",
    rooms: 0,
    bathrooms: 1,
    size: "38 m²",
    image: "/property-la-blanqueada.png",
    reserved: true,
    summary: "Monoambiente funcional con circulación clara y potencial para primera vivienda o renta universitaria.",
    tags: ["Monoambiente", "Bajo mantenimiento", "Buen metraje"],
  },
  {
    id: 12,
    ref: "0012",
    type: "Casa",
    title: "Parque Rodó House",
    price: "US$ 248.000",
    priceValue: 248000,
    location: "Parque Rodó",
    rooms: 3,
    bathrooms: 2,
    size: "124 m²",
    image: "/1.png",
    summary: "Una casa con escala barrial y espacios sociales pensados para quienes quieren vivir Montevideo con aire propio.",
    tags: ["Patio", "Escritorio", "Actualizada"],
  },
  {
    id: 13,
    ref: "0013",
    type: "Apartamento",
    title: "Pocitos Classic",
    price: "US$ 321.000",
    priceValue: 321000,
    location: "Pocitos",
    rooms: 3,
    bathrooms: 2,
    size: "86 m²",
    image: "/property-pocitos.png",
    summary: "",
    tags: ["Garaje", "Terraza", "Portería"],
  },
  {
    id: 14,
    ref: "0014",
    type: "Apartamento",
    title: "Tres Cruces Flat",
    price: "US$ 213.000",
    priceValue: 213000,
    location: "Tres Cruces",
    rooms: 2,
    bathrooms: 1,
    size: "59 m²",
    image: "/2.png",
    summary: "Conectividad, practicidad y una planta muy fácil de entender para un público amplio.",
    tags: ["Conectividad", "Balcón", "Muy rentable"],
  },
  {
    id: 15,
    ref: "0015",
    type: "Apartamento",
    title: "Buceo Terrace",
    price: "US$ 198.000",
    priceValue: 198000,
    location: "Buceo",
    rooms: 2,
    bathrooms: 2,
    size: "67 m²",
    image: "/3.png",
    summary: "Una opción contemporánea con outdoor propio y un perfil muy alineado a la demanda actual.",
    tags: ["Terraza", "Parrillero", "Vista abierta"],
  },
  {
    id: 16,
    ref: "0016",
    type: "Casa",
    title: "Carrasco Garden House",
    price: "US$ 448.000",
    priceValue: 448000,
    location: "Carrasco",
    rooms: 4,
    bathrooms: 3,
    size: "188 m²",
    image: "/4.png",
    summary: "Casa con escala, jardín y una narrativa más premium para quienes buscan calidad residencial.",
    tags: ["Jardín", "4 dorm.", "Barbacoa"],
  },
  {
    id: 17,
    ref: "0017",
    type: "Loft",
    title: "Cordón Patio Loft",
    price: "US$ 176.000",
    priceValue: 176000,
    location: "Cordón",
    rooms: 1,
    bathrooms: 1,
    size: "54 m²",
    image: "/property-villa-dolores.png",
    summary: "Un formato flexible con patio propio y una identidad urbana muy marcada.",
    tags: ["Patio", "Diseño", "Ideal pareja"],
  },
  {
    id: 18,
    ref: "0018",
    type: "Penthouse",
    title: "Pocitos Nuevo Penthouse",
    price: "US$ 389.000",
    priceValue: 389000,
    location: "Pocitos",
    rooms: 3,
    bathrooms: 2,
    size: "112 m²",
    image: "/property-pocitos.png",
    summary: "Metraje generoso, terrazas reales y una puesta pensada para una audiencia que busca algo especial.",
    tags: ["Penthouse", "Terrazas", "Suite"],
  },
  {
    id: 19,
    ref: "019",
    type: "Oficina",
    title: "Centro Renovated Office",
    price: "US$ 154.000",
    priceValue: 154000,
    location: "Centro",
    rooms: 1,
    bathrooms: 1,
    size: "63 m²",
    image: "/2.png",
    summary: "Una alternativa profesional con ubicación central y una imagen cuidada desde el acceso.",
    tags: ["Oficina", "Recepción", "Muy visible"],
  },
  {
    id: 20,
    ref: "020",
    type: "Dúplex",
    title: "Malvin Dúplex",
    price: "US$ 264.000",
    priceValue: 264000,
    location: "Malvin",
    rooms: 3,
    bathrooms: 2,
    size: "98 m²",
    image: "/3.png",
    summary: "Dúplex con muy buena distribución, resuelto para una vida diaria más cómoda y versátil.",
    tags: ["Dúplex", "Al frente", "Listo para entrar"],
  },
  {
    id: 21,
    ref: "021",
    type: "Apartamento",
    title: "Pocitos Bright Apartment",
    price: "US$ 232.000",
    priceValue: 232000,
    location: "Pocitos",
    rooms: 2,
    bathrooms: 2,
    size: "72 m²",
    image: "/property-punta-carretas.png",
    summary: "Apartamento luminoso con buena escala social y un perfil ideal para completar la grilla demo.",
    tags: ["Luminoso", "Garaje", "Balcón"],
  },
];

const galleryImageSets = [
  ["/1.png", "/2.png", "/3.png"],
  ["/4.png", "/1.png", "/2.png"],
  ["/3.png", "/4.png", "/1.png"],
  ["/2.png", "/3.png", "/4.png"],
];

export const salesCatalog = salesCatalogSeeds.map((property, index) =>
  enrichProperty(property, galleryImageSets[index % galleryImageSets.length]),
);

export function getSalesPropertyById(id: number) {
  return salesCatalog.find((property) => property.id === id);
}

export function getSalesPropertyUrl(id: number, origin?: "ventas" | "alquileres") {
  return origin === "alquileres" ? `/propiedades/${id}?origen=alquileres` : `/propiedades/${id}`;
}

export function getSimilarSalesProperties(property: SalesProperty, limit = 3) {
  return salesCatalog
    .filter((candidate) => candidate.id !== property.id)
    .sort((left, right) => {
      const getScore = (candidate: SalesProperty) =>
        (candidate.location === property.location ? 3 : 0) +
        (candidate.type === property.type ? 2 : 0) +
        (candidate.rooms === property.rooms ? 1 : 0) +
        (candidate.bathrooms === property.bathrooms ? 1 : 0);

      return getScore(right) - getScore(left);
    })
    .slice(0, limit);
}
