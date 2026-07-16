/**
 * Mapper: inscripciones de capacitación (API → DTO de UI, módulo CAP).
 *
 * El backend ya deriva `estadoPago` (PENDIENTE/PARCIAL/PAGADO) y `saldo`
 * (InscripcionCapacitacionMapper) y arma `participanteNombreCompleto` en orden
 * canónico. Aquí se normaliza defensivamente y se derivan etiquetas de UI.
 */

import dayjs from 'dayjs';
import { buildFullName, buildCompleteCI } from '@application/utils/formatters';

const toNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const cleanText = (value) => {
  if (value == null) return null;
  const text = String(value).trim();
  return text === '' ? null : text;
};

const formatFecha = (value) => {
  if (!value) return null;
  const d = dayjs(value);
  return d.isValid() ? d.format('DD/MM/YYYY') : null;
};

/**
 * Mapea una fila del listado (o la base de la ficha).
 * @param {Object} raw
 * @returns {Object|null}
 */
export const mapInscripcionCapacitacion = (raw) => {
  if (!raw || typeof raw !== 'object') return null;

  const expedicion = cleanText(raw.participanteExpedicion)?.toUpperCase() ?? null;
  const fechaInicioLabel = formatFecha(raw.capacitacionFechaInicio);
  const fechaFinLabel = formatFecha(raw.capacitacionFechaFin);

  return {
    id: raw.id,
    fechaInscripcion: raw.fechaInscripcion ?? null,
    fechaInscripcionLabel: formatFecha(raw.fechaInscripcion),
    estado: raw.estado ?? null,
    activo: raw.activo !== false && raw.activo !== 0,
    // Participante
    participanteId: raw.participanteId ?? null,
    participanteCi: cleanText(raw.participanteCi),
    participanteExpedicion: expedicion,
    participanteCiCompleto: raw.participanteCi
      ? buildCompleteCI(raw.participanteCi, expedicion)
      : null,
    participanteNombreCompleto: buildFullName(
      raw.participanteNombres,
      raw.participanteApellidoPaterno,
      raw.participanteApellidoMaterno,
      raw.participanteNombreCompleto || 'Sin nombre',
    ),
    participanteCelular: cleanText(raw.participanteCelular),
    participanteEmail: cleanText(raw.participanteEmail),
    // Curso
    capacitacionId: raw.capacitacionId ?? null,
    capacitacionTitulo: cleanText(raw.capacitacionTitulo) || 'Sin curso',
    capacitacionEstado: raw.capacitacionEstado ?? null,
    capacitacionFechasLabel:
      fechaInicioLabel && fechaFinLabel
        ? `${fechaInicioLabel} – ${fechaFinLabel}`
        : fechaInicioLabel,
    // Pago (derivado por el backend)
    costo: toNumber(raw.costo),
    totalPagado: toNumber(raw.totalPagado),
    saldo: toNumber(raw.saldo),
    estadoPago: raw.estadoPago ?? null,
    pagosCount: toNumber(raw.pagosCount),
    createdAt: raw.createdAt ?? null,
  };
};

/** Mapea el array del listado (dataKey `inscripcionesCapacitacion`). */
export const mapInscripcionesCapacitacionList = (rawList) =>
  Array.isArray(rawList) ? rawList.map(mapInscripcionCapacitacion).filter(Boolean) : [];

/**
 * Mapea un pago del historial de la ficha.
 * @param {Object} raw
 * @returns {Object|null}
 */
const mapPagoCapacitacion = (raw) => {
  if (!raw || typeof raw !== 'object') return null;
  return {
    id: raw.id,
    monto: toNumber(raw.monto),
    fechaPago: raw.fechaPago ?? null,
    fechaPagoLabel: formatFecha(raw.fechaPago),
    numeroRecibo: cleanText(raw.numeroRecibo),
    observaciones: cleanText(raw.observaciones),
    metodoPagoId: raw.metodoPagoId ?? null,
    metodoPagoNombre: cleanText(raw.metodoPagoNombre),
    cuentaPagoId: raw.cuentaPagoId ?? null,
    cuentaLabel:
      [cleanText(raw.cuentaPagoTitular), cleanText(raw.cuentaPagoNumero)]
        .filter(Boolean)
        .join(' · ') || null,
    createdAt: raw.createdAt ?? null,
  };
};

/**
 * Mapea la ficha completa (dataKey `inscripcionCapacitacion`): base + pagos[].
 * @param {Object} raw
 * @returns {Object|null}
 */
export const mapInscripcionCapacitacionDetail = (raw) => {
  if (!raw || typeof raw !== 'object') return null;
  const base = mapInscripcionCapacitacion(raw);
  if (!base) return null;
  return {
    ...base,
    pagos: Array.isArray(raw.pagos) ? raw.pagos.map(mapPagoCapacitacion).filter(Boolean) : [],
  };
};

/**
 * Valores del formulario de pago → payload del backend
 * (`registerPagoCapacitacionValidator` / objeto anidado `pagoInicial`).
 * @param {Object} values - { monto, fechaPago, metodoPagoId, cuentaPagoId?, observaciones? }
 * @returns {Object}
 */
export const mapFormValuesToPagoPayload = (values = {}) => ({
  monto: Number(values.monto),
  metodoPagoId: Number(values.metodoPagoId),
  cuentaPagoId: values.cuentaPagoId != null ? Number(values.cuentaPagoId) : null,
  fechaPago: values.fechaPago ? dayjs(values.fechaPago).format('YYYY-MM-DD') : undefined,
  observaciones: (values.observaciones || '').trim() || null,
});
