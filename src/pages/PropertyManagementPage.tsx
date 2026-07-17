import { useEffect } from "react";

import ContactSection from "../components/ContactSection";

type ManagementService = {
	title: string;
	body: string;
};

const managementServices: ManagementService[] = [
	{
		title: "MARKETING Y PROMOCIÓN",
		body: "Aseguramos la máxima visibilidad de su inmueble, desde la tasación y producción fotográfica hasta la publicación estratégica en portales y redes sociales. Coordinamos y acompañamos personalmente cada visita, realizando un seguimiento exhaustivo.",
	},
	{
		title: "GARANTÍAS",
		body: "Brindamos asesoramiento integral sobre las diferentes garantías (CGN, ANDA, Porto Seguro y Sura).",
	},
	{
		title: "CONFECCIÓN DEL CONTRATO",
		body: "Confeccionamos el contrato de arrendamiento y el inventario de la propiedad, respaldados con material fotográfico para mayor transparencia y seguridad.",
	},
	// {
	// 	title: "RENTABILIDAD GARANTIZADA",
	// 	body: "Nuestro compromiso es maximizar la rentabilidad de su inversión inmobiliaria, asegurando una gestión eficiente y efectiva.",
	// },
	{
		title: "GESTIÓN TRIBUTARIA",
		body: "Nos ocupamos de la gestión integral y del pago, sin costos adicionales, de tributos clave como Fondo de Reserva, Impuesto de Primaria, Contribución Inmobiliaria y demás obligaciones fiscales.",
	},
	{
		title: "CONTROL DE PAGOS",
		body: "Implementamos un seguimiento riguroso de los pagos a cargo del arrendatario, garantizando el cumplimiento efectivo de sus obligaciones contractuales.",
	},
	{
		title: "AGENTES DE RETENCIÓN",
		body: "Brindamos asesoría especializada y gestionamos el trámite de exoneración de IRPF.",
	},
	{
		title: "PAGOS SIMPLIFICADOS",
		body: "Desde nuestro sitio web podrá visualizar su estado de cuenta y realizar el pago de alquiler directamente en la cuenta bancaria de su preferencia. Contamos además con diversas vías de comunicación: correo electrónico, atención telefónica y WhatsApp.",
	},
	{
		title: "RESCISIONES SUPERVISADAS",
		body: "Al finalizar el contrato, supervisamos personalmente la desocupación del inmueble, asegurando su concordancia con el inventario.",
	},
	{
		title: "ACONDICIONAMIENTO",
		body: "Sin costo, facilitamos diversos presupuestos para optimizar el estado de la propiedad.",
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

			<section className="common-expenses-section" id="gestion">
				<div className="container common-expenses-management-layout">
					<div className="common-expenses-management-copy">

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
