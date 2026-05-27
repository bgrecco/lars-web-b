export type Project = {
  tag: string;
  title: string;
  location: string;
  description: string;
  image: string;
};

export const featuredProjects: Project[] = [
  {
    tag: "Proyecto destacado",
    title: "Tempo Guayabos",
    location: "Montevideo",
    description:
      "Una pieza principal para desarrollos con mucha presencia visual, identidad propia y CTA claro.",
    image: "/project-tempo.png",
  },
  {
    tag: "Edificio boutique",
    title: "Visca",
    location: "Montevideo",
    description:
      "Bloque pensado para presentar edificios y apartamentos con una lectura más directa y editorial.",
    image: "/project-urban.png",
  },
  {
    tag: "Housing garden",
    title: "Vila",
    location: "Barra de Carrasco",
    description:
      "Una variante para proyectos con más aire residencial, terrazas y vida de barrio.",
    image: "/project-garden.png",
  },
  {
    tag: "Nuevo desarrollo",
    title: "Nexo",
    location: "Cordón",
    description:
      "Demo para presentar una propuesta urbana con unidades compactas, amenities y lectura comercial clara.",
    image: "/project-urban.png",
  },
];
