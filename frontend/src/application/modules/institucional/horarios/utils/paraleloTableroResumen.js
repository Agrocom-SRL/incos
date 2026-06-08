import { resolveHorariosBoardBucket } from './horariosBoardBucket';

/**
 * Texto breve según grupo del tablero (dashboard y publicación).
 * @param {Record<string, unknown>} p
 */
export function resumenTableroParaleloCard(p) {
    const bucket = p.boardBucket ?? resolveHorariosBoardBucket(p);
    const cursosTotales = Number(p.cursosTotales) || 0;
    const cursosCreados = Number(p.cursosCreados) || 0;
    const cursosAsignados = Number(p.cursosAsignados) || 0;
    const falta = Math.max(0, cursosTotales - cursosCreados);
    const sinDoc = Number(p.cursosSinDocente) || 0;
    const sinBloques =
        p.cursosSinBloquesHorario != null
            ? Number(p.cursosSinBloquesHorario) || 0
            : Math.max(0, cursosCreados - cursosAsignados);
    const bloquesSinAula = Number(p.bloquesSinAula) || 0;
    const coberturaInc = Number(p.ofertasCoberturaIncompleta) || 0;
    const solape = Number(p.conflictosSolapeMismoBloque) || 0;
    const confAula = Number(p.conflictosAula) || 0;
    const sinAulaBase = p.paraleloAulaId == null || p.paraleloAulaId === 0;

    switch (bucket) {
        case 'completo':
            return 'Plan completo y alineado con las validaciones; listo para publicar.';
        case 'sin_horarios':
            if (falta > 0) {
                return `Faltan ${falta} curso(s) del plan de estudio por crear en este paralelo.`;
            }
            if (solape > 0) {
                return 'Hay solapes de franja entre materias del grupo; corregí el plan semanal.';
            }
            if (coberturaInc > 0) {
                return `${coberturaInc} materia(s) con bloques insuficientes para cubrir las horas semanales del plan.`;
            }
            if (sinBloques > 0) {
                return `${sinBloques} materia(s) sin cobertura horaria completa en el plan semanal.`;
            }
            if (confAula > 0) {
                return `Hay ${confAula} cruce(s) de aula con otro paralelo; reasigná override por bloque en Horarios en aulas.`;
            }
            return 'Completá cursos y el plan semanal (franjas) antes de publicar.';
        case 'sin_docentes':
            if (sinDoc > 0) return `${sinDoc} materia(s) aún sin docente asignado.`;
            return 'Hay choque de horario de docente entre materias; reasigná o mové franjas.';
        case 'sin_aulas':
            if (sinAulaBase) {
                return 'El paralelo no tiene aula base en Oferta académica; asigná aula al paralelo o por bloque.';
            }
            if (bloquesSinAula > 0) {
                return `${bloquesSinAula} bloque(s) sin aula efectiva (sin base en paralelo ni override por bloque).`;
            }
            return 'Asigná aula base en Oferta académica o override por bloque en el plan.';
        default:
            return 'Revisá el armado del plan en gestión de horarios.';
    }
}
