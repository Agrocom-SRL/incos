import { resolveHorariosBoardBucket } from './horariosBoardBucket';

/**
 * Mensajes agregados para el banner de atención del dashboard de horarios.
 * @param {Array<Record<string, unknown>>} paralelos — filas filtradas del dashboard
 * @param {{ docentesConConflictos?: number }} [extras]
 * @returns {string[]}
 */
export function buildHorariosDashboardAlertLineas(paralelos, extras = {}) {
    const list = Array.isArray(paralelos) ? paralelos : [];
    const lines = [];

    let paralelosSinHorarios = 0;
    let cursosFaltantesOferta = 0;
    let materiasSinBloques = 0;
    let ofertasCoberturaIncompleta = 0;
    let paralelosSinAulaBase = 0;
    let paralelosConSolape = 0;

    let paralelosSinDocentes = 0;
    let materiasSinDocente = 0;
    let paralelosChoqueDocente = 0;

    let paralelosSinAulas = 0;
    let bloquesSinAula = 0;
    let crucesAula = 0;

    for (const p of list) {
        const bucket = resolveHorariosBoardBucket(p);
        const tot = Number(p.cursosTotales) || 0;
        const cread = Number(p.cursosCreados) || 0;
        const cursosAsignados = Number(p.cursosAsignados) || 0;
        const faltaCursos = Math.max(0, tot - cread);
        const coberturaInc = Number(p.ofertasCoberturaIncompleta) || 0;
        const sinBloques =
            p.cursosSinBloquesHorario != null
                ? Number(p.cursosSinBloquesHorario) || 0
                : Math.max(0, cread - cursosAsignados, coberturaInc);
        const solape = Number(p.conflictosSolapeMismoBloque) || 0;
        const sinAulaBase = p.paraleloAulaId == null || p.paraleloAulaId === 0;
        const sinDoc = Number(p.cursosSinDocente) || 0;
        const bloquesAula = Number(p.bloquesSinAula) || 0;
        const confAula = Number(p.conflictosAula) || 0;
        const docChoc = Boolean(p.conflictoDocenteHorario);

        if (bucket === 'sin_horarios') {
            paralelosSinHorarios += 1;
            cursosFaltantesOferta += faltaCursos;
            materiasSinBloques += sinBloques;
            ofertasCoberturaIncompleta += coberturaInc;
            if (solape > 0) paralelosConSolape += 1;
            crucesAula += confAula;
        }
        if (bucket === 'sin_docentes') {
            paralelosSinDocentes += 1;
            materiasSinDocente += sinDoc;
            if (docChoc) paralelosChoqueDocente += 1;
        }
        if (bucket === 'sin_aulas') {
            paralelosSinAulas += 1;
            bloquesSinAula += bloquesAula;
            if (sinAulaBase) paralelosSinAulaBase += 1;
        }
    }

    if (paralelosSinAulas > 0) {
        if (paralelosSinAulaBase > 0) {
            lines.push(
                `${paralelosSinAulaBase} paralelo(s) sin aula base en Oferta académica; asigná aula al paralelo o en cada bloque del armado.`,
            );
        }
        if (bloquesSinAula > 0) {
            lines.push(
                `${bloquesSinAula} bloque(s) sin aula efectiva en ${paralelosSinAulas} paralelo(s); usá Horarios en aulas o override en el armado.`,
            );
        }
    }

    if (paralelosSinDocentes > 0) {
        if (materiasSinDocente > 0) {
            lines.push(
                `${paralelosSinDocentes} paralelo(s) con ${materiasSinDocente} materia(s) sin docente; asigná docente y carga desde el detalle del paralelo en planificación.`,
            );
        }
        if (paralelosChoqueDocente > 0) {
            lines.push(
                `${paralelosChoqueDocente} paralelo(s) con choque de horario del mismo docente entre materias; reasigná docente o mové franjas en el armado.`,
            );
        }
        if (materiasSinDocente <= 0 && paralelosChoqueDocente <= 0) {
            lines.push(`${paralelosSinDocentes} paralelo(s) con pendientes de docencia.`);
        }
    }

    if (paralelosSinHorarios > 0) {
        if (cursosFaltantesOferta > 0) {
            lines.push(
                `${paralelosSinHorarios} paralelo(s) con oferta incompleta: faltan ${cursosFaltantesOferta} curso(s) por crear según el plan.`,
            );
        }
        if (ofertasCoberturaIncompleta > 0) {
            lines.push(
                `${ofertasCoberturaIncompleta} oferta(s) con bloques insuficientes respecto a las horas semanales del plan; completá franjas en el armado.`,
            );
        }
        if (materiasSinBloques > 0 && ofertasCoberturaIncompleta <= 0) {
            lines.push(
                `${materiasSinBloques} materia(s) en ${paralelosSinHorarios} paralelo(s) sin cobertura horaria completa; abrí el armado y asigná bloques hasta cubrir la carga.`,
            );
        }
        if (paralelosConSolape > 0) {
            lines.push(
                `${paralelosConSolape} paralelo(s) con solapes de franja entre materias del mismo grupo; corregí el plan en el armado antes de publicar.`,
            );
        }
        if (crucesAula > 0) {
            lines.push(
                `${crucesAula} cruce(s) de ocupación de aula entre paralelos; revisá Horarios en aulas (override por bloque).`,
            );
        }
        if (
            cursosFaltantesOferta <= 0 &&
            materiasSinBloques <= 0 &&
            ofertasCoberturaIncompleta <= 0 &&
            paralelosConSolape <= 0 &&
            crucesAula <= 0
        ) {
            lines.push(
                `${paralelosSinHorarios} paralelo(s) pendientes de armado del plan semanal (cursos, franjas o validaciones de horario).`,
            );
        }
    }

    const docConflictos = Number(extras.docentesConConflictos) || 0;
    if (docConflictos > 0) {
        lines.push(
            `${docConflictos} docente(s) con conflictos operativos de horario (solapes entre asignaciones); revisá el resumen lateral o el armado del paralelo afectado.`,
        );
    }

    return lines;
}
