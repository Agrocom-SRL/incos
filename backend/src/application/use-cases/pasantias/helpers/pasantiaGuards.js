/**
 * Guards compartidos del módulo Pasantías (TUT · práctica laboral).
 *
 * Reglas de pertenencia y coherencia que comparten varios use cases:
 * - existencia del trámite raíz,
 * - pertenencia de informes/seguimientos a su trámite (anti-IDOR),
 * - coherencia camino ↔ tipo de informe (R.M. 487/2023),
 * - "un estudiante solo puede tener UN trámite vigente".
 */

import { NotFoundError, ValidationError, ConflictError } from '../../../../domain/errors/AppError.js';
import {
  ESTADOS_PASANTIA_VIGENTES,
  TIPO_INFORME_POR_TIPO_PASANTIA,
} from '../../../../domain/constants/pasantias.constants.js';

/**
 * Obtiene el trámite de pasantía o lanza NotFoundError.
 *
 * @param {Object} pasantiaRepository
 * @param {number} pasantiaId
 * @returns {Promise<Object>}
 */
export async function getPasantiaOrFail(pasantiaRepository, pasantiaId) {
  const pasantia = await pasantiaRepository.findById(pasantiaId);
  if (!pasantia) {
    throw new NotFoundError(`pasantía con ID ${pasantiaId}`);
  }
  return pasantia;
}

/**
 * Obtiene el informe verificando su pertenencia al trámite (anti-IDOR) o
 * lanza NotFoundError.
 *
 * @param {Object} pasantiaInformeRepository
 * @param {number} pasantiaId
 * @param {number} informeId
 * @returns {Promise<Object>}
 */
export async function getInformeOfPasantiaOrFail(pasantiaInformeRepository, pasantiaId, informeId) {
  const informe = await pasantiaInformeRepository.findById(informeId);
  if (!informe || Number(informe.pasantiaId) !== Number(pasantiaId)) {
    throw new NotFoundError(`informe con ID ${informeId} de la pasantía ${pasantiaId}`);
  }
  return informe;
}

/**
 * Obtiene el seguimiento verificando su pertenencia al trámite (anti-IDOR) o
 * lanza NotFoundError.
 *
 * @param {Object} pasantiaSeguimientoRepository
 * @param {number} pasantiaId
 * @param {number} seguimientoId
 * @returns {Promise<Object>}
 */
export async function getSeguimientoOfPasantiaOrFail(
  pasantiaSeguimientoRepository,
  pasantiaId,
  seguimientoId
) {
  const seguimiento = await pasantiaSeguimientoRepository.findById(seguimientoId);
  if (!seguimiento || Number(seguimiento.pasantiaId) !== Number(pasantiaId)) {
    throw new NotFoundError(`seguimiento con ID ${seguimientoId} de la pasantía ${pasantiaId}`);
  }
  return seguimiento;
}

/**
 * Verifica la coherencia camino ↔ tipo de informe:
 * VERIFICACION_EMPRESA solo en trámites PASANTIA; CONVALIDACION_TRABAJO solo
 * en trámites CONVALIDACION. Lanza ValidationError si no corresponde.
 *
 * @param {Object} pasantia - Entidad del trámite (con `tipo`)
 * @param {string} tipoInforme - Tipo de informe solicitado
 */
export function assertTipoInformeCoherente(pasantia, tipoInforme) {
  const tipoEsperado = TIPO_INFORME_POR_TIPO_PASANTIA[pasantia.tipo];
  if (tipoEsperado !== tipoInforme) {
    throw new ValidationError(
      `El informe ${tipoInforme} no corresponde a un trámite de tipo ${pasantia.tipo}. ` +
        `Para este trámite corresponde el informe ${tipoEsperado}.`
    );
  }
}

/**
 * Verifica que el estudiante NO tenga otro trámite de pasantía vigente
 * (SOLICITADA o EN_CURSO). Lanza ConflictError si ya tiene uno.
 *
 * @param {Object} params
 * @param {Object} params.pasantiaRepository
 * @param {number} params.estudianteId
 * @param {number|null} [params.excludePasantiaId] - Trámite a excluir (edición)
 * @returns {Promise<void>}
 */
export async function assertEstudianteSinPasantiaVigente({
  pasantiaRepository,
  estudianteId,
  excludePasantiaId = null,
}) {
  const result = await pasantiaRepository.findAll({ estudianteId });
  const tramites = result[pasantiaRepository.getCollectionName()] ?? [];
  for (const tramite of tramites) {
    const esExcluido =
      excludePasantiaId !== null && Number(tramite.id) === Number(excludePasantiaId);
    if (!esExcluido && ESTADOS_PASANTIA_VIGENTES.includes(tramite.estado)) {
      throw new ConflictError(
        `El estudiante con ID ${estudianteId} ya tiene un trámite de pasantía vigente (ID ${tramite.id}).`
      );
    }
  }
}
