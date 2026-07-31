/**
 * Guards compartidos del sub-módulo de titulación (módulo TIT · titulación).
 *
 * Reglas de pertenencia y vigencia que comparten varios use cases:
 * - existencia del proyecto raíz,
 * - pertenencia del estudiante como integrante ACTIVO (anti-IDOR),
 * - "un estudiante solo puede tener UN proyecto vigente".
 */

import { ForbiddenError, NotFoundError, ConflictError } from '../../../../domain/errors/AppError.js';
import { ESTADOS_PROYECTO_GRADO_VIGENTES } from '../../../../domain/constants/titulacion.constants.js';

/**
 * Obtiene el proyecto de grado o lanza NotFoundError.
 *
 * @param {Object} proyectoGradoRepository
 * @param {number} proyectoGradoId
 * @returns {Promise<Object>}
 */
export async function getProyectoOrFail(proyectoGradoRepository, proyectoGradoId) {
  const proyecto = await proyectoGradoRepository.findById(proyectoGradoId);
  if (!proyecto) {
    throw new NotFoundError(`proyecto de grado con ID ${proyectoGradoId}`);
  }
  return proyecto;
}

/**
 * Verifica que el estudiante sea integrante ACTIVO del proyecto (guard de
 * pertenencia en servidor). Lanza ForbiddenError si no pertenece.
 *
 * @param {Object} params
 * @param {Object} params.integranteProyectoRepository
 * @param {number} params.proyectoGradoId
 * @param {number} params.estudianteId
 * @returns {Promise<Object>} Integrante vigente
 */
export async function assertIntegranteActivo({
  integranteProyectoRepository,
  proyectoGradoId,
  estudianteId,
}) {
  const integrante = await integranteProyectoRepository.findActivoByProyectoAndEstudiante(
    proyectoGradoId,
    estudianteId
  );
  if (!integrante) {
    throw new ForbiddenError('Usted no es integrante activo de este proyecto de grado.');
  }
  return integrante;
}

/**
 * Verifica que el estudiante NO tenga otro proyecto vigente (integrante ACTIVO
 * en un proyecto con estado vigente). Lanza ConflictError si ya tiene uno.
 *
 * @param {Object} params
 * @param {Object} params.integranteProyectoRepository
 * @param {Object} params.proyectoGradoRepository
 * @param {number} params.estudianteId
 * @param {number|null} [params.excludeProyectoGradoId] - Proyecto a excluir
 * @returns {Promise<void>}
 */
export async function assertEstudianteSinProyectoVigente({
  integranteProyectoRepository,
  proyectoGradoRepository,
  estudianteId,
  excludeProyectoGradoId = null,
}) {
  const membresias = await integranteProyectoRepository.findActivosByEstudianteId(estudianteId);
  for (const membresia of membresias) {
    const esProyectoExcluido =
      excludeProyectoGradoId !== null &&
      Number(membresia.proyectoGradoId) === Number(excludeProyectoGradoId);
    if (!esProyectoExcluido) {
      // eslint-disable-next-line no-await-in-loop
      const proyecto = await proyectoGradoRepository.findById(membresia.proyectoGradoId);
      if (proyecto && ESTADOS_PROYECTO_GRADO_VIGENTES.includes(proyecto.estado)) {
        throw new ConflictError(
          `El estudiante con ID ${estudianteId} ya es integrante activo de un proyecto de grado vigente (ID ${proyecto.id}).`
        );
      }
    }
  }
}
