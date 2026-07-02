/**
 * Mappers del Historial académico (kardex/transcript FORM-SIE-ITT-04).
 *
 * El backend ya responde en camelCase según el contrato
 * (`docs/plan/HISTORIAL-ACADEMICO.md`), así que el mapper del documento es
 * defensivo (garantiza arrays y valores por defecto) y NO renombra `dataKey`.
 * El mapper de búsqueda sí normaliza al DTO estable de selección, resolviendo el
 * nombre completo en el orden canónico (APELLIDO_PATERNO APELLIDO_MATERNO NOMBRES)
 * con `buildFullName` — nunca concatenado a mano.
 */

import { buildFullName } from '@application/utils/formatters';

/**
 * Normaliza una fila de la búsqueda de estudiantes al DTO de selección.
 * @param {Object} row - Fila cruda de `GET /estudiantes/search`.
 * @returns {{ id: number, codigoEstudiante: string|null, ci: string|null, nombreCompleto: string }|null}
 */
export const mapEstudianteBusqueda = (row) => {
  if (!row || row.id == null) return null;
  return {
    id: row.id,
    codigoEstudiante: row.codigoEstudiante ?? null,
    ci: row.ci ?? null,
    nombreCompleto: buildFullName(
      row.nombres,
      row.apellidoPaterno,
      row.apellidoMaterno,
      row.nombreCompleto || 'Sin nombre',
    ),
  };
};

/**
 * Normaliza el documento de historial académico (cabecera + filas + resumen).
 * Mantiene los `dataKey` del contrato; solo asegura estructura y arrays.
 * @param {Object|null} data
 * @returns {{ estudiante: Object|null, filas: Object[], resumen: Object|null }|null}
 */
export const mapHistorialAcademico = (data) => {
  if (!data) return null;
  return {
    estudiante: data.estudiante ?? null,
    filas: Array.isArray(data.filas) ? data.filas : [],
    resumen: data.resumen ?? null,
  };
};

export default mapHistorialAcademico;
