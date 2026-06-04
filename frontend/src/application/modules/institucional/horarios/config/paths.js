import { ofertaPaths } from '@application-institucional/oferta/config/paths.js';

export const HORARIOS_GESTION_PATH = '/institucional/horarios';
export const HORARIOS_CONFLICTOS_PATH = `${HORARIOS_GESTION_PATH}/conflictos`;

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

const returnHorariosDashboardState = () => ({
    returnListPath: HORARIOS_GESTION_PATH,
    menuSidebarKey: HORARIOS_MENU_ROUTE_KEY,
});

/**
 * Destino para resolver conflictos operativos de un docente desde el sidebar de horarios.
 * Prioriza armado de grilla (choque de franjas); aula y asignación duplicada tienen rutas dedicadas.
 *
 * @param {{ paraleloGestionId?: number|null, ofertaCursoId?: number|null, tiposConflicto?: string[] }} docenteRow
 * @returns {{ pathname: string, state?: object }}
 */
export function buildResolverConflictoDocenteNavTarget(docenteRow = {}) {
    const pg = Number(docenteRow.paraleloGestionId);
    const oc = Number(docenteRow.ofertaCursoId);
    const tipos = new Set(
        (docenteRow.tiposConflicto || []).map((t) => String(t || '').trim().toLowerCase()).filter(Boolean),
    );
    const soloAula = tipos.size === 1 && tipos.has('aula');
    const soloDuplicado = tipos.size === 1 && tipos.has('duplicado');

    if (soloAula) {
        return {
            pathname: `${HORARIOS_GESTION_PATH}/aulas`,
            search: '?edicion=1',
            state: returnHorariosDashboardState(),
        };
    }

    if (soloDuplicado && Number.isFinite(pg) && pg > 0) {
        const opts = Number.isFinite(oc) && oc > 0 ? { ofertaCursoId: oc } : {};
        return buildOfertaParaleloDetalleFromHorarios(pg, opts);
    }

    const docenteId = Number(docenteRow.docenteId);
    if (Number.isFinite(docenteId) && docenteId > 0) {
        return { pathname: buildHorariosConflictosUrl(docenteId) };
    }

    if (Number.isFinite(pg) && pg > 0) {
        return { pathname: buildHorariosArmadoUrl(pg, { tab: 'plan' }) };
    }

    return { pathname: HORARIOS_GESTION_PATH };
}

/** @param {number} docenteId */
export function buildHorariosConflictosUrl(docenteId) {
    const id = Number(docenteId);
    if (!Number.isFinite(id) || id < 1) {
        return HORARIOS_CONFLICTOS_PATH;
    }
    const q = new URLSearchParams();
    q.set('docenteId', String(id));
    return `${HORARIOS_CONFLICTOS_PATH}?${q.toString()}`;
}

/** Etiqueta del CTA según tipos de conflicto del docente. */
export function labelResolverConflictoDocente(docenteRow = {}) {
    const tipos = new Set(
        (docenteRow.tiposConflicto || []).map((t) => String(t || '').trim().toLowerCase()).filter(Boolean),
    );
    if (tipos.size === 1 && tipos.has('aula')) return 'Resolver en aulas';
    if (tipos.size === 1 && tipos.has('duplicado')) return 'Revisar asignación';
    return 'Resolver conflictos';
}
