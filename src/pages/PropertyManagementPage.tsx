import { useEffect } from "react";

import ContactSection from "../components/ContactSection";

type ManagementService = {
	title: string;
	body: string;
};

const managementServices: ManagementService[] = [
	{
		title: "Atención a propietarios e inquilinos",
		body: "Centralizamos consultas, solicitudes y seguimiento cotidiano para que cada parte tenga respuestas claras y trazables.",
	},
	{
		title: "Cobranza y liquidación mensual",
		body: "Gestionamos el cobro del alquiler, controlamos pagos asociados y entregamos liquidaciones ordenadas mes a mes.",
	},
	{
		title: "Control documental",
		body: "Acompañamos contratos, garantías, vencimientos, inventarios y respaldos administrativos vinculados a cada propiedad.",
	},
	{
		title: "Mantenimiento coordinado",
		body: "Recibimos incidencias, coordinamos técnicos y damos seguimiento a reparaciones para cuidar el estado del inmueble.",
	},
	{
		title: "Comunicación permanente",
		body: "Mantenemos informado al propietario sobre novedades relevantes, atrasos, solicitudes y decisiones operativas.",
	},
	{
		title: "Respaldo profesional",
		body: "Un equipo con experiencia inmobiliaria y administrativa sostiene la operación con criterio, seriedad y continuidad.",
	},
	{
		title: "Respaldo operativo",
		body: "Acompañamos cada etapa con control, comunicación y capacidad de respuesta para reducir fricciones y sostener el valor del inmueble.",
	},
];

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
							<h2>Administramos tu propiedad con seguimiento integral</h2>
							<p>
								Desde la cobranza mensual hasta el mantenimiento y la comunicación con inquilinos,
								reunimos la operación administrativa en un servicio claro, ordenado y profesional.
							</p>
						</div>

						<div className="common-expenses-card-grid">
							{managementServices.map((item, index) => (
								<ManagementServiceCard key={item.title} item={item} index={index} />
							))}
						</div>
					</div>

					<aside className="spotlight-panel common-expenses-management-visual property-management-visual reveal reveal-delay-2">
						<div className="spotlight-image-wrap">
							<img src="/rent-city.png" alt="Edificios residenciales administrados por Lars" />
						</div>
						<div className="spotlight-body">
							<h3>Un equipo entre el propietario, el inquilino y la operación diaria</h3>
							<p>
								Coordinamos pagos, documentación, mantenimiento y seguimiento para que la propiedad
								se mantenga administrada con continuidad y respaldo.
							</p>
						</div>
					</aside>
				</div>
			</section>

			<ContactSection variant="contrast" />
		</div>
	);
}
