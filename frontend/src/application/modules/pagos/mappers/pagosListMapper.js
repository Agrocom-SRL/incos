/**
 * Mapper: pagosListMapper
 *
 * Single Responsibility: Transformar datos del backend (vista_pago_aporte_listado) al formato necesario para la lista.
 *
 * Sincronizado con el backend ContributionPaymentMapper: cada ítem viene con estudiante { id, nombre, apellidoPaterno, apellidoMaterno, codigoEstudiante }
 * y gestion { id, nombre, anio }. Este mapper enriquece estudiante con nombreCompleto para la UI.
 *
 * Clean Architecture:
 * - Application Layer: Mapper que transforma datos del backend al formato de UI
 * - Usa utilidades compartidas (personFormatters) para construir campos compuestos
 *
 * @param {Object} pagoBackend - Un pago desde el backend (formato ContributionPaymentMapper)
 * @returns {Object|null} - Pago con estudiante.nombreCompleto listo para la lista
 */
import { buildFullName } from '@application/utils/formatters';

export const pagoListMapper = (pagoBackend) => {
  if (!pagoBackend) {
    return null;
  }

  const base = { ...pagoBackend };
  const estudiante = pagoBackend.estudiante || pagoBackend.student;

  if (estudiante && typeof estudiante === 'object') {
    base.estudiante = {
      ...estudiante,
      nombreCompleto: buildFullName(
        estudiante.nombre ?? estudiante.nombres,
        estudiante.apellidoPaterno,
        estudiante.apellidoMaterno,
        estudiante.codigoEstudiante || 'Sin nombre'
      ),
    };
  }

  return base;
};

/**
 * Mapea un array de pagos del backend al formato de lista (con estudiante.nombreCompleto).
 *
 * @param {Array} pagosBackend - Array de pagos desde el backend (result.data de obtenerTodosPagosAportes)
 * @returns {Array} - Array de pagos mapeados para la lista
 */
export const mapPagosList = (pagosBackend) => {
  if (!Array.isArray(pagosBackend)) {
    return [];
  }

  return pagosBackend.map(pagoListMapper).filter(Boolean);
};
