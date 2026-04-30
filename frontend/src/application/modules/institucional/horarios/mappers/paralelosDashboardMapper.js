// DEPRECATED: reemplazado por vistas SQL (useParalelosEstadoApi).
// No importar desde dashboard hooks. Conservar para referencia.
import { getEstadoParalelo } from '@application-institucional/horarios/utils/paralelos.estado.utils';

const buildParaleloDomainShape = (rawParalelo, index) => {
    const paraleloId = Number(rawParalelo.id || index + 1);
    const periodoNumero = Number(rawParalelo.periodoNumero || rawParalelo.periodoId || 1);
    const requiredCount = periodoNumero === 1 ? 7 : periodoNumero === 2 ? 6 : 5;
    const asignaturasPlan = Array.from({ length: requiredCount }, (_, idx) => ({
        id: `${paraleloId}-${idx + 1}`,
        nombre: `Asignatura ${idx + 1}`,
        horasSemanales: 4,
    }));
    return {
        id: paraleloId,
        nombre: rawParalelo.nombre || rawParalelo.codigo || `Paralelo ${paraleloId}`,
        carreraId: Number(rawParalelo.carreraId),
        turno: rawParalelo.turno || 'Noche',
        periodo: {
            numero: periodoNumero,
            nombre: `${periodoNumero}er año`,
            asignaturasPlan,
        },
    };
};

// TODO: reemplazar este generador por use case real de cursos/cursos_horarios.
const buildCursosSnapshot = (paralelo) => {
    const stateSeed = paralelo.id % 4;
    const required = paralelo.periodo.asignaturasPlan.length;
    const cursos = [];
    const cursosHorariosMap = {};
    const courseTarget = stateSeed === 0 ? Math.max(required - 2, 1) : required;

    for (let idx = 0; idx < courseTarget; idx += 1) {
        const cursoId = `${paralelo.id}-CUR-${idx + 1}`;
        cursos.push({
            id: cursoId,
            paraleloId: paralelo.id,
            asignaturaPlanId: paralelo.periodo.asignaturasPlan[idx]?.id,
        });

        if (stateSeed === 1 && idx >= courseTarget - 2) {
            cursosHorariosMap[cursoId] = [];
            continue;
        }

        if (stateSeed === 2 && idx < 2) {
            cursosHorariosMap[cursoId] = [{ horarioId: 'H-1', aulaId: 'A-1' }];
            continue;
        }

        cursosHorariosMap[cursoId] = [{ horarioId: `H-${paralelo.id}-${idx + 1}`, aulaId: `A-${(idx % 4) + 1}` }];
    }

    return { cursos, cursosHorariosMap };
};

export const mapParalelosToDashboard = (paralelos, carrerasById, gestionLabel = 'Actual') => {
    const cursosIncompletos = [];
    const turnosCapacity = { Manana: 0, Tarde: 0, Noche: 0 };
    const dashboardRows = (paralelos || []).map((item, index) => {
        const paralelo = buildParaleloDomainShape(item, index);
        const { cursos, cursosHorariosMap } = buildCursosSnapshot(paralelo);
        const estado = getEstadoParalelo(paralelo, cursos, cursosHorariosMap);
        const cursosConHorario = cursos.filter((curso) => (cursosHorariosMap[curso.id] || []).length > 0).length;
        const conflictos = estado === 'conflicto' ? 1 : 0;
        const missingCount = Math.max(paralelo.periodo.asignaturasPlan.length - cursos.length, 0);
        if (missingCount > 0) {
            cursosIncompletos.push({
                paraleloId: paralelo.id,
                carrera: carrerasById.get(paralelo.carreraId) || 'Carrera no definida',
                periodo: paralelo.periodo.nombre,
                faltantes: missingCount,
            });
        }
        turnosCapacity[paralelo.turno] = (turnosCapacity[paralelo.turno] || 0) + cursosConHorario;

        return {
            id: paralelo.id,
            paralelo: paralelo.nombre,
            carrera: carrerasById.get(paralelo.carreraId) || 'Carrera no definida',
            periodo: paralelo.periodo.nombre,
            turno: paralelo.turno,
            gestion: gestionLabel,
            estado,
            cursosAsignados: cursosConHorario,
            cursosTotales: paralelo.periodo.asignaturasPlan.length,
            materiasOfertadas: cursos.length,
            materiasPlan: paralelo.periodo.asignaturasPlan.length,
            bloquesAsignados: cursosConHorario * 3,
            bloquesRequeridos: paralelo.periodo.asignaturasPlan.length * 3,
            conflictos,
        };
    });

    return {
        paralelosDashboard: dashboardRows,
        cursosIncompletos,
        turnosCapacity,
    };
};
