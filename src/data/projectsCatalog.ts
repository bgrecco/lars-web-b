export type Project = {
  slug: string;
  tag: string;
  title: string;
  location: string;
  address: string;
  description: string;
  image: string;
  cardImage: string;
  imagePosition?: string;
  gallery: ProjectGalleryItem[];
  deliveryDates: string[];
  benefits: string[];
  unitSummary: string[];
  amenities: string[];
  services: string[];
  availableUnits: ProjectUnit[];
  availableParking: ProjectParking[];
};

export type ProjectGalleryItem = {
  image: string;
  thumbImage?: string;
  alt: string;
  objectPosition?: string;
};

function withOptimizedGalleryImage(image: string, alt: string): ProjectGalleryItem {
  return {
    image: `/optimized/gallery/${image.replace(/^\//, "").replace(/\.[^.]+$/, ".webp")}`,
    thumbImage: `/optimized/gallery/thumbs/${image.replace(/^\//, "").replace(/\.[^.]+$/, ".webp")}`,
    alt,
  };
}

export type ProjectUnit = {
  unit: string;
  orientation: "Frente" | "Contrafrente";
  bedrooms: number;
  coveredArea: number;
  totalArea: number;
  price: number;
};

export type ProjectParking = {
  number: string;
  capacity: number;
  price: number;
};

export const featuredProjects: Project[] = [
  {
    slug: "tempo-guayabos",
    tag: "Proyecto destacado",
    title: "Tempo Guayabos",
    location: "Cordón",
    address: "Guayabos esq. Minas",
    description:
      "Un proyecto contemporáneo de entorno motivante e inspirador, con espacios diseñados para favorecer la vida cotidiana y llevar la experiencia de amenities a un nivel superior.",
    image: "/project-tempo.png",
    cardImage: "/optimized/projects/project-tempo-card.webp",
    gallery: [
      withOptimizedGalleryImage("/images/projects/tempo/1.png", "Fachada de Tempo Guayabos"),
      withOptimizedGalleryImage("/images/projects/tempo/2.png", "Lobby y espacios comunes de Tempo Guayabos"),
      withOptimizedGalleryImage("/images/projects/tempo/3.png", "Piscina y terraza de Tempo Guayabos"),
      withOptimizedGalleryImage("/images/projects/tempo/4.png", "Amenity exterior de Tempo Guayabos"),
    ],
    deliveryDates: ["Torre 1 - Diciembre 2025", "Torre 3 - Junio 2026"],
    benefits: [
      "Exoneración de IVA.",
      "Exoneración de ITP (2% sobre valor DNC).",
      "Exoneración por 10 años de IRAE/IRPF a las rentas generadas por alquileres.",
      "Exoneración por 10 años del Impuesto al Patrimonio.",
    ],
    unitSummary: [
      "87 apartamentos de 1 dormitorio",
      "104 apartamentos de 2 dormitorios",
      "5 oficinas premium",
      "1 local comercial de 450 m²",
    ],
    amenities: [
      "3 SUM con barbacoa gourmet",
      "Rooftop con barbacoa completa",
      "Terraza jardín con vista panorámica",
      "Área de fogones y living exterior",
      "Área pet garden",
      "Piscina abierta climatizada con solarium",
      "Kids club indoor-outdoor",
      "Gimnasio equipado",
      "Micro cine equipado",
      "Espacio de coworking privado en planta baja",
      "Green library",
    ],
    services: [
      "6 ascensores",
      "Sectores de estar y lobby con conserjería 24 h",
      "Sistema de videovigilancia 24 h",
      "Parking inteligente con vigilancia 24 h",
      "Wi-fi de alta velocidad en amenities",
      "Aire acondicionado en espacios comunes",
      "App para la gestión de gastos comunes y uso de amenities",
      "Bodega ecommerce",
      "150 m² de patio enjardinado",
      "Laundry",
      "Bicicleteros",
      "Cargadores para auto eléctrico",
      "Contenedores para clasificación de residuos",
    ],
    availableUnits: [
      {
        unit: "1 - 101",
        orientation: "Contrafrente",
        bedrooms: 1,
        coveredArea: 40,
        totalArea: 84,
        price: 150001,
      },
      {
        unit: "1 - 102",
        orientation: "Contrafrente",
        bedrooms: 1,
        coveredArea: 44,
        totalArea: 100,
        price: 158505,
      },
      {
        unit: "1 - 104",
        orientation: "Contrafrente",
        bedrooms: 2,
        coveredArea: 57,
        totalArea: 81,
        price: 168954,
      },
      {
        unit: "3 - 604",
        orientation: "Contrafrente",
        bedrooms: 2,
        coveredArea: 61,
        totalArea: 86,
        price: 176932,
      },
    ],
    availableParking: [
      { number: "804", capacity: 1, price: 20000 },
      { number: "901", capacity: 1, price: 20000 },
      { number: "904", capacity: 2, price: 26000 },
    ],
  },
  {
    slug: "visca",
    tag: "Edificio boutique",
    title: "Visca",
    location: "Montevideo",
    address: "Montevideo",
    description:
      "Bloque pensado para presentar edificios y apartamentos con una lectura más directa y editorial.",
    image: "/project-urban.png",
    cardImage: "/optimized/projects/project-urban-card.webp",
    gallery: [
      withOptimizedGalleryImage("/project-urban.png", "Vista principal de Visca"),
      withOptimizedGalleryImage("/images/projects/2.png", "Fachada alternativa de Visca"),
      withOptimizedGalleryImage("/images/projects/tempo/2.png", "Espacio común de Visca"),
      withOptimizedGalleryImage("/images/projects/tempo/4.png", "Terraza de Visca"),
    ],
    deliveryDates: ["Entrega estimada - 2026"],
    benefits: ["Proyecto con asesoramiento comercial Lars.", "Opciones para vivienda e inversión."],
    unitSummary: ["Apartamentos de 1 y 2 dormitorios", "Amenities de uso común", "Cocheras disponibles"],
    amenities: ["SUM", "Rooftop", "Laundry", "Bicicleteros"],
    services: ["Ascensor", "Acceso controlado", "Previsión para cámaras", "Administración Lars"],
    availableUnits: [
      { unit: "201", orientation: "Frente", bedrooms: 1, coveredArea: 42, totalArea: 48, price: 142000 },
      { unit: "402", orientation: "Contrafrente", bedrooms: 2, coveredArea: 61, totalArea: 69, price: 198000 },
    ],
    availableParking: [{ number: "12", capacity: 1, price: 19000 }],
  },
  {
    slug: "vila",
    tag: "Housing garden",
    title: "Vila",
    location: "Barra de Carrasco",
    address: "Barra de Carrasco",
    description:
      "Una variante para proyectos con más aire residencial, terrazas y vida de barrio.",
    image: "/project-garden.png",
    cardImage: "/optimized/projects/project-garden-card.webp",
    gallery: [
      withOptimizedGalleryImage("/project-garden.png", "Vista principal de Vila"),
      withOptimizedGalleryImage("/images/projects/5.png", "Fachada de Vila"),
      withOptimizedGalleryImage("/images/projects/tempo/3.png", "Área exterior de Vila"),
      withOptimizedGalleryImage("/images/projects/tempo/4.png", "Jardín de Vila"),
    ],
    deliveryDates: ["Entrega estimada - 2026"],
    benefits: ["Entorno residencial consolidado.", "Unidades con expansión exterior."],
    unitSummary: ["Unidades con jardín", "Apartamentos de 2 dormitorios", "Cocheras opcionales"],
    amenities: ["Jardín común", "Barbacoa", "Espacio exterior", "Bicicleteros"],
    services: ["Acceso controlado", "Mantenimiento de áreas verdes", "Administración Lars"],
    availableUnits: [
      { unit: "G01", orientation: "Frente", bedrooms: 2, coveredArea: 68, totalArea: 92, price: 229000 },
      { unit: "G03", orientation: "Contrafrente", bedrooms: 2, coveredArea: 71, totalArea: 96, price: 238000 },
    ],
    availableParking: [{ number: "G7", capacity: 1, price: 22000 }],
  },
  {
    slug: "nexo",
    tag: "Nuevo desarrollo",
    title: "Nexo",
    location: "Cordón",
    address: "Cordón, Montevideo",
    description:
      "Demo para presentar una propuesta urbana con unidades compactas, amenities y lectura comercial clara.",
    image: "/project-urban.png",
    cardImage: "/optimized/projects/project-urban-card.webp",
    gallery: [
      withOptimizedGalleryImage("/project-urban.png", "Vista principal de Nexo"),
      withOptimizedGalleryImage("/images/projects/4.png", "Fachada de Nexo"),
      withOptimizedGalleryImage("/images/projects/tempo/2.png", "Lobby de Nexo"),
      withOptimizedGalleryImage("/images/projects/tempo/3.png", "Amenity de Nexo"),
    ],
    deliveryDates: ["Lanzamiento comercial"],
    benefits: ["Ubicación urbana de alta conectividad.", "Unidades pensadas para renta."],
    unitSummary: ["Monoambientes", "Apartamentos de 1 dormitorio", "Local comercial"],
    amenities: ["Cowork", "Laundry", "Rooftop", "Parrillero"],
    services: ["Ascensor", "Acceso digital", "Cámaras en espacios comunes", "Bicicleteros"],
    availableUnits: [
      { unit: "102", orientation: "Frente", bedrooms: 0, coveredArea: 31, totalArea: 35, price: 99000 },
      { unit: "305", orientation: "Contrafrente", bedrooms: 1, coveredArea: 43, totalArea: 49, price: 134000 },
    ],
    availableParking: [],
  },
];

export function getProjectBySlug(slug: string) {
  return featuredProjects.find((project) => project.slug === slug);
}

export function getProjectUrl(slug: string) {
  return `/proyectos/${slug}`;
}

export function getSimilarProjects(project: Project, limit = 3) {
  return featuredProjects
    .filter((candidate) => candidate.slug !== project.slug)
    .sort((left, right) => {
      const getScore = (candidate: Project) =>
        (candidate.location === project.location ? 3 : 0) +
        (candidate.tag === project.tag ? 2 : 0);

      return getScore(right) - getScore(left);
    })
    .slice(0, limit);
}
