/**
 * Inicio del docente — resumen personal para la página `DocenteDashboard`.
 *
 * Consume `GET /dashboard/mi-resumen-docente` (identidad resuelta en servidor)
 * y expone datos ya en forma de vista: docente, gestión vigente, carga académica,
 * cursos asignados y bloques de horario agrupados para la grilla semanal
 * (`DocenteHorarioSemanalGrid`). SOLO LECTURA. Tolerante a fallos: si la fuente
 * falla, se devuelven valores vacíos + `error` para avisar sin romper la página.
 */

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@application-auth';
import DashboardRepository from '@infrastructure/repositories/DashboardRepository.js';
import { mapActividad } from './useDashboardData';

const ESTADO_INICIAL = {
  docente: { id: null, nombre: '' },
  gestion: { anio: null, nombre: null, bimestre: null, bimestreNombre: null },
  carga: { totalAsignaciones: 0, horasSemanales: 0 },
  cursos: [],
  horarioCursos: [],
  totalEstudiantes: 0,
  // Ampliación aditiva del mi-resumen-docente (mismo shape que el del estudiante).
  stats: { sesionesHoy: 0, sesionesMes: 0 },
  actividades: [],
};

/** Normaliza un curso asignado del resumen (campos pueden venir null). */
export const mapCursoDocente = (curso) => {
  if (!curso || typeof curso !== 'object') return null;
  const horasSemana = Number(curso.horasSemana ?? curso.horasSemanales ?? NaN);
  const bloques = Number(curso.bloques ?? curso.totalBloques ?? NaN);
  return {
    id: curso.id ?? null,
    materia: curso.materia || 'Materia sin nombre',
    materiaSigla: curso.materiaSigla || null,
    carrera: curso.carrera || null,
    // Color de negocio (hex de seeders): se sanitiza en presentación al pintarlo.
    carreraColor: curso.carreraColor || null,
    periodo: curso.periodo || null,
    paralelo: curso.paralelo || null,
    turno: curso.turno || null,
    estudiantes: Number(curso.estudiantes ?? 0),
    // Carga del curso (aditivo — puede no venir aún del backend): horas/bloques semanales.
    horasSemana: Number.isFinite(horasSemana) && horasSemana > 0 ? horasSemana : null,
    bloques: Number.isFinite(bloques) && bloques > 0 ? bloques : null,
  };
};

/**
 * Agrupa los bloques planos del resumen (`horarioBloques`) en el shape
 * `courseSchedules` que consume `DocenteHorarioSemanalGrid`:
 * `[{ cursoCodigo, cursoColorHex, materiaNombre, materiaSigla, paralelo, bloques }]`.
 * Clave de agrupación: materia + paralelo (un "curso" visual por combinación).
 */
export const mapHorarioBloquesToCourseSchedules = (horarioBloques) => {
  if (!Array.isArray(horarioBloques)) return [];
  const porCurso = new Map();
  for (const bloque of horarioBloques) {
    if (!bloque || typeof bloque !== 'object') continue;
    const sigla = bloque.materiaSigla || bloque.materia || 'Sin materia';
    const key = `${sigla}|${bloque.paralelo || ''}`;
    if (!porCurso.has(key)) {
      porCurso.set(key, {
        cursoCodigo: sigla,
        cursoColorHex: bloque.colorHex || null,
        materiaNombre: bloque.materia || null,
        materiaSigla: bloque.materiaSigla || null,
        paralelo: bloque.paralelo || null,
        bloques: [],
      });
    }
    porCurso.get(key).bloques.push({
      dia: bloque.dia,
      horaInicio: bloque.horaInicio,
      horaFin: bloque.horaFin,
      aula: bloque.aula || null,
    });
  }
  return [...porCurso.values()];
};

export const useDocenteHome = (enabled = true) => {
  const { usuario } = useAuth();
  const [data, setData] = useState(ESTADO_INICIAL);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);

  const fallbackNombre =
    usuario?.vinculo_perfil?.nombre_completo || usuario?.username || 'docente';

  const cargar = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);

    const res = await DashboardRepository.obtenerMiResumenDocente();

    if (res?.success && res.data) {
      const d = res.data;
      const cursos = Array.isArray(d.cursos) ? d.cursos.map(mapCursoDocente).filter(Boolean) : [];
      const s = d.stats || {};
      setData({
        docente: {
          id: d.docente?.id ?? null,
          nombre: d.docente?.nombre || fallbackNombre,
        },
        gestion: {
          anio: d.gestion?.anio ?? null,
          nombre: d.gestion?.nombre || null,
          bimestre: d.gestion?.bimestre ?? null,
          bimestreNombre: d.gestion?.bimestreNombre || null,
        },
        carga: {
          totalAsignaciones: Number(d.carga?.totalAsignaciones ?? cursos.length),
          horasSemanales: Number(d.carga?.horasSemanales ?? 0),
        },
        cursos,
        horarioCursos: mapHorarioBloquesToCourseSchedules(d.horarioBloques),
        totalEstudiantes: cursos.reduce((sum, c) => sum + c.estudiantes, 0),
        stats: {
          sesionesHoy: Number(s.sesionesHoy ?? 0),
          sesionesMes: Number(s.sesionesMes ?? 0),
        },
        // MISMO mapper que el resto de dashboards (shape backend snake_case).
        actividades: Array.isArray(d.actividades)
          ? d.actividades.map(mapActividad).filter(Boolean)
          : [],
      });
    } else {
      // Tolerancia a fallos: conservamos el nombre del usuario autenticado.
      setData({ ...ESTADO_INICIAL, docente: { id: null, nombre: fallbackNombre } });
      if (res?.error) {
        setError(typeof res.error === 'string' ? res.error : res.error?.message);
      }
    }

    setLoading(false);
  }, [fallbackNombre, enabled]);

  useEffect(() => {
    // Cuando está deshabilitado no se hace fetch (cargar() corta de inmediato) y el
    // estado inicial ya es vacío con loading=false, así que no hace falta resetear.
    if (!enabled) return undefined;
    let cancelled = false;
    (async () => {
      if (!cancelled) {
        await cargar();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [cargar, enabled]);

  return {
    docente: data.docente,
    gestion: data.gestion,
    carga: data.carga,
    cursos: data.cursos,
    horarioCursos: data.horarioCursos,
    totalEstudiantes: data.totalEstudiantes,
    stats: data.stats,
    actividades: data.actividades,
    loading,
    error,
    refetch: cargar,
  };
};

export default useDocenteHome;
