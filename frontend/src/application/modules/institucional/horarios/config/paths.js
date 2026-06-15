import { ofertaPaths } from '@application-institucional/oferta/config/paths.js';

export const HORARIOS_GESTION_PATH = '/institucional/horarios';
export const HORARIOS_CONFLICTOS_PATH = `${HORARIOS_GESTION_PATH}/conflictos`;
export const HORARIOS_AULAS_PATH = `${HORARIOS_GESTION_PATH}/aulas`;

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

/** @param {{ tiposConflicto?: string[] }} docenteRow */
export function docenteConflictoTiposSet(docenteRow = {}) {
    return new Set(
        (docenteRow.tiposConflicto || [])
            .map((t) => String(t || '').trim().toLowerCase())
            .filter(Boolean),
    );
}

/** @param {{ tiposConflicto?: string[] }} docenteRow */
export function docenteTieneConflictoHorario(docenteRow = {}) {
    return docenteConflictoTiposSet(docenteRow).has('horario');
}

/** @param {{ tiposConflicto?: string[] }} docenteRow */
export function docenteSoloConflictoAula(docenteRow = {}) {
    const tipos = docenteConflictoTiposSet(docenteRow);
    return tipos.size === 1 && tipos.has('aula');
}

/** @param {{ tiposConflicto?: string[] }} docenteRow */
export function docenteSoloConflictoDuplicado(docenteRow = {}) {
    const tipos = docenteConflictoTiposSet(docenteRow);
    return tipos.size === 1 && tipos.has('duplicado');
}

/** Texto de ayuda del modal según tipos de conflicto del docente. */
export function hintModalConflictoDocente(docenteRow = {}) {
    if (docenteSoloConflictoAula(docenteRow)) {
        return 'Otro paralelo ocupa la misma aula en esa franja. Asigná override por bloque en Horarios en aulas o ajustá la aula base en Oferta académica.';
    }
    if (docenteSoloConflictoDuplicado(docenteRow)) {
        return 'Hay más de una asignación vigente del mismo docente al mismo curso; revisá la oferta del paralelo.';
    }
    return 'Mové al menos uno de los bloques en rojo a otra franja. La asignación docente ↔ materia se ajusta en Oferta académica si hace falta cambiar quién dicta la materia.';
}

/**
 * Destino para resolver conflictos operativos de un docente desde el sidebar de horarios.
 * Prioriza armado de grilla (choque de franjas); conflicto de aula → pantalla de conflictos.
 *
 * @param {{ docenteId?: number|null, paraleloGestionId?: number|null, ofertaCursoId?: number|null, tiposConflicto?: string[] }} docenteRow
 * @returns {{ pathname: string, search?: string, state?: object }}
 */
export function buildResolverConflictoDocenteNavTarget(docenteRow = {}) {
    const pg = Number(docenteRow.paraleloGestionId);
    const oc = Number(docenteRow.ofertaCursoId);
    const docenteId = Number(docenteRow.docenteId);

    if (docenteTieneConflictoHorario(docenteRow) && Number.isFinite(docenteId) && docenteId > 0) {
        return {
            pathname: HORARIOS_CONFLICTOS_PATH,
            search: `?docenteId=${docenteId}`,
            state: returnHorariosDashboardState(),
        };
    }

    if (docenteSoloConflictoDuplicado(docenteRow) && Number.isFinite(pg) && pg > 0) {
        const opts = Number.isFinite(oc) && oc > 0 ? { ofertaCursoId: oc } : {};
        return buildOfertaParaleloDetalleFromHorarios(pg, opts);
    }

    if (docenteSoloConflictoAula(docenteRow)) {
        return {
            pathname: HORARIOS_CONFLICTOS_PATH,
            search: Number.isFinite(docenteId) && docenteId > 0 ? `?docenteId=${docenteId}` : undefined,
            state: returnHorariosDashboardState(),
        };
    }

    if (Number.isFinite(docenteId) && docenteId > 0) {
        return {
            pathname: HORARIOS_CONFLICTOS_PATH,
            search: `?docenteId=${docenteId}`,
            state: returnHorariosDashboardState(),
        };
    }

    if (Number.isFinite(pg) && pg > 0) {
        return { pathname: buildHorariosArmadoUrl(pg, { tab: 'plan' }) };
    }

    return { pathname: HORARIOS_GESTION_PATH };
}

/** @param {number} docenteId @param {{ vista?: 'docente'|number }} [opts] */
export function buildHorariosConflictosUrl(docenteId, opts = {}) {
    const id = Number(docenteId);
    const q = new URLSearchParams();
    if (Number.isFinite(id) && id > 0) {
        q.set('docenteId', String(id));
    }
    const vista = opts.vista;
    if (vista != null && vista !== 'docente') {
        const pg = Number(vista);
        if (Number.isFinite(pg) && pg > 0) q.set('vista', `pg-${pg}`);
    }
    const qs = q.toString();
    return qs ? `${HORARIOS_CONFLICTOS_PATH}?${qs}` : HORARIOS_CONFLICTOS_PATH;
}

/** Etiqueta del CTA según tipos de conflicto del docente. */
export function labelResolverConflictoDocente(docenteRow = {}) {
    if (docenteTieneConflictoHorario(docenteRow)) return 'Resolver conflictos';
    if (docenteSoloConflictoDuplicado(docenteRow)) return 'Revisar asignación';
    if (docenteSoloConflictoAula(docenteRow)) return 'Resolver en aulas';
    return 'Resolver conflictos';
}

/** Columna «Sin docentes» por choque de franjas (sin materias pendientes de docente). */
export function paraleloSinDocentesEsSoloChoqueHorario(paralelo = {}) {
    const sinDoc = Number(paralelo.cursosSinDocente) || 0;
    return sinDoc <= 0 && Boolean(paralelo.conflictoDocenteHorario);
}

/**
 * Docente con conflicto de horario que afecta al paralelo en gestión.
 * @param {number} paraleloGestionId
 * @param {{ paralelo?: string, turno?: string }} paraleloMeta
 * @param {Array<{ docenteId?: number, paraleloGestionId?: number, lineasDetalle?: string[], tiposConflicto?: string[] }>} docentesList
 */
export function findDocenteConflictoHorarioEnParalelo(
    paraleloGestionId,
    paraleloMeta = {},
    docentesList = [],
) {
    const pgId = Number(paraleloGestionId);
    const nombre = String(paraleloMeta.paralelo || '').trim().toUpperCase();
    const turno = String(paraleloMeta.turno || '').trim().toUpperCase();

    const candidatos = (docentesList || []).filter(
        (d) => d?.docenteId != null && docenteTieneConflictoHorario(d),
    );
    if (!candidatos.length) return null;

    const involucraParalelo = (d) => {
        if (Number.isFinite(pgId) && pgId > 0 && Number(d.paraleloGestionId) === pgId) return true;
        if (!nombre) return false;
        return (d.lineasDetalle || []).some((line) => {
            const upper = String(line).toUpperCase();
            if (!upper.includes(nombre)) return false;
            if (turno && !upper.includes(turno)) return false;
            return true;
        });
    };

    return candidatos.find(involucraParalelo) ?? null;
}

/**
 * Destino del CTA en columna «Sin docentes» del tablero de horarios.
 * @param {Record<string, unknown>} paralelo
 * @param {Array} [docentesConConflictosOperativos]
 */
export function buildParaleloSinDocentesNavTarget(paralelo = {}, docentesConConflictosOperativos = []) {
    const pgId = Number(paralelo.paraleloGestionId);

    if (paraleloSinDocentesEsSoloChoqueHorario(paralelo)) {
        const docente = findDocenteConflictoHorarioEnParalelo(
            pgId,
            { paralelo: paralelo.paralelo, turno: paralelo.turno },
            docentesConConflictosOperativos,
        );
        if (docente) return buildResolverConflictoDocenteNavTarget(docente);
        return {
            pathname: HORARIOS_CONFLICTOS_PATH,
            state: returnHorariosDashboardState(),
        };
    }

    if (Number.isFinite(pgId) && pgId > 0) {
        return buildOfertaParaleloDetalleFromHorarios(pgId);
    }

    return { pathname: HORARIOS_GESTION_PATH };
}

/** Etiqueta del CTA en columna «Sin docentes». */
export function labelParaleloSinDocentesCta(paralelo = {}) {
    if (paraleloSinDocentesEsSoloChoqueHorario(paralelo)) return 'Resolver conflictos';
    return 'Asignar docentes';
}

/** Permiso RBAC del CTA en columna «Sin docentes». */
export function permisoParaleloSinDocentesCta(paralelo = {}) {
    if (paraleloSinDocentesEsSoloChoqueHorario(paralelo)) {
        return { permiso: 'institucional.horario.armado', accion: 'EDITAR' };
    }
    return { permiso: 'institucional.oferta.paralelo-gestion', accion: 'DETALLE' };
}

/** @param {{ pathname: string, search?: string, state?: object }} target */
export function formatHorariosNavTarget(target = {}) {
    const pathname = target.pathname || HORARIOS_GESTION_PATH;
    const to = target.search ? `${pathname}${target.search}` : pathname;
    return { to, state: target.state };
}
