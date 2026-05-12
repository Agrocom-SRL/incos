/**
 * Detección local de solapes aula+horario dentro del conjunto de cursos de un paralelo.
 * El agrupamiento oficial del paralelo para UI viene de `tablero_grupo` (API / vista SQL).
 */
export const detectarConflictos = (cursosParalelo, cursosHorariosMap) => {
    const seen = new Set();
    for (const curso of cursosParalelo) {
        const horarios = cursosHorariosMap[curso.id] || [];
        for (const ch of horarios) {
            const key = `${ch.horarioId}-${ch.aulaId}`;
            if (seen.has(key)) return true;
            seen.add(key);
        }
    }
    return false;
};
