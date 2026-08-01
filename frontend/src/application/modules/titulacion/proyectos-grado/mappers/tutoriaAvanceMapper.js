/**
 * Mapper: TutoriaAvance (API → DTO de UI, módulo TIT · Titulación, extensión
 * 2026-07-31).
 *
 * Espejo del mapper de aplicación del backend
 * (`application/mappers/titulacion/TutoriaAvanceMapper.js`): normaliza los 3
 * contratos nuevos, compartidos por los 3 requisitos:
 * - Requisito 1 (formulario de modalidad de graduación): estudiantes
 *   elegibles de 3er año (`estudiantesElegibles`, vista 178).
 * - Requisito 2 (reporte de avance por carrera): resumen agregado + detalle
 *   por proyecto (`avanceTutoriaCarrera`, vistas 179/160).
 * - Requisito 3 (planilla "10 en 10"): roster por bimestre
 *   (`planillaAvanceTercerAnio`, vista 181).
 *
 * Los nombres de personas ya llegan en orden institucional (APELLIDO_PATERNO
 * APELLIDO_MATERNO NOMBRES) desde el backend — no se reordenan aquí.
 */

import { mapProyectosGradoList } from './proyectoGradoMapper';

const cleanText = (value) => {
  if (value == null) return null;
  const text = String(value).trim();
  return text === '' ? null : text;
};

const toNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

/** Estudiante elegible (vista 178, Requisito 1) → DTO de UI. */
export const mapEstudianteElegible = (raw) => {
  if (!raw || raw.estudianteId == null) return null;
  return {
    estudianteId: raw.estudianteId,
    ci: cleanText(raw.ci),
    expedicion: cleanText(raw.expedicion),
    celular: cleanText(raw.celular),
    nombreCompleto: cleanText(raw.nombreCompleto) || `Estudiante ${raw.estudianteId}`,
    carreraId: raw.carreraId ?? null,
    carreraCodigo: cleanText(raw.carreraCodigo),
    carreraNombre: cleanText(raw.carreraNombre),
    gestionId: raw.gestionId ?? null,
    periodoNumero: raw.periodoNumero != null ? toNumber(raw.periodoNumero) : null,
  };
};

/** Lista de estudiantes elegibles (dataKey `estudiantesElegibles`). */
export const mapEstudiantesElegiblesList = (rawList) =>
  Array.isArray(rawList) ? rawList.map(mapEstudianteElegible).filter(Boolean) : [];

/** Fila de resumen por carrera (vista 179, Requisito 2) → DTO de UI. */
export const mapAvanceCarreraResumenItem = (raw) => {
  if (!raw) return null;
  return {
    gestionId: raw.gestionId ?? null,
    carreraId: raw.carreraId ?? null,
    carreraCodigo: cleanText(raw.carreraCodigo),
    carreraNombre: cleanText(raw.carreraNombre) || 'Sin carrera',
    totalProyectos: toNumber(raw.totalProyectos, 0),
    promedioAvance: raw.promedioAvance != null ? toNumber(raw.promedioAvance) : null,
    proyectosConObservacionesPendientes: toNumber(raw.proyectosConObservacionesPendientes, 0),
  };
};

/** Lista de resumen por carrera. */
export const mapAvanceCarreraResumenList = (rawList) =>
  Array.isArray(rawList) ? rawList.map(mapAvanceCarreraResumenItem).filter(Boolean) : [];

/** Reporte completo de avance de tutorías por carrera (dataKey `avanceTutoriaCarrera`). */
export const mapAvanceTutoriaCarrera = (raw) => {
  if (!raw) return null;
  return {
    gestionId: raw.gestionId ?? null,
    carreraId: raw.carreraId ?? null,
    resumenPorCarrera: mapAvanceCarreraResumenList(raw.resumenPorCarrera),
    detalle: mapProyectosGradoList(raw.detalle),
  };
};

/** Fila de la planilla de 3er año (vista 181, Requisito 3) → DTO de UI. */
export const mapPlanillaFila = (raw) => {
  if (!raw || raw.estudianteId == null) return null;
  return {
    estudianteId: raw.estudianteId,
    numeroOrden: raw.numeroOrden ?? null,
    ci: cleanText(raw.ci),
    expedicion: cleanText(raw.expedicion),
    nombreCompleto: cleanText(raw.nombreCompleto) || `Estudiante ${raw.estudianteId}`,
    carreraId: raw.carreraId ?? null,
    carreraNombre: cleanText(raw.carreraNombre),
    gestionId: raw.gestionId ?? null,
    proyectoGradoId: raw.proyectoGradoId ?? null,
    proyectoEstado: raw.proyectoEstado ?? null,
    tutorNombre: cleanText(raw.tutorNombre),
    bimestre: raw.bimestre != null ? toNumber(raw.bimestre) : null,
    totalTutoriasBimestre: toNumber(raw.totalTutoriasBimestre, 0),
    porcentajeAvance: raw.porcentajeAvance != null ? toNumber(raw.porcentajeAvance) : null,
    ultimaObservacion: cleanText(raw.ultimaObservacion),
    resultadoTutoria: raw.resultadoTutoria ?? 'EN_PROCESO',
  };
};

/** Planilla completa (dataKey `planillaAvanceTercerAnio`): cabecera + folios + firmas + tally. */
export const mapPlanillaAvanceTercerAnio = (raw) => {
  if (!raw) return null;
  const cabecera = raw.cabecera ?? {};
  const folios = Array.isArray(raw.folios)
    ? raw.folios.map((folio) =>
        Array.isArray(folio) ? folio.map(mapPlanillaFila).filter(Boolean) : [],
      )
    : [];
  const tally = raw.tally ?? {};
  return {
    cabecera: {
      carreraId: cabecera.carreraId ?? null,
      carreraNombre: cleanText(cabecera.carreraNombre),
      gestionId: cabecera.gestionId ?? null,
      gestionAnio: cabecera.gestionAnio ?? null,
      bimestre: cabecera.bimestre != null ? toNumber(cabecera.bimestre) : null,
    },
    folios,
    resumenTutores: Array.isArray(raw.resumenTutores) ? raw.resumenTutores.filter(Boolean) : [],
    tally: {
      aprobados: toNumber(tally.aprobados, 0),
      reprobados: toNumber(tally.reprobados, 0),
      abandonos: toNumber(tally.abandonos, 0),
      enProceso: toNumber(tally.enProceso, 0),
      total: toNumber(tally.total, 0),
    },
  };
};
