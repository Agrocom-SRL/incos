/**
 * Helpers compartidos para el contrato de salida del objeto `compromiso`.
 *
 * Un único punto de verdad para la forma del compromiso que consumen el detalle
 * (`GetPaymentAporteByIdUseCase`), el listado (`ListPagosAportesUseCase`) y el
 * GET `/:pagoAporteId/compromiso` (`GetCompromisoByPagoAporteUseCase`).
 *
 * La lógica de `alerta`/`diasAtraso` replica la leyenda de estado del reporte de
 * cuentas por cobrar (`GetCuentasPorCobrarReporteUseCase._resolveEstado`/`_diffDays`):
 * VENCIDA si la fecha de compromiso ya pasó; PROXIMA si faltan <= DIAS_PROXIMA;
 * AL_DIA en otro caso.
 *
 * Contrato (camelCase) — `dataFieldName` coherente con el `dataKey` del frontend:
 *   {
 *     id,
 *     fechaCompromiso,  // 'YYYY-MM-DD'
 *     observacion,      // string | null
 *     estado,           // 'VIGENTE' | 'CUMPLIDO' | 'INCUMPLIDO'
 *     diasAtraso,       // entero; >0 = días vencido, <=0 = días que faltan, null si sin fecha
 *     alerta            // 'AL_DIA' | 'PROXIMA' | 'VENCIDA'
 *   } | null
 */

/** Umbral (días) para considerar un compromiso como PRÓXIMO a vencer. */
export const DIAS_PROXIMA = 3;

/** Fecha de hoy (servidor) normalizada a YYYY-MM-DD. */
export function todayStr() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Normaliza un valor de fecha (Date|string) a YYYY-MM-DD o null. */
export function toDateStr(value) {
  if (value == null || value === '') return null;
  if (value instanceof Date) {
    const y = value.getFullYear();
    const m = String(value.getMonth() + 1).padStart(2, '0');
    const d = String(value.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  const str = String(value).slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(str) ? str : null;
}

/** Días entre dos fechas YYYY-MM-DD: (a - b) en días enteros. */
export function diffDays(aStr, bStr) {
  const a = new Date(`${aStr}T00:00:00`);
  const b = new Date(`${bStr}T00:00:00`);
  const ms = a.getTime() - b.getTime();
  return Math.round(ms / 86400000);
}

/**
 * Resuelve la alerta de la planilla a partir de la fecha de compromiso.
 * (mismo criterio que `_resolveEstado` del reporte de cuentas por cobrar)
 *
 * @param {string|null} fechaCompromiso - YYYY-MM-DD
 * @param {string} [hoy] - YYYY-MM-DD (por defecto hoy del servidor)
 * @returns {'AL_DIA'|'PROXIMA'|'VENCIDA'}
 */
export function resolveAlerta(fechaCompromiso, hoy = todayStr()) {
  if (!fechaCompromiso) return 'AL_DIA';
  // diff positivo => fechaCompromiso ya pasó (vencida).
  const diff = diffDays(hoy, fechaCompromiso);
  if (diff > 0) return 'VENCIDA';
  const faltan = -diff;
  if (faltan <= DIAS_PROXIMA) return 'PROXIMA';
  return 'AL_DIA';
}

/**
 * Construye el objeto `compromiso` del contrato a partir de una entidad de
 * dominio del repositorio (`CompromisoPagoRepository.toEntity`) o null.
 *
 * @param {Object|null} entity - { id, fechaCompromiso, observacion, estado, ... }
 * @param {string} [hoy] - YYYY-MM-DD (por defecto hoy del servidor)
 * @returns {Object|null}
 */
export function buildCompromisoContract(entity, hoy = todayStr()) {
  if (!entity) return null;
  const fechaCompromiso = toDateStr(entity.fechaCompromiso);
  // diasAtraso: >0 = días vencido, <=0 = días que faltan; null si no hay fecha.
  const diasAtraso = fechaCompromiso != null ? diffDays(hoy, fechaCompromiso) : null;
  return {
    id: entity.id ?? null,
    fechaCompromiso,
    observacion: entity.observacion ?? null,
    estado: entity.estado ?? null,
    diasAtraso,
    alerta: resolveAlerta(fechaCompromiso, hoy),
  };
}
