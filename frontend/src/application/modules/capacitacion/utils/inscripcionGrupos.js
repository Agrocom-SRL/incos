/**
 * Reglas de elección de grupo al inscribir (puras, probadas aparte):
 * un solo grupo se preselecciona; con dos o más la elección es obligatoria;
 * sin grupos no se pide (el curso aún es borrador o es virtual).
 */

/** Id del grupo a preseleccionar (único grupo) o `null`. */
export const resolverGrupoInicial = (grupos = []) =>
  grupos.length === 1 ? grupos[0].id : null;

/** Mensaje de error si falta elegir grupo (≥2 grupos y ninguno elegido), o `null`. */
export const validarGrupoElegido = (grupos = [], grupoId = null) =>
  grupos.length >= 2 && grupoId == null ? 'Elija el grupo al que se inscribe el participante' : null;

/**
 * Montos cobrados al inscribir según los interruptores del curso: un concepto
 * no cobrado vale 0 (no se ofrece ni se pide).
 * @returns {{MATRICULA: number, CURSO: number}}
 */
export const montosCobradosCurso = (curso) => ({
  MATRICULA: curso?.cobraMatricula ? Number(curso.costoMatricula) || 0 : 0,
  CURSO: curso?.tieneCosto ? Number(curso.costo) || 0 : 0,
});
