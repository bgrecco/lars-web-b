import WhatsAppIcon from "./WhatsAppIcon";

export default function WhatsAppFloatingButton() {
  return (
    <a
      className="whatsapp-floating-button"
      href="https://wa.me/59824010101"
      target="_blank"
      rel="noreferrer"
      aria-label="Contactar por WhatsApp"
    >
      <WhatsAppIcon />
    </a>
  );
}
