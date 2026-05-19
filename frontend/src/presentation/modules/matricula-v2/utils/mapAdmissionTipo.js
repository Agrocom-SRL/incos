import { getAdmissionTypeTagStyle } from '../../estudiantes/config/admissionTypeColors';

/**
 * Mapea tipo de inscripción al key de admisión (misma lógica que matricula/tableColumns).
 * @param {string} [valor]
 * @returns {'NUEVO' | 'ANTIGUO' | 'TRASPASO' | 'TRANSITABILIDAD' | null}
 */
export function mapInscripcionTipoToAdmission(valor) {
  const v = String(valor || '').toUpperCase();
  if (v === 'NUEVO') return 'NUEVO';
  if (v === 'ANTIGUO') return 'ANTIGUO';
  if (v === 'TRASPASO') return 'TRASPASO';
  if (v === 'TRANSITABILIDAD') return 'TRANSITABILIDAD';
  return null;
}

/**
 * Normaliza el label mostrado para tipo de inscripción.
 * @param {string} [valor]
 */
export function normalizeInscripcionTipo(valor) {
  const key = mapInscripcionTipoToAdmission(valor);
  if (key) return key;
  const v = String(valor || '').toUpperCase();
  return v || 'ANTIGUO';
}

export { getAdmissionTypeTagStyle };
