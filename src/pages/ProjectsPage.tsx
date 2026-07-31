import { useEffect, useState } from "react";
import { fetchProjects, getLarsApiErrorMessage, isAbortError } from "../api/larsApi";
import LarsLogoLoader from "../components/LarsLogoLoader";
import { canUseMockCatalogFallback, shouldUseMockCatalog } from "../config/dataSource";
import { featuredProjects, getProjectUrl, type Project } from "../data/projectsCatalog";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isUsingFallbackCatalog, setIsUsingFallbackCatalog] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    setIsLoadingProjects(true);
    setLoadError("");
    setIsUsingFallbackCatalog(false);

    if (shouldUseMockCatalog) {
      setProjects(featuredProjects);
      setIsLoadingProjects(false);
      return;
    }

    fetchProjects(controller.signal)
      .then((nextProjects) => {
        setProjects(nextProjects);
      })
      .catch((error: unknown) => {
        if (isAbortError(error)) {
          return;
        }

        setLoadError(getLarsApiErrorMessage(error));
        setProjects(canUseMockCatalogFallback ? featuredProjects : []);
        setIsUsingFallbackCatalog(canUseMockCatalogFallback);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoadingProjects(false);
        }
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>(".projects-page .reveal:not(.is-visible)"));

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
  }, [isLoadingProjects, projects.length, loadError]);

  if (isLoadingProjects && !projects.length) {
    return (
      <div className="sales-page projects-page">
        <section className="sales-loader-section" aria-live="polite">
          <LarsLogoLoader />
        </section>
      </div>
    );
  }

  return (
    <div className="sales-page projects-page">
      <section className="sales-results projects-results" id="proyectos-resultados">
        <div className="container">
          {loadError ? (
            <div className="sales-data-alert reveal is-visible" role={isUsingFallbackCatalog ? "status" : "alert"}>
              <strong>
                {isUsingFallbackCatalog
                  ? "Mostrando proyectos de prueba mientras el catálogo público no responde."
                  : "No pudimos cargar los proyectos."}
              </strong>
              <span>{loadError}</span>
            </div>
          ) : null}

          {projects.length ? (
            <div className="sales-grid project-results-grid">
              {projects.map((project, index) => (
                <article
                  key={project.slug || project.title}
                  className={`project-card project-results-card reveal reveal-delay-${(index % 4) + 1}`}
                >
                  <a
                    href={getProjectUrl(project.slug)}
                    className="project-card-hitarea"
                    aria-label={`Ver detalles de ${project.title}`}
                  />
                  <div className="project-image-wrap">
                    <img
                      src={project.cardImage}
                      alt={project.title}
                      className="project-image"
                      width="700"
                      height={project.slug === "tempo-guayabos" ? 543 : project.slug === "vila" ? 804 : 750}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div className="project-body">
                    <h3>{project.title}</h3>
                    <p className="project-meta">{project.location}</p>
                    <p className="project-card-description">{project.description}</p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="sales-empty-state reveal is-visible">
              <h3>No hay proyectos disponibles.</h3>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
