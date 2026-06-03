import { ofertaPaths } from '@application-institucional/oferta/config/paths.js';

export const HORARIOS_GESTION_PATH = '/institucional/horarios';

/** Clave de ruta para resaltar el ítem de menú al volver desde oferta. */
export const HORARIOS_MENU_ROUTE_KEY = 'INST-HORARIOS';

/**
 * Navegación al detalle de oferta del paralelo con retorno al dashboard de horarios.
 * @param {number} paraleloGestionId
 */
export function buildOfertaParaleloDetalleFromHorarios(paraleloGestionId) {
    return {
        pathname: ofertaPaths.paraleloDetalle(paraleloGestionId),
        state: {
            returnListPath: HORARIOS_GESTION_PATH,
            menuSidebarKey: HORARIOS_MENU_ROUTE_KEY,
        },
    };
}

/**
 * URL canónica del armado: solo `paralelo_gestion` (`pg`), sin id maestro `paralelos`.
 * @param {number} paraleloGestionId
 * @param {{ tab?: string, asignarCurso?: number|string }} [opts]
 */
export function buildHorariosArmadoUrl(paraleloGestionId, opts = {}) {
    const pg = Number(paraleloGestionId);
    if (!Number.isFinite(pg) || pg < 1) {
        return `${HORARIOS_GESTION_PATH}/armado`;
    }
    const q = new URLSearchParams();
    q.set('pg', String(pg));
    const tab = opts.tab ?? 'plan';
    if (tab) q.set('tab', tab);
    if (opts.asignarCurso != null && String(opts.asignarCurso).trim() !== '') {
        q.set('asignarCurso', String(opts.asignarCurso));
    }
    return `${HORARIOS_GESTION_PATH}/armado?${q.toString()}`;
}
