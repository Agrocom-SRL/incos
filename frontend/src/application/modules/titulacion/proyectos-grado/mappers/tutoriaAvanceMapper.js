/**
 * Mapper: TutoriaAvance (API → DTO de UI, módulo TIT · Titulación).
 *
 * Espejo del mapper de aplicación del backend
 * (`application/mappers/titulacion/TutoriaAvanceMapper.js`): normaliza los
 * contratos de reportes de avance de tutoría (el Requisito 2 — reporte de
 * avance por carrera — ya no se consume como JSON en pantalla; solo exporta
 * PDF directo desde el listado, sin mapper de presentación):
 * - Requisito 1 (formulario de modalidad de graduación): estudiantes
 *   elegibles de 3er año (`estudiantesElegibles`, vista 178).
 * - Seguimiento de tutorías a docentes (extensión 2026-08-10): roster de
 *   tutoriados ACTIVOS agrupado por docente-tutor
 *   (`seguimientoTutoriaDocentes`, vistas 180/181). Reemplaza la "planilla de
 *   avance 10 en 10" de 3er año (Requisito 3 retirado: dependía de
 *   Matrícula/periodo_numero=3, sin datos en desarrollo, sin documento físico
 *   real).
 *
 * Los nombres de personas ya llegan en orden institucional (APELLIDO_PATERNO
 * APELLIDO_MATERNO NOMBRES) desde el backend — no se reordenan aquí.
 */

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

/** Un tutoriado dentro del bloque de su docente-tutor (roster, vistas 180/181). */
export const mapSeguimientoTutoriado = (raw) => {
  if (!raw || raw.estudianteId == null) return null;
  return {
    estudianteId: raw.estudianteId,
    ci: cleanText(raw.ci),
    nombreCompleto: cleanText(raw.nombreCompleto) || `Estudiante ${raw.estudianteId}`,
    proyectoGradoId: raw.proyectoGradoId ?? null,
    proyectoTitulo: cleanText(raw.proyectoTitulo),
    carreraNombre: cleanText(raw.carreraNombre),
    tutoriasEjecutadasMes: toNumber(raw.tutoriasEjecutadasMes, 0),
    porcentajeAvance: raw.porcentajeAvance != null ? toNumber(raw.porcentajeAvance) : null,
    ultimaActividad: cleanText(raw.ultimaActividad),
    ultimaObservacion: cleanText(raw.ultimaObservacion),
  };
};

/** Carrera distinta en la que tutora un docente (un docente puede tutorar en más de una). */
const mapSeguimientoDocenteCarrera = (raw) => {
  if (!raw || raw.carreraId == null) return null;
  return { carreraId: raw.carreraId, carreraNombre: cleanText(raw.carreraNombre) };
};

/** Bloque de UN docente-tutor con su roster de tutoriados y el agregado del mes. */
export const mapSeguimientoDocente = (raw) => {
  if (!raw || raw.docenteId == null) return null;
  return {
    docenteId: raw.docenteId,
    docenteNombre: cleanText(raw.docenteNombre) || `Docente ${raw.docenteId}`,
    carreras: Array.isArray(raw.carreras)
      ? raw.carreras.map(mapSeguimientoDocenteCarrera).filter(Boolean)
      : [],
    tutoriasEjecutadasMes: toNumber(raw.tutoriasEjecutadasMes, 0),
    tutoriados: Array.isArray(raw.tutoriados)
      ? raw.tutoriados.map(mapSeguimientoTutoriado).filter(Boolean)
      : [],
  };
};

/**
 * Reporte completo de seguimiento de tutorías a docentes (dataKey
 * `seguimientoTutoriaDocentes`): periodo resuelto por el servidor (mes/año
 * actual si no se filtró) + bloques por docente-tutor.
 */
export const mapSeguimientoTutoriaDocentes = (raw) => {
  if (!raw) return null;
  return {
    anio: raw.anio ?? null,
    mes: raw.mes ?? null,
    docentes: Array.isArray(raw.docentes) ? raw.docentes.map(mapSeguimientoDocente).filter(Boolean) : [],
  };
};
