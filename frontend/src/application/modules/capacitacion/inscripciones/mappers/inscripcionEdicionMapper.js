/**
 * Mapper de edición (UI ↔ API) de inscripciones de capacitación (módulo CAP):
 * corregir la inscripción (`PUT /:id`), corregir un pago (`PUT /:id/pagos/:pagoId`)
 * y anular un pago (`POST /:id/pagos/:pagoId/anular`).
 *
 * Regla común: el payload lleva SOLO lo que cambió respecto del original (el
 * backend acepta cuerpos parciales). Un payload vacío `{}` significa «sin
 * cambios»: la UI no llama al backend.
 */

import dayjs from 'dayjs';

const FORMATO_FECHA_API = 'YYYY-MM-DD';

/** Texto recortado; vacío → null. */
const textoONull = (valor) => {
  const texto = valor == null ? '' : String(valor).trim();
  return texto === '' ? null : texto;
};

const mayusculasONull = (valor) => textoONull(valor)?.toUpperCase() ?? null;

/** Campos editables del participante: valor normalizado (como se guarda en BD). */
const CAMPOS_PARTICIPANTE = {
  ci: textoONull,
  expedicion: mayusculasONull,
  nombres: mayusculasONull,
  apellidoPaterno: mayusculasONull,
  apellidoMaterno: mayusculasONull,
  celular: textoONull,
  email: textoONull,
};

/** Participante de la inscripción mapeada → forma de los campos del formulario. */
const participanteOriginal = (inscripcion) => ({
  ci: inscripcion?.participanteCi ?? null,
  expedicion: inscripcion?.participanteExpedicion ?? null,
  nombres: inscripcion?.participanteNombres ?? null,
  apellidoPaterno: inscripcion?.participanteApellidoPaterno ?? null,
  apellidoMaterno: inscripcion?.participanteApellidoMaterno ?? null,
  celular: inscripcion?.participanteCelular ?? null,
  email: inscripcion?.participanteEmail ?? null,
});

/**
 * Valores iniciales del formulario «Editar inscripción»: participante +
 * grupo actual (`capacitacionGrupoId`).
 * @param {Object} inscripcion - ficha mapeada
 */
export const mapInscripcionToEditFormValues = (inscripcion) => {
  const p = participanteOriginal(inscripcion);
  return {
    ci: p.ci ?? '',
    expedicion: p.expedicion ?? undefined,
    nombres: p.nombres ?? '',
    apellidoPaterno: p.apellidoPaterno ?? '',
    apellidoMaterno: p.apellidoMaterno ?? '',
    celular: p.celular ?? '',
    email: p.email ?? '',
    capacitacionGrupoId: inscripcion?.capacitacionGrupoId ?? undefined,
  };
};

/**
 * Cuerpo de `PUT /inscripciones-capacitacion/:id`: solo los campos del
 * participante que cambiaron (anidados en `participante`) y el grupo si cambió.
 *
 * @param {Object} values - valores del formulario
 * @param {Object} inscripcion - ficha mapeada (original)
 * @param {Object} [options]
 * @param {boolean} [options.incluirGrupo=true] - false si el grupo no es editable
 * @returns {Object} `{}` si no hay cambios
 */
export const buildInscripcionUpdatePayload = (values = {}, inscripcion, { incluirGrupo = true } = {}) => {
  const original = participanteOriginal(inscripcion);
  const participante = {};
  Object.entries(CAMPOS_PARTICIPANTE).forEach(([campo, normalizar]) => {
    const nuevo = normalizar(values[campo]);
    if (nuevo !== normalizar(original[campo])) participante[campo] = nuevo;
  });

  const payload = {};
  if (Object.keys(participante).length > 0) payload.participante = participante;

  const grupoNuevo = values.capacitacionGrupoId;
  if (
    incluirGrupo &&
    grupoNuevo != null &&
    Number(grupoNuevo) !== Number(inscripcion?.capacitacionGrupoId ?? NaN)
  ) {
    payload.capacitacionGrupoId = Number(grupoNuevo);
  }
  return payload;
};

/** Pago mapeado → valores iniciales del formulario «Editar pago». */
export const mapPagoToEditFormValues = (pago) => ({
  concepto: pago?.concepto ?? undefined,
  monto: pago?.monto ?? undefined,
  fechaPago: pago?.fechaPago ? dayjs(pago.fechaPago) : dayjs(),
  metodoPagoId: pago?.metodoPagoId ?? undefined,
  cuentaPagoId: pago?.cuentaPagoId ?? undefined,
  observaciones: pago?.observaciones ?? '',
});

const aCentavos = (valor) => Math.round(Number(valor) * 100);

/**
 * Cuerpo de `PUT /inscripciones-capacitacion/:id/pagos/:pagoId`: solo los
 * campos que cambiaron. `cuentaPagoId: null` limpia la cuenta.
 *
 * @param {Object} values - valores del formulario (`fechaPago` dayjs)
 * @param {Object} pago - pago mapeado (original)
 * @returns {Object} `{}` si no hay cambios
 */
export const buildPagoUpdatePayload = (values = {}, pago) => {
  const payload = {};

  if (values.concepto && values.concepto !== pago?.concepto) payload.concepto = values.concepto;

  if (values.monto != null && aCentavos(values.monto) !== aCentavos(pago?.monto)) {
    payload.monto = Number(values.monto);
  }

  if (values.fechaPago) {
    const fechaNueva = dayjs(values.fechaPago).format(FORMATO_FECHA_API);
    const fechaOriginal = pago?.fechaPago ? dayjs(pago.fechaPago).format(FORMATO_FECHA_API) : null;
    if (fechaNueva !== fechaOriginal) payload.fechaPago = fechaNueva;
  }

  if (values.metodoPagoId != null && Number(values.metodoPagoId) !== Number(pago?.metodoPagoId)) {
    payload.metodoPagoId = Number(values.metodoPagoId);
  }

  const cuentaNueva = values.cuentaPagoId != null ? Number(values.cuentaPagoId) : null;
  const cuentaOriginal = pago?.cuentaPagoId != null ? Number(pago.cuentaPagoId) : null;
  if (cuentaNueva !== cuentaOriginal) payload.cuentaPagoId = cuentaNueva;

  const observacionesNuevas = textoONull(values.observaciones);
  if (observacionesNuevas !== (textoONull(pago?.observaciones) ?? null)) {
    payload.observaciones = observacionesNuevas;
  }

  return payload;
};

export const MOTIVO_ANULACION_MIN = 3;
export const MOTIVO_ANULACION_MAX = 500;

/** Motivo de anulación recortado (el backend exige 3 a 500 caracteres). */
export const normalizarMotivoAnulacion = (motivo) => String(motivo ?? '').trim();

/** Mensaje de error si el motivo no cumple 3-500 caracteres, o `null`. */
export const validarMotivoAnulacion = (motivo) => {
  const largo = normalizarMotivoAnulacion(motivo).length;
  if (largo < MOTIVO_ANULACION_MIN) {
    return `Indique el motivo de la anulación (mínimo ${MOTIVO_ANULACION_MIN} caracteres)`;
  }
  if (largo > MOTIVO_ANULACION_MAX) {
    return `El motivo no puede superar los ${MOTIVO_ANULACION_MAX} caracteres`;
  }
  return null;
};
