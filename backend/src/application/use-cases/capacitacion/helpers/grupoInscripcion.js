/**
 * Resolución del GRUPO de una inscripción a capacitación (alta y edición).
 *
 * Reglas (una sola vez, compartidas por `CreateInscripcionCapacitacionUseCase` y
 * `UpdateInscripcionCapacitacionUseCase`): el participante elige un grupo de entre
 * los del curso. Es obligatorio con 2 o más grupos, se asigna solo si el curso
 * tiene uno y es null si no tiene; debe pertenecer al curso. Un grupo con
 * `cupoMaximo` propio bloquea (409) al alcanzarlo; sin cupo propio rige el cupo
 * informativo del curso.
 */

import { ConflictError, ValidationError } from '../../../../domain/errors/AppError.js';
import { parseIdOpcional } from '../../../utils/validacionEntrada.js';

/**
 * Un grupo con `cupoMaximo` propio bloquea al alcanzarlo.
 *
 * @param {Object} inscripcionCapacitacionRepository
 * @param {{id: number, nombre: string, cupoMaximo?: number|null}} grupo
 * @returns {Promise<Object>} El mismo grupo
 * @throws {ConflictError} 409 si el grupo está lleno
 */
export async function validarCupoGrupo(inscripcionCapacitacionRepository, grupo) {
  if (grupo.cupoMaximo === null || grupo.cupoMaximo === undefined) return grupo;
  const conteos = await inscripcionCapacitacionRepository.countVigentesByGrupoIds([grupo.id]);
  if (conteos[grupo.id] >= grupo.cupoMaximo) {
    throw new ConflictError(`El grupo "${grupo.nombre}" alcanzó su cupo máximo (${grupo.cupoMaximo})`);
  }
  return grupo;
}

/**
 * Resuelve el grupo elegido para una inscripción.
 *
 * @param {Object} params
 * @param {Object} params.grupoCapacitacionRepository
 * @param {Object} params.inscripcionCapacitacionRepository
 * @param {{id: number}} params.curso
 * @param {*} params.valor - `capacitacionGrupoId` recibido (puede venir vacío)
 * @param {number|null} [params.grupoActualId] - Grupo vigente de la inscripción (edición):
 *   si el elegido es el mismo no se vuelve a validar el cupo
 * @returns {Promise<Object|null>} Grupo resuelto o null (curso sin grupos)
 */
export async function resolverGrupoInscripcion({
  grupoCapacitacionRepository,
  inscripcionCapacitacionRepository,
  curso,
  valor,
  grupoActualId = null,
}) {
  const grupos = await grupoCapacitacionRepository.findByCapacitacionId(curso.id);
  const elegido = parseIdOpcional(valor, 'capacitacionGrupoId');
  const validar = (grupo) =>
    grupo.id === grupoActualId
      ? grupo
      : validarCupoGrupo(inscripcionCapacitacionRepository, grupo);

  if (grupos.length === 0) {
    if (elegido !== null) throw new ValidationError('El curso no tiene grupos');
    return null;
  }
  if (grupos.length === 1 && elegido === null) {
    return validar(grupos[0]);
  }
  if (elegido === null) {
    throw new ValidationError(
      `capacitacionGrupoId es requerido: el curso tiene ${grupos.length} grupos`
    );
  }
  const grupo = grupos.find((g) => g.id === elegido);
  if (!grupo) {
    throw new ValidationError('capacitacionGrupoId no pertenece a los grupos del curso');
  }
  return validar(grupo);
}
