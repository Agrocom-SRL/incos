/** Rutas del módulo Institucional → Oferta Académica */

export const OFERTA_BASE = '/institucional/oferta';

export const ofertaPaths = {
  dashboard: () => OFERTA_BASE,
  gestiones: () => `${OFERTA_BASE}/gestiones`,
  gestionPlanes: (gestionId) => `${OFERTA_BASE}/gestiones/${gestionId}/planes`,
  paralelosGestion: (gestionId, gestionPlanId) =>
    `${OFERTA_BASE}/gestiones/${gestionId}/planes/${gestionPlanId}/paralelos`,
  paraleloDetalle: (paraleloGestionId) => `${OFERTA_BASE}/paralelo/${paraleloGestionId}`,
};
