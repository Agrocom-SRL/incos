/**
 * Validación de payload compartida entre CreatePasantiaUseCase y
 * UpdatePasantiaUseCase (módulo TUT · pasantías).
 *
 * Reglas de aplicación sobre el schema 24 (R.M. 487/2023):
 * - tipo ∈ {PASANTIA, CONVALIDACION} (requerido al crear),
 * - horasRequeridas entre 300 y 360,
 * - los campos de contrato (tipoContrato, tipoContratoDetalle) solo aplican
 *   al camino CONVALIDACION (en pasantía nueva van NULL).
 */

import { ValidationError } from '../../../../domain/errors/AppError.js';
import {
  HORAS_PASANTIA_MAX,
  HORAS_PASANTIA_MIN,
  TIPOS_PASANTIA,
  TIPOS_PASANTIA_VALUES,
} from '../../../../domain/constants/pasantias.constants.js';

/**
 * Valida el payload del trámite.
 *
 * @param {Object} data - Payload camelCase (create: completo; update: parcial)
 * @param {Object} [options]
 * @param {boolean} [options.partial=false] - true en update (campos opcionales)
 * @param {string|null} [options.tipoActual=null] - Tipo vigente del trámite
 *   (update): permite validar los campos de contrato aunque el payload no
 *   traiga `tipo`.
 */
export function validatePasantiaPayload(data, { partial = false, tipoActual = null } = {}) {
  if (!partial && !data.estudianteId) {
    throw new ValidationError('estudianteId es requerido');
  }
  if (!partial && !TIPOS_PASANTIA_VALUES.includes(data.tipo)) {
    throw new ValidationError('tipo de pasantía inválido');
  }
  if (partial && data.tipo !== undefined && !TIPOS_PASANTIA_VALUES.includes(data.tipo)) {
    throw new ValidationError('tipo de pasantía inválido');
  }

  if (data.horasRequeridas != null) {
    const horas = Number(data.horasRequeridas);
    if (horas < HORAS_PASANTIA_MIN || horas > HORAS_PASANTIA_MAX) {
      throw new ValidationError(
        `horasRequeridas debe estar entre ${HORAS_PASANTIA_MIN} y ${HORAS_PASANTIA_MAX}`
      );
    }
  }

  // Campos de contrato: solo el camino CONVALIDACION (certificado de trabajo).
  const tipoEfectivo = data.tipo ?? tipoActual;
  const traeCamposContrato = data.tipoContrato != null || data.tipoContratoDetalle != null;
  if (traeCamposContrato && tipoEfectivo !== TIPOS_PASANTIA.CONVALIDACION) {
    throw new ValidationError(
      'Los campos de contrato (tipoContrato, tipoContratoDetalle) solo corresponden a un trámite de tipo CONVALIDACION'
    );
  }
}
