import WhatsAppIcon from "./WhatsAppIcon";

type ContactCard = {
  title: string;
  details?: string;
  address?: string;
  addressHref?: string;
  schedule?: string;
};

type ContactSectionProps = {
  className?: string;
  showOffices?: boolean;
  variant?: "default" | "contrast";
};

const contactCards: ContactCard[] = [
  {
    title: "Casa central",
    address: "Minas 1401",
    addressHref: "https://www.google.com/maps/search/?api=1&query=Minas+1401,+Montevideo,+Uruguay",
    schedule: "Lunes a viernes de 9:45 a 18:30",
  },
  {
    title: "Sucursal Pocitos Nuevo",
    address: "Rivera 3471",
    addressHref: "https://www.google.com/maps/search/?api=1&query=Av.+Gral+Rivera+3471,+Montevideo,+Uruguay",
    schedule: "Lunes a jueves de 10:00 a 18:30\nViernes de 10:00 a 17:00",
  },
  {
    title: "Contacto",
    details: "2401 01 01 - 2622 50 50 inmobiliaria@lars.com.uy",
  },
];

function ContactSectionHeaderWithVariant(props: { variant: ContactSectionProps["variant"] }) {
  const { variant } = props;

  return (
    <div
      className={`section-heading section-title-frame contact-section-title reveal${
        variant === "contrast" ? " contact-section-title-light" : " contact-section-title-dark"
      }${variant === "contrast" ? " section-heading-featured" : ""}`}
    >
      <h2>Oficinas</h2>
    </div>
  );
}

export function ContactForm(props: { className?: string }) {
  const { className } = props;
  const formClassName = ["contact-form", "reveal", "reveal-delay-2", className].filter(Boolean).join(" ");

  return (
    <form className={formClassName}>
      <div className="contact-form-header">
        <h3>Contactanos</h3>
      </div>

      <div className="contact-form-grid">
        <label className="contact-field">
          <span className="sr-only">Nombre</span>
          <input type="text" placeholder="Nombre" aria-label="Nombre" />
        </label>
        <label className="contact-field contact-field-wide">
          <span className="sr-only">Celular</span>
          <input type="tel" placeholder="Celular" aria-label="Celular" />
        </label>
        <label className="contact-field contact-field-wide">
          <span className="sr-only">Email</span>
          <input type="email" placeholder="Email" aria-label="Email" />
        </label>
        <label className="contact-field contact-field-wide">
          <span className="sr-only">Comentarios</span>
          <textarea rows={5} placeholder="Comentarios" aria-label="Comentarios" />
        </label>
      </div>

      <div className="contact-form-actions">
        <a
          className="contact-whatsapp-button"
          href="https://wa.me/59824010101"
          target="_blank"
          rel="noreferrer"
        >
          <WhatsAppIcon />
          <span>WhatsApp</span>
        </a>

        <button type="button" className="primary-button contact-submit">
          <span>Enviar</span>
        </button>
      </div>
    </form>
  );
}

export default function ContactSection({ className, showOffices = true, variant = "default" }: ContactSectionProps) {
  const sectionClassName = [
    "section",
    "section-contact",
    !showOffices ? "section-contact-form-only" : "",
    variant === "contrast" ? "section-contact-contrast" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={sectionClassName} id="contacto">
      <div className="container contact-layout">
        {showOffices ? (
          <div className="contact-copy">
            <ContactSectionHeaderWithVariant variant={variant} />

            <div className="contact-grid">
              {contactCards.map((item) => (
                <article key={item.title} className="contact-card reveal">
                  <h3>{item.title}</h3>
                  {item.address && item.addressHref ? (
                    <p className="contact-card-details">
                      <a href={item.addressHref} target="_blank" rel="noreferrer" className="contact-address-link">
                        {item.address}
                      </a>
                      {item.schedule ? (
                        <span className="contact-card-schedule">{item.schedule}</span>
                      ) : null}
                    </p>
                  ) : (
                    <p className="contact-card-details">{item.details}</p>
                  )}
                </article>
              ))}
            </div>
          </div>
        ) : null}

        <ContactForm />
      </div>
    </section>
  );
}
