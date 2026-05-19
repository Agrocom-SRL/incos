/**
 * Grilla semanal: materias con horario → courseSchedules y rangos de tiempo.
 */

import { useMemo } from 'react';
import {
  getSabadoArmadoGridRangeMinutes,
  getTurnoGridRangeMinutes,
} from '@application-institucional/horarios/utils/turnoGridRange';
import { normalizeAulaLabel } from '@application-inscripciones/utils/inscripcionDetailHelpers';

export const useMatriculaDetailSchedules = (subjectEnrollments, career) => {
  const materiasConHorario = useMemo(
    () =>
      (subjectEnrollments || []).filter(
        (materia) => Array.isArray(materia?.horarios) && materia.horarios.length > 0,
      ),
    [subjectEnrollments],
  );

  const gridRangeInscripcion = useMemo(() => {
    const turnos = [
      ...new Set(materiasConHorario.map((m) => m.paralelo?.turno ?? null).filter(Boolean)),
    ];
    if (turnos.length === 0) return getTurnoGridRangeMinutes(null);
    if (turnos.length === 1) return getTurnoGridRangeMinutes(turnos[0]);
    const ranges = turnos.map(getTurnoGridRangeMinutes);
    return {
      start: Math.min(...ranges.map((r) => r.start)),
      end: Math.max(...ranges.map((r) => r.end)),
    };
  }, [materiasConHorario]);

  const sabadoRangeInscripcion = useMemo(() => {
    const base = getSabadoArmadoGridRangeMinutes();
    const hasNoche = materiasConHorario.some((m) => {
      const t = String(m.paralelo?.turno || '').toUpperCase().trim();
      return t === 'NOCHE';
    });
    if (!hasNoche) return base;
    return { ...base, end: Math.max(base.end, 22 * 60) };
  }, [materiasConHorario]);

  const courseSchedules = useMemo(
    () =>
      materiasConHorario.map((materia) => ({
        cursoId: materia.courseId ?? materia.cursoId ?? materia.id ?? null,
        cursoCodigo:
          materia.courseCode ?? materia.cursoCodigo ?? materia.curso ?? materia.materiaSigla ?? '—',
        cursoColorHex: materia.colorHex ?? materia.color ?? null,
        materiaNombre: materia.materiaNombre ?? materia.name ?? 'Materia sin nombre',
        materiaSigla: materia.materiaSigla ?? materia.sigla ?? null,
        carrera: career?.nombre ?? null,
        paralelo:
          materia.paralelo?.nombre ?? materia.parallel?.nombre ?? materia.parallelName ?? null,
        turno: materia.paralelo?.turno ?? materia.parallel?.turno ?? materia.shift ?? null,
        docente: materia.docente?.nombreCompleto ?? null,
        bloques: (materia.horarios || [])
          .map((item, idx) => {
            const horario = item?.horario || item;
            if (!horario?.dia || !horario?.horaInicio) return null;
            return {
              cursoHorarioId: item?.id ?? `${materia.id || materia.materiaSigla || 'm'}-${idx}`,
              dia: horario.dia,
              horaInicio: horario.horaInicio,
              horaFin: horario.horaFin,
              aula: normalizeAulaLabel(item?.aula),
              orden: item?.ordenSecuencia ?? item?.orden ?? idx + 1,
            };
          })
          .filter(Boolean),
      })),
    [materiasConHorario, career],
  );

  return { courseSchedules, gridRangeInscripcion, sabadoRangeInscripcion };
};
