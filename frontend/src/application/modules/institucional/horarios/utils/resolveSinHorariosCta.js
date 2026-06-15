/**
 * Resuelve la intención de la CTA de un paralelo en el grupo `sin_horarios`.
 *
 * Un paralelo puede caer en `sin_horarios` por motivos distintos que requieren
 * pantallas distintas: cruces de aula (conflictos), faltan cursos por crear
 * (oferta), falta de cobertura horaria (tab Cobertura del armado) o conflictos
 * de solape en la grilla (tab Plan semanal del armado). Centralizar aquí evita
 * que el label (botón) y el destino de navegación se desincronicen.
 *
 * @param {object} paralelo — fila/tarjeta del tablero de horarios
 * @returns {{ kind: 'cruce-aula'|'faltan-cursos'|'cobertura'|'conflicto', label: string }}
 */
export function resolveSinHorariosCta(paralelo) {
    const confAula = Number(paralelo.conflictosAula) || 0;
    const bloquesSinAula = Number(paralelo.bloquesSinAula) || 0;
    const sinAulaBase = paralelo.paraleloAulaId == null || paralelo.paraleloAulaId === 0;
    const cursosTotales = Number(paralelo.cursosTotales) || 0;
    const cursosCreados = Number(paralelo.cursosCreados) || 0;
    const coberturaInc = Number(paralelo.ofertasCoberturaIncompleta) || 0;
    const sinBloques = Number(paralelo.cursosSinBloquesHorario) || 0;
    const solape = Number(paralelo.conflictosSolapeMismoBloque) || 0;
    const faltaCursos = Math.max(0, cursosTotales - cursosCreados);

    const soloCruceAula =
        confAula > 0 &&
        faltaCursos <= 0 &&
        coberturaInc <= 0 &&
        sinBloques <= 0 &&
        solape <= 0 &&
        !sinAulaBase &&
        bloquesSinAula <= 0;
    if (soloCruceAula) return { kind: 'cruce-aula', label: 'Resolver cruces' };

    if (faltaCursos > 0) return { kind: 'faltan-cursos', label: 'Completar cursos' };

    // Falta de cobertura: hay bloques por generar para cubrir la carga del plan.
    if (coberturaInc > 0 || sinBloques > 0) {
        return { kind: 'cobertura', label: 'Asignar horarios' };
    }

    // Cobertura cubierta pero con solapes en la grilla → resolver en el plan.
    return { kind: 'conflicto', label: 'Resolver conflictos' };
}
