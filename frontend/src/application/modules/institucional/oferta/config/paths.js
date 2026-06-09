/** Rutas del módulo Institucional → Oferta Académica */

export const OFERTA_BASE = '/institucional/oferta';

export const DOCENTE_ASIGNACIONES_TABS = {
  HORARIO: 'horario',
  COLOR: 'color',
};

export const ofertaPaths = {
  dashboard: () => OFERTA_BASE,
  gestionPlanes: (gestionId) => `${OFERTA_BASE}/gestiones/${gestionId}/planes`,
  gestionPlanesConPlan: (gestionId, gestionPlanId) =>
    `${OFERTA_BASE}/gestiones/${gestionId}/planes?plan=${gestionPlanId}`,
  paraleloDetalle: (paraleloGestionId) => `${OFERTA_BASE}/paralelo/${paraleloGestionId}`,
  docenteAsignaciones: (docenteId, opts = {}) => {
    const id = Number(docenteId);
    if (!Number.isFinite(id) || id < 1) return OFERTA_BASE;
    const q = new URLSearchParams();
    const tab = opts.tab;
    if (tab === DOCENTE_ASIGNACIONES_TABS.HORARIO || tab === DOCENTE_ASIGNACIONES_TABS.COLOR) {
      q.set('tab', tab);
    }
    const qs = q.toString();
    return `${OFERTA_BASE}/docente/${id}/asignaciones${qs ? `?${qs}` : ''}`;
  },
};

export function normalizeDocenteAsignacionesTab(raw) {
  if (raw === DOCENTE_ASIGNACIONES_TABS.COLOR) return DOCENTE_ASIGNACIONES_TABS.COLOR;
  return DOCENTE_ASIGNACIONES_TABS.HORARIO;
}
