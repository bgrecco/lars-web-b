import { useEffect } from "react";
import ContactSection from "../components/ContactSection";
import { featuredProjects, getProjectUrl } from "../data/projectsCatalog";

export default function ProjectsPage() {
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
  }, []);

  return (
    <div className="sales-page projects-page">
      <section className="sales-results projects-results" id="proyectos-resultados">
        <div className="container">
          <div className="sales-results-head reveal">
            <div className="sales-results-copy section-title-frame">
              <h2>Proyectos</h2>
            </div>
          </div>

          <div className="sales-grid project-results-grid">
            {featuredProjects.map((project, index) => (
              <article
                key={project.title}
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
                  <p>{project.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <ContactSection />
    </div>
  );
}
