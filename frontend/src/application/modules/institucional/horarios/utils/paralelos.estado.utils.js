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

export const getEstadoParalelo = (paralelo, cursosDelPlan, cursosHorariosMap) => {
    const cursosParalelo = cursosDelPlan.filter((curso) => curso.paraleloId === paralelo.id);
    const asignaturasRequeridas = paralelo?.periodo?.asignaturasPlan?.length || 0;

    if (cursosParalelo.length < asignaturasRequeridas) return 'incompleto';

    const cursosConHorario = cursosParalelo.filter((curso) => {
        return (cursosHorariosMap[curso.id] || []).length > 0;
    });
    if (cursosConHorario.length < cursosParalelo.length) return 'sin_horario';

    const hayConflicto = detectarConflictos(cursosParalelo, cursosHorariosMap);
    if (hayConflicto) return 'conflicto';

    return 'completo';
};
