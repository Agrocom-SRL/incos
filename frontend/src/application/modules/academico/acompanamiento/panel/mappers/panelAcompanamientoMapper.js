/**
 * Mapper: panel de acompañamiento (API → DTO de UI, módulo TUT).
 *
 * Fuente A10: agregados de las vistas 157 (riesgo por carrera), 158
 * (reprobación por materia), 162 (resumen de sesiones) + top de casos
 * críticos de la 156. Se normaliza defensivamente: cada sección degrada a
 * lista vacía si el backend aún no la entrega.
 */

import { mapAlertasRiesgoList } from '@application-academico/acompanamiento/alertas/mappers/alertaRiesgoMapper';

const toNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const cleanText = (value) => {
  if (value == null) return null;
  const text = String(value).trim();
  return text === '' ? null : text;
};

/** Fila de riesgo por carrera (vista 157). */
const mapRiesgoCarrera = (raw) => {
  if (!raw || typeof raw !== 'object') return null;
  return {
    carreraId: raw.carreraId ?? null,
    carreraCodigo: cleanText(raw.carreraCodigo),
    carreraNombre: cleanText(raw.carreraNombre) || 'Sin carrera',
    totalEstudiantes: toNumber(raw.totalEstudiantes ?? raw.estudiantesTotal),
    estudiantesEnRiesgo: toNumber(raw.estudiantesEnRiesgo ?? raw.enRiesgoEstudiantes),
    totalMatriculas: toNumber(raw.totalMatriculas),
    matriculasEnRiesgo: toNumber(raw.matriculasEnRiesgo),
    pctEstudiantesRiesgo: toNumber(raw.pctEstudiantesRiesgo),
  };
};

/** Fila de reprobación por materia (vista 158). */
const mapReprobacionMateria = (raw) => {
  if (!raw || typeof raw !== 'object') return null;
  return {
    ofertaCursoId: raw.ofertaCursoId ?? null,
    carreraNombre: cleanText(raw.carreraNombre),
    carreraCodigo: cleanText(raw.carreraCodigo),
    materiaNombre: cleanText(raw.materiaNombre) || 'Sin materia',
    paraleloLabel: cleanText(raw.paraleloNombre ?? raw.paraleloCodigo),
    matriculados: toNumber(raw.matriculados),
    enRiesgo: toNumber(raw.enRiesgo),
    reprobados: toNumber(raw.reprobados),
    pctRiesgo: toNumber(raw.pctRiesgo),
    pctReprobacion: toNumber(raw.pctReprobacion),
  };
};

/** Fila del resumen de sesiones (vista 162). */
const mapSesionResumen = (raw) => {
  if (!raw || typeof raw !== 'object') return null;
  return {
    carreraNombre: cleanText(raw.carreraNombre),
    mes: cleanText(raw.mes) ?? raw.mes ?? null,
    programadas: toNumber(raw.programadas),
    realizadas: toNumber(raw.realizadas),
    participantes: toNumber(raw.participantes),
    asistencias: toNumber(raw.asistencias),
    pctAsistencia: toNumber(raw.pctAsistencia),
  };
};

/** Panel completo (dataKey `panelAcompanamiento`). */
export const mapPanelAcompanamiento = (raw) => {
  if (!raw || typeof raw !== 'object') return null;

  const porCarrera = Array.isArray(raw.riesgoPorCarrera ?? raw.porCarrera)
    ? (raw.riesgoPorCarrera ?? raw.porCarrera).map(mapRiesgoCarrera).filter(Boolean)
    : [];
  const porMateria = Array.isArray(raw.reprobacionPorMateria ?? raw.porMateria)
    ? (raw.reprobacionPorMateria ?? raw.porMateria).map(mapReprobacionMateria).filter(Boolean)
    : [];
  const sesionesResumen = Array.isArray(raw.sesionesResumen ?? raw.sesiones)
    ? (raw.sesionesResumen ?? raw.sesiones).map(mapSesionResumen).filter(Boolean)
    : [];
  const casosCriticos = mapAlertasRiesgoList(raw.casosCriticos ?? raw.topRiesgo);

  // KPIs derivados de las secciones (el backend puede además enviar `totales`).
  const totalEstudiantes = porCarrera.reduce((acc, c) => acc + c.totalEstudiantes, 0);
  const estudiantesEnRiesgo = porCarrera.reduce((acc, c) => acc + c.estudiantesEnRiesgo, 0);
  const sesionesProgramadas = sesionesResumen.reduce((acc, s) => acc + s.programadas, 0);
  const sesionesRealizadas = sesionesResumen.reduce((acc, s) => acc + s.realizadas, 0);
  const asistencias = sesionesResumen.reduce((acc, s) => acc + s.asistencias, 0);
  const participantes = sesionesResumen.reduce((acc, s) => acc + s.participantes, 0);

  return {
    gestionId: raw.gestionId ?? null,
    gestionLabel: cleanText(raw.gestionNombre ?? raw.gestionAnio),
    porCarrera,
    porMateria,
    sesionesResumen,
    casosCriticos,
    totales: {
      totalEstudiantes: toNumber(raw.totales?.totalEstudiantes, totalEstudiantes),
      estudiantesEnRiesgo: toNumber(raw.totales?.estudiantesEnRiesgo, estudiantesEnRiesgo),
      pctEstudiantesRiesgo: toNumber(
        raw.totales?.pctEstudiantesRiesgo,
        totalEstudiantes > 0 ? Math.round((estudiantesEnRiesgo / totalEstudiantes) * 100) : 0,
      ),
      sesionesProgramadas: toNumber(raw.totales?.sesionesProgramadas, sesionesProgramadas),
      sesionesRealizadas: toNumber(raw.totales?.sesionesRealizadas, sesionesRealizadas),
      pctAsistencia: toNumber(
        raw.totales?.pctAsistencia,
        participantes > 0 ? Math.round((asistencias / participantes) * 100) : 0,
      ),
    },
  };
};
