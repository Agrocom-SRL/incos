/**
 * Mapper: alertas de riesgo pedagógico (API → DTO de UI, módulo TUT).
 *
 * Fuente: vista 156 `vista_base_acompanamiento_riesgo_fila` (grano
 * estudiante×materia). El backend entrega camelCase; se normaliza
 * defensivamente y se arma el nombre institucional con buildFullName cuando
 * llegan campos sueltos.
 */

import { buildFullName } from '@application/utils/formatters';

const toNumber = (value, fallback = null) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const cleanText = (value) => {
  if (value == null) return null;
  const text = String(value).trim();
  return text === '' ? null : text;
};

const resolveEstudianteNombre = (raw) => {
  const armado = cleanText(raw?.estudianteNombre ?? raw?.estudianteNombreCompleto);
  if (armado) return armado;
  return (
    buildFullName(
      raw?.nombres ?? raw?.estudianteNombres,
      raw?.apellidoPaterno ?? raw?.estudianteApellidoPaterno,
      raw?.apellidoMaterno ?? raw?.estudianteApellidoMaterno,
    ) || 'Sin nombre'
  );
};

/** Fila de alerta (dataKey `alertasRiesgo` / `misAlumnosEnRiesgo`). */
export const mapAlertaRiesgo = (raw) => {
  if (!raw || typeof raw !== 'object') return null;
  return {
    /** Clave de fila y del participante de sesión (matriculas_materia). */
    matriculaMateriaId: raw.matriculaMateriaId ?? null,
    estudianteId: raw.estudianteId ?? null,
    estudianteNombre: resolveEstudianteNombre(raw),
    ci: cleanText(raw.ci ?? raw.numeroDocumento),
    carreraId: raw.carreraId ?? null,
    carreraCodigo: cleanText(raw.carreraCodigo),
    carreraNombre: cleanText(raw.carreraNombre),
    carreraColorHex: cleanText(raw.carreraColorHex ?? raw.colorHex),
    materiaId: raw.materiaId ?? null,
    materiaNombre: cleanText(raw.materiaNombre),
    paraleloLabel: cleanText(raw.paraleloNombre ?? raw.paraleloCodigo),
    anio: raw.anio ?? raw.cursoAnio ?? null,
    docenteNombre: cleanText(raw.docenteNombre),
    asignacionDocenteId: raw.asignacionDocenteId ?? null,
    ofertaCursoId: raw.ofertaCursoId ?? null,
    gestionId: raw.gestionId ?? null,
    bim1: toNumber(raw.bim1),
    bim2: toNumber(raw.bim2),
    bim3: toNumber(raw.bim3),
    bim4: toNumber(raw.bim4),
    promedioAnual: toNumber(raw.promedioAnual),
    notaUltimoBimestre: toNumber(raw.notaUltimoBimestre),
    umbralRiesgo: toNumber(raw.umbralRiesgo, 61),
    enRiesgo: raw.enRiesgo === 1 || raw.enRiesgo === true,
    matriculaEstado: cleanText(raw.matriculaEstado),
  };
};

/** Mapea el array de alertas (dataKey `alertasRiesgo` / `misAlumnosEnRiesgo`). */
export const mapAlertasRiesgoList = (rawList) =>
  Array.isArray(rawList) ? rawList.map(mapAlertaRiesgo).filter(Boolean) : [];

/**
 * Detalle por estudiante (A3, dataKey `alertaEstudiante`): cabecera del
 * estudiante + todas sus materias de la gestión (filas de la 156).
 */
export const mapAlertaEstudiante = (raw) => {
  if (!raw || typeof raw !== 'object') return null;
  const materias = mapAlertasRiesgoList(raw.materias ?? raw.filas ?? raw.alertas);
  const primera = materias[0] ?? mapAlertaRiesgo(raw);
  return {
    estudianteId: raw.estudianteId ?? primera?.estudianteId ?? null,
    estudianteNombre: resolveEstudianteNombre(raw) ?? primera?.estudianteNombre,
    ci: cleanText(raw.ci ?? raw.numeroDocumento) ?? primera?.ci,
    carreraNombre: cleanText(raw.carreraNombre) ?? primera?.carreraNombre,
    materias,
    materiasEnRiesgo: materias.filter((m) => m.enRiesgo).length,
  };
};
