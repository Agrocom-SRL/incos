/**
 * Mapper: inscripciones de capacitación (API → DTO de UI, módulo CAP).
 *
 * El backend expone `estadoPago` (PARCIAL/CANCELADO, PERSISTIDO, no derivado)
 * y `saldo` (`montoObligatorio` snapshot − total pagado, calculado en
 * `InscripcionCapacitacionMapper` del backend) y arma
 * `participanteNombreCompleto` en orden canónico. Aquí se normaliza
 * defensivamente y se derivan etiquetas de UI.
 *
 * `pagoVencido` es un flag derivado EN EL FRONTEND (no confiar en
 * `compromisoEstado`): el backend marca el compromiso `INCUMPLIDO` de forma
 * perezosa al listar y, si ya quedó así antes de que el participante pagara,
 * se queda `INCUMPLIDO` para siempre aunque la deuda esté saldada. Por eso acá
 * se cruza SIEMPRE `estadoPago === 'PARCIAL'` (todavía debe, dato real) con la
 * fecha de compromiso vencida, sin mirar `compromisoEstado`.
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
    // Pago (persistido/calculado por el backend)
    costo: toNumber(raw.costo),
    montoObligatorio: toNumber(raw.montoObligatorio),
    totalPagado: toNumber(raw.totalPagado),
    saldo: toNumber(raw.saldo),
    estadoPago: raw.estadoPago ?? null,
    pagosCount: toNumber(raw.pagosCount),
    // Compromiso de pago (solo existe si la inscripción quedó con saldo parcial)
    compromisoId: raw.compromisoId ?? null,
    fechaCompromiso: raw.fechaCompromiso ?? null,
    fechaCompromisoLabel: formatFecha(raw.fechaCompromiso),
    compromisoEstado: raw.compromisoEstado ?? null,
    compromisoObservacion: cleanText(raw.compromisoObservacion),
    // Derivado en cliente: aún debe (estadoPago PARCIAL) Y ya venció la fecha
    // comprometida. No se basa en `compromisoEstado` (ver nota del mapper).
    pagoVencido:
      raw.estadoPago === 'PARCIAL' && !!raw.fechaCompromiso && dayjs(raw.fechaCompromiso).isBefore(dayjs(), 'day'),
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

/**
 * Valores del formulario del paso "Pago inicial" del wizard de inscripción →
 * payload `pagoInicial` (`createInscripcionCapacitacionValidator`). Extiende
 * `mapFormValuesToPagoPayload` con `fechaCompromiso`: solo se incluye cuando
 * el usuario la eligió (campo visible únicamente si el monto ingresado queda
 * por debajo del costo del curso — ver `PagoCapacitacionFormFields`). Nunca se
 * usa para el registro de una cuota posterior (`POST /:id/pagos` no acepta
 * `fechaCompromiso`, el compromiso ya existe o no aplica).
 * @param {Object} values - { monto, fechaPago, metodoPagoId, cuentaPagoId?, observaciones?, fechaCompromiso? }
 * @returns {Object}
 */
export const mapFormValuesToPagoInicialPayload = (values = {}) => {
  const base = mapFormValuesToPagoPayload(values);
  const fechaCompromiso = values.fechaCompromiso
    ? dayjs(values.fechaCompromiso).format('YYYY-MM-DD')
    : undefined;
  return fechaCompromiso ? { ...base, fechaCompromiso } : base;
};
