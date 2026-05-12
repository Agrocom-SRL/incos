import { useEffect, useMemo, useState } from 'react';
import { bloquesToCourseSchedules } from '@docentes/utils/asignacionCursoHorariosToGrid';
import docenteRepository from '@implementations/DocenteRepository';

function toMinutes(hhmm) {
  if (hhmm == null || hhmm === '') return null;
  const m = String(hhmm).match(/(\d{1,2}):(\d{2})/);
  if (!m) return null;
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
}

export const useDocentesAsignacionHorario = ({ cursoId, cursos, paraleloNombreParaHorario }) => {
  const [bloques, setBloques] = useState([]);
  const [horarioMeta, setHorarioMeta] = useState({
    cursoCodigo: null,
    cursoColorHex: null,
    materiaNombre: null,
    materiaSigla: null,
    carrera: null,
    docente: null,
  });
  const [loadingHorarios, setLoadingHorarios] = useState(false);
  const [errorHorarios, setErrorHorarios] = useState(null);

  useEffect(() => {
    const curso = cursoId ? cursos.find((c) => Number(c.id) === Number(cursoId)) : null;
    setHorarioMeta({
      cursoCodigo: curso?.codigo ?? null,
      cursoColorHex: curso?.colorHex ?? curso?.color_hex ?? null,
      materiaNombre: curso?.materiaNombre ?? curso?.materia ?? curso?.name ?? null,
      materiaSigla: curso?.materiaSigla ?? curso?.siglaMateria ?? curso?.sigla ?? null,
      carrera: curso?.carreraNombre ?? curso?.carrera ?? null,
      docente: curso?.docenteNombre ?? curso?.docente ?? null,
    });
  }, [cursoId, cursos]);

  useEffect(() => {
    if (!cursoId) {
      setBloques([]);
      setErrorHorarios(null);
      return undefined;
    }
    let cancelled = false;
    (async () => {
      setLoadingHorarios(true);
      setErrorHorarios(null);
      const res = await docenteRepository.obtenerHorariosCursoAsignacion(cursoId);
      if (cancelled) return;
      if (!res.success) {
        const msg = typeof res.error === 'string' ? res.error : res.error?.message || 'No se pudieron cargar los horarios';
        setErrorHorarios(msg);
        setBloques([]);
      } else {
        const payload = res.data && typeof res.data === 'object' ? res.data : {};
        setBloques(Array.isArray(payload.bloques) ? payload.bloques : []);
        setHorarioMeta((prev) => ({
          ...prev,
          cursoCodigo: payload.cursoCodigo ?? prev.cursoCodigo ?? null,
          cursoColorHex: payload.cursoColorHex ?? payload.curso_color_hex ?? prev.cursoColorHex ?? null,
        }));
      }
      setLoadingHorarios(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [cursoId]);

  const courseSchedulesDesdeBloques = useMemo(
    () =>
      bloquesToCourseSchedules(
        bloques,
        horarioMeta.cursoCodigo,
        paraleloNombreParaHorario,
        horarioMeta.cursoColorHex,
        horarioMeta.materiaNombre,
        horarioMeta.materiaSigla,
        horarioMeta.carrera,
        null,
        horarioMeta.docente,
      ),
    [bloques, horarioMeta.cursoCodigo, horarioMeta.cursoColorHex, horarioMeta.materiaNombre, horarioMeta.materiaSigla, horarioMeta.carrera, horarioMeta.docente, paraleloNombreParaHorario]
  );

  const cargaHorariaOpt = useMemo(() => {
    if (!cursoId) return null;
    const uniqueBlocks = new Map();
    for (const b of bloques || []) {
      const key = `${b.dia ?? ''}-${String(b.horaInicio ?? '')}-${String(b.horaFin ?? '')}-${String(
        b.ordenSecuencia ?? b.orden_secuencia ?? ''
      )}`;
      if (!uniqueBlocks.has(key)) uniqueBlocks.set(key, b);
    }
    if (!uniqueBlocks.size) return null;

    let totalMinutes = 0;
    for (const b of uniqueBlocks.values()) {
      const start = toMinutes(b.horaInicio);
      const end = toMinutes(b.horaFin);
      if (start != null && end != null && end > start) totalMinutes += end - start;
      else totalMinutes += 45;
    }
    const academicHours = Math.round(totalMinutes / 45);
    return academicHours > 0 ? academicHours : null;
  }, [bloques, cursoId]);

  return {
    loadingHorarios,
    errorHorarios,
    courseSchedulesDesdeBloques,
    cargaHorariaOpt,
  };
};

