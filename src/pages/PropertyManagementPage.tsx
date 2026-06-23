import { useEffect } from "react";

import ContactSection from "../components/ContactSection";

type ManagementService = {
	title: string;
	body: string;
};

const managementServices: ManagementService[] = [
	{
		title: "Marketing y promoción del inmueble",
		body: "Aseguramos la máxima visibilidad de su inmueble, comenzando desde la tasación y producción fotográfica, hasta su publicación estratégica en los principales portales y redes sociales. Coordinamos y acompañamos personalmente a cada visita, realizando un seguimiento exhaustivo.",
	},
	{
		title: "Asesoramiento y Gestión de Garantías",
		body: "Brindamos asesoramiento integral sobre las diferentes garantías (CGN, ANDA, Porto Seguro y Sura). Mantenemos con cada una de ellas una relación de confianza avalada por años de trabajo conjunto.",
	},
	{
		title: "Rentabilidad Garantizada",
		body: "Nuestro compromiso es maximizar la rentabilidad de su inversión inmobiliaria, asegurando una gestión eficiente y efectiva.",
	},
	{
		title: "Gestión del Contrato",
		body: "Nos encargamos de la elaboración del contrato de arrendamiento y el inventario de la propiedad, respaldado con documentación fotográfica para una mayor transparencia y seguridad.",
	},
	{
		title: "Gestión Tributaria y Respaldo General",
		body: "Nos ocupamos de la gestión integral y el pago, sin costos adicionales, de tributos clave como el Fondo de Reserva, Impuesto de Primaria, Contribución Inmobiliaria y demás obligaciones fiscales.",
	},
	{
		title: "Control de Pagos",
		body: "Implementamos un seguimiento riguroso del pago de los gastos a cargo del arrendatario, garantizando el cumplimiento efectivo de sus obligaciones financieras.",
	},
	{
		title: "Agentes de Retención",
		body: "Brindamos asesoría especializada y gestionamos el trámite de exoneración de IRPF.",
	},
	{
		title: "Estado de Cuenta y Pagos Simplificados",
		body: "Desde nuestro sitio web podrá visualizar su estado de cuenta 24/7. En la cuenta bancaria de su preferencia podrá realizar directamente el pago de alquiler.",
	},
	{
		title: "Rescisiones Supervisadas",
		body: "Al finalizar el contrato, supervisamos personalmente la desocupación del inmueble, asegurando su concordancia con el inventario original.",
	},
	{
		title: "Acondicionamiento de la Propiedad",
		body: "Facilitamos diversos presupuestos sin costo, ofreciendo opciones para optimizar el estado de su propiedad.",
	},
];
const managementServicesSplitIndex = Math.ceil(managementServices.length / 2);

function ManagementServiceCard(props: { item: ManagementService; index: number }) {
	const { item, index } = props;

	return (
		<article className={`common-expenses-card reveal reveal-delay-${(index % 4) + 1}`}>
			<h3>{item.title}</h3>
			<p>{item.body}</p>
		</article>
	);
}

export default function PropertyManagementPage() {
	useEffect(() => {
		const page = document.querySelector<HTMLElement>(".common-expenses-page");
		const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

		if (!page || reducedMotion.matches) {
			return;
		}

		let frameId = 0;

		const updateParallax = () => {
			frameId = 0;
			const pageTop = page.getBoundingClientRect().top;
			const progress = Math.min(Math.max(-pageTop, 0), 920);
			page.style.setProperty("--ggcc-parallax", `${progress}px`);
		};

		const requestUpdate = () => {
			if (frameId) {
				return;
			}

			frameId = window.requestAnimationFrame(updateParallax);
		};

		updateParallax();
		window.addEventListener("scroll", requestUpdate, { passive: true });
		window.addEventListener("resize", requestUpdate);

		return () => {
			if (frameId) {
				window.cancelAnimationFrame(frameId);
			}

			window.removeEventListener("scroll", requestUpdate);
			window.removeEventListener("resize", requestUpdate);
			page.style.removeProperty("--ggcc-parallax");
		};
	}, []);

	return (
		<div className="common-expenses-page property-management-page">
			<section className="common-expenses-hero">
				<div className="container common-expenses-hero-layout">
					<div className="common-expenses-hero-copy reveal">
						<h1>
							<span>Administración de propiedades</span>
							<span>Gestión seria para cada inmueble</span>
						</h1>
					</div>
				</div>
			</section>

			<section className="common-expenses-section" id="gestion">
				<div className="container common-expenses-management-layout">
					<div className="common-expenses-management-copy">
						<div className="common-expenses-section-head reveal">
							<h2>Administramos tu propiedad de forma integral</h2>
						</div>

						<div className="common-expenses-card-grid">
							{managementServices.slice(0, managementServicesSplitIndex).map((item, index) => (
								<ManagementServiceCard key={item.title} item={item} index={index} />
							))}
						</div>
					</div>

					<aside className="spotlight-panel common-expenses-management-visual property-management-visual reveal reveal-delay-2">
						<div className="spotlight-image-wrap">
							<img
								src="/rent-city.jpg"
								alt="Edificios residenciales administrados por Lars"
								width="840"
								height="1722"
								fetchPriority="high"
								decoding="async"
							/>
						</div>
						<div className="spotlight-body">
							<h3>Un equipo entre el propietario, el inquilino y la operación diaria</h3>
							<p>
								Coordinamos pagos, documentación, mantenimiento y seguimiento para que la propiedad
								se mantenga administrada con continuidad y respaldo.
							</p>
						</div>
					</aside>

					<div className="common-expenses-card-grid common-expenses-card-grid-secondary">
						{managementServices.slice(managementServicesSplitIndex).map((item, index) => (
							<ManagementServiceCard
								key={item.title}
								item={item}
								index={index + managementServicesSplitIndex}
							/>
						))}
					</div>
				</div>
			</section>

			<ContactSection variant="contrast" />
		</div>
	);
}
