type ContactCard = {
  title: string;
  details: string;
};

const contactCards: ContactCard[] = [
  {
    title: "Casa central Cordon",
    details: "Minas 1401 - Lunes a viernes de 9:00 a 17:00",
  },
  {
    title: "Sucursal Pocitos Nuevo",
    details: "Av. Gral Rivera 3471 - Lunes a viernes de 9:00 a 17:00",
  },
  {
    title: "Contacto directo",
    details: "2401 01 01 - 2622 50 50 - inmobiliaria@lars.com.uy",
  },
];

function ContactSectionHeader() {
  return (
    <div className="section-heading reveal">
      <h2>Oficinas</h2>
      <p />
    </div>
  );
}

export default function ContactSection() {
  return (
    <section className="section section-contact" id="contacto">
      <div className="container contact-layout">
        <div className="contact-copy">
          <ContactSectionHeader />

          <div className="contact-grid">
            {contactCards.map((item) => (
              <article key={item.title} className="contact-card reveal">
                <h3>{item.title}</h3>
                <p>{item.details}</p>
              </article>
            ))}
          </div>
        </div>

        <form className="contact-form reveal reveal-delay-2">
          <div className="contact-form-header">
            <h3>Contactanos</h3>
          </div>

          <div className="contact-form-grid">
            <label className="contact-field">
              <span className="sr-only">Nombre</span>
              <input type="text" placeholder="Nombre" aria-label="Nombre" />
            </label>
            <label className="contact-field contact-field-wide">
              <span className="sr-only">Celular / Teléfono</span>
              <input
                type="tel"
                placeholder="Celular / Teléfono"
                aria-label="Celular / Teléfono"
              />
            </label>
            <label className="contact-field contact-field-wide">
              <span className="sr-only">Correo electrónico</span>
              <input
                type="email"
                placeholder="Correo electrónico"
                aria-label="Correo electrónico"
              />
            </label>
            <label className="contact-field contact-field-wide">
              <span className="sr-only">Comentarios</span>
              <textarea
                rows={5}
                placeholder="Comentarios"
                aria-label="Comentarios"
              />
            </label>
          </div>

          <button type="button" className="primary-button contact-submit">
            Enviar consulta
          </button>
        </form>
      </div>
    </section>
  );
}
