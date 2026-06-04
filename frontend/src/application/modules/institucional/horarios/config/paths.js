import { ofertaPaths } from '@application-institucional/oferta/config/paths.js';

export const HORARIOS_GESTION_PATH = '/institucional/horarios';

/** Clave de ruta para resaltar el ítem de menú al volver desde oferta. */
export const HORARIOS_MENU_ROUTE_KEY = 'INST-HORARIOS';

/**
 * Navegación al detalle de oferta del paralelo con retorno al dashboard de horarios.
 * @param {number} paraleloGestionId
 * @param {{ ofertaCursoId?: number }} [opts] — abre el modal de asignación docente al cargar la ficha
 */
export function buildOfertaParaleloDetalleFromHorarios(paraleloGestionId, opts = {}) {
    const state = {
        returnListPath: HORARIOS_GESTION_PATH,
        menuSidebarKey: HORARIOS_MENU_ROUTE_KEY,
    };
    const ofertaCursoId = Number(opts.ofertaCursoId);
    if (Number.isFinite(ofertaCursoId) && ofertaCursoId > 0) {
        state.ofertaCursoId = ofertaCursoId;
    }
    return {
        pathname: ofertaPaths.paraleloDetalle(paraleloGestionId),
        state,
    };
}

/**
 * URL canónica del armado: solo `paralelo_gestion` (`pg`), sin id maestro `paralelos`.
 * @param {number} paraleloGestionId
 * @param {{ tab?: 'cobertura'|'plan'|'vista'|'cursos' }} [opts] — `cursos` se normaliza a `cobertura`
 */
export function buildHorariosArmadoUrl(paraleloGestionId, opts = {}) {
    const pg = Number(paraleloGestionId);
    if (!Number.isFinite(pg) || pg < 1) {
        return `${HORARIOS_GESTION_PATH}/armado`;
    }
    const q = new URLSearchParams();
    q.set('pg', String(pg));
    let tab = opts.tab ?? 'plan';
    if (tab === 'cursos') tab = 'cobertura';
    if (tab) q.set('tab', tab);
    return `${HORARIOS_GESTION_PATH}/armado?${q.toString()}`;
}
