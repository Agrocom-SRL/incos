/** Rutas del módulo Institucional → Oferta Académica */

export const OFERTA_BASE = '/institucional/oferta';

export const ofertaPaths = {
  dashboard: () => OFERTA_BASE,
  gestionPlanes: (gestionId) => `${OFERTA_BASE}/gestiones/${gestionId}/planes`,
  gestionPlanesConPlan: (gestionId, gestionPlanId) =>
    `${OFERTA_BASE}/gestiones/${gestionId}/planes?plan=${gestionPlanId}`,
  paralelosGestion: (gestionId, gestionPlanId) =>
    `${OFERTA_BASE}/gestiones/${gestionId}/planes/${gestionPlanId}/paralelos`,
  paraleloDetalle: (paraleloGestionId) => `${OFERTA_BASE}/paralelo/${paraleloGestionId}`,
};
