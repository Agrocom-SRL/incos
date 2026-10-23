import { NotFoundError, ValidationError } from '../../../../domain/errors/AppError.js';
import {
  MODALIDADES_CAPACITACION,
  MODALIDADES_CAPACITACION_VALUES,
} from '../../../../domain/constants/capacitacion.constants.js';
import {
  parseBooleano,
  parseFechaISO,
  parseIdOpcional,
  parseNumero,
} from '../../../utils/validacionEntrada.js';

/** Importe máximo que admite DECIMAL(10,2). */
const MONTO_MAXIMO = 99999999.99;
/** Tope razonable de requisitos por curso. */
const MAX_REQUISITOS = 50;

/**
 * ¿El curso es gratuito? Gratuito = ambos interruptores apagados (no se infiere
 * del monto: los montos valen 0 cuando su interruptor está apagado).
 *
 * @param {{tieneCosto?: boolean, cobraMatricula?: boolean}} curso
 * @returns {boolean}
 */
export function esCursoGratuito(curso) {
  return !curso?.tieneCosto && !curso?.cobraMatricula;
}

/**
 * ¿El costo del curso es EXTERNO? Un curso con entidad certificadora deposita su
 * costo a esa entidad: el sistema NO registra pagos de concepto CURSO; el instituto
 * solo cobra la matrícula y el depósito se acredita con un requisito.
 *
 * @param {string|{entidadCertificadora?: string|null}|null|undefined} cursoOEntidad
 * @returns {boolean}
 */
export function tienePagoCursoExterno(cursoOEntidad) {
  const entidad =
    cursoOEntidad !== null && typeof cursoOEntidad === 'object'
      ? cursoOEntidad.entidadCertificadora
      : cursoOEntidad;
  return typeof entidad === 'string' && entidad.trim() !== '';
}

/**
 * Resuelve un interruptor de costo y su monto. Con el interruptor activo el
 * monto es obligatorio y > 0 (en edición, si no se envía, conserva el actual);
 * con el interruptor apagado se ignora lo enviado y se guarda 0.
 *
 * @param {Object} params
 * @param {Object} params.body
 * @param {Object|null} params.existing - Curso actual (null en creación)
 * @param {Object} params.data - Datos de salida (se completa)
 * @param {string} params.flag - 'tieneCosto' | 'cobraMatricula'
 * @param {string} params.monto - 'costo' | 'costoMatricula'
 * @param {boolean} [params.montoOpcional=false] - Con el interruptor activo el monto puede ser 0
 *   o no enviarse (la matrícula la fija cada grupo; el del curso solo es el valor por defecto)
 */
function resolverCosto({ body, existing, data, flag, monto, montoOpcional = false }) {
  const esCreacion = existing === null;
  if (flag in body) data[flag] = parseBooleano(body[flag], flag);
  else if (esCreacion) data[flag] = false;
  const activo = flag in data ? data[flag] : Boolean(existing?.[flag]);

  if (!activo) {
    if (esCreacion || flag in body || monto in body) data[monto] = 0;
    return;
  }

  if (monto in body) {
    data[monto] = parseNumero(body[monto], monto, { min: montoOpcional ? 0 : 0.01, max: MONTO_MAXIMO });
    return;
  }
  if (montoOpcional) {
    if (esCreacion) data[monto] = 0;
    return;
  }
  const yaTeniaMonto = !esCreacion && Boolean(existing?.[flag]) && Number(existing?.[monto]) > 0;
  if (!yaTeniaMonto) {
    throw new ValidationError(`${monto} es obligatorio y debe ser mayor a 0 cuando ${flag} está activo`);
  }
}

const esVacio = (valor) =>
  valor === undefined || valor === null || (typeof valor === 'string' && valor.trim() === '');

/** Texto opcional: '' / null → null; recorta y valida la longitud máxima. */
function parseTextoOpcional(valor, nombre, max) {
  if (esVacio(valor)) return null;
  if (typeof valor !== 'string') throw new ValidationError(`${nombre} debe ser texto`);
  const texto = valor.trim();
  if (texto.length > max) {
    throw new ValidationError(`${nombre} no debe superar los ${max} caracteres`);
  }
  return texto;
}

/**
 * Valida y normaliza los campos de un curso. En modo creación exige título y
 * fechaInicio y aplica valores por defecto; en modo edición (`existing`)
 * incluye SOLO las claves presentes en el body y valida la coherencia de
 * fechas contra los valores finales.
 *
 * @param {Object} body
 * @param {Object|null} [existing] - Curso actual (modo edición)
 * @returns {Object} Datos listos para el repositorio
 */
export function construirDatosCurso(body = {}, existing = null) {
  const esCreacion = existing === null;
  const tiene = (clave) => clave in body;
  const data = {};

  if (esCreacion || tiene('titulo')) {
    if (typeof body.titulo !== 'string' || body.titulo.trim() === '') {
      throw new ValidationError(esCreacion ? 'titulo es requerido' : 'titulo no puede estar vacío');
    }
    const titulo = body.titulo.trim();
    if (titulo.length > 200) throw new ValidationError('titulo no debe superar los 200 caracteres');
    data.titulo = titulo;
  }

  if (esCreacion || tiene('descripcion')) {
    data.descripcion = esVacio(body.descripcion) ? null : String(body.descripcion);
  }

  resolverCosto({ body, existing, data, flag: 'tieneCosto', monto: 'costo' });
  resolverCosto({ body, existing, data, flag: 'cobraMatricula', monto: 'costoMatricula', montoOpcional: true });

  if (esCreacion || tiene('entidadCertificadora')) {
    data.entidadCertificadora = parseTextoOpcional(body.entidadCertificadora, 'entidadCertificadora', 150);
  }
  if (esCreacion || tiene('nivel')) data.nivel = parseTextoOpcional(body.nivel, 'nivel', 60);
  if (esCreacion || tiene('dirigidoA')) data.dirigidoA = parseTextoOpcional(body.dirigidoA, 'dirigidoA', 255);
  if (esCreacion || tiene('duracion')) data.duracion = parseTextoOpcional(body.duracion, 'duracion', 60);

  if (esCreacion || tiene('modalidad')) {
    if (esVacio(body.modalidad)) {
      if (!esCreacion) throw new ValidationError('modalidad no puede estar vacía');
      data.modalidad = MODALIDADES_CAPACITACION.PRESENCIAL;
    } else {
      const modalidad = String(body.modalidad).trim().toUpperCase();
      if (!MODALIDADES_CAPACITACION_VALUES.includes(modalidad)) {
        throw new ValidationError(
          `modalidad debe ser una de: ${MODALIDADES_CAPACITACION_VALUES.join(', ')}`
        );
      }
      data.modalidad = modalidad;
    }
  }

  if (esCreacion || tiene('cupoMaximo')) {
    data.cupoMaximo =
      esCreacion && esVacio(body.cupoMaximo)
        ? 30
        : parseNumero(body.cupoMaximo, 'cupoMaximo', { min: 1, entero: true });
  }

  if (esCreacion || tiene('fechaInicio')) {
    if (esVacio(body.fechaInicio)) throw new ValidationError('fechaInicio es requerida');
    data.fechaInicio = parseFechaISO(body.fechaInicio, 'fechaInicio');
  }
  // fechaFin es opcional (el curso puede definirse solo por `duracion`)
  if (esCreacion || tiene('fechaFin')) {
    data.fechaFin = esVacio(body.fechaFin) ? null : parseFechaISO(body.fechaFin, 'fechaFin');
  }

  if (tiene('activo')) data.activo = parseBooleano(body.activo, 'activo');

  // Coherencia de fechas con los valores finales (payload o existentes)
  const fechaInicio = 'fechaInicio' in data ? data.fechaInicio : existing?.fechaInicio;
  const fechaFin = 'fechaFin' in data ? data.fechaFin : existing?.fechaFin;
  if (fechaInicio && fechaFin && String(fechaFin).slice(0, 10) < String(fechaInicio).slice(0, 10)) {
    throw new ValidationError('fechaFin no puede ser anterior a fechaInicio');
  }

  return data;
}

/**
 * Valida y normaliza el array `requisitos` de un curso. `undefined` devuelve
 * `null` (no tocar los requisitos existentes).
 *
 * @param {*} requisitos
 * @returns {Array<{id: number|null, descripcion: string, obligatorio: boolean,
 *   acreditaPagoCurso: boolean, orden: number}>|null}
 */
export function normalizarRequisitos(requisitos) {
  if (requisitos === undefined) return null;
  if (requisitos === null) return [];
  if (!Array.isArray(requisitos)) {
    throw new ValidationError('requisitos debe ser un array de requisitos de inscripción');
  }
  if (requisitos.length > MAX_REQUISITOS) {
    throw new ValidationError(`requisitos no puede superar los ${MAX_REQUISITOS} elementos`);
  }

  const idsVistos = new Set();
  return requisitos.map((item, index) => {
    const etiqueta = `requisitos[${index}]`;
    if (item === null || typeof item !== 'object' || Array.isArray(item)) {
      throw new ValidationError(`${etiqueta} debe ser un objeto`);
    }
    const id = parseIdOpcional(item.id, `${etiqueta}.id`);
    if (id !== null) {
      if (idsVistos.has(id)) throw new ValidationError(`${etiqueta}.id está repetido`);
      idsVistos.add(id);
    }
    if (typeof item.descripcion !== 'string' || item.descripcion.trim() === '') {
      throw new ValidationError(`${etiqueta}.descripcion es requerida`);
    }
    const descripcion = item.descripcion.trim();
    if (descripcion.length > 255) {
      throw new ValidationError(`${etiqueta}.descripcion no debe superar los 255 caracteres`);
    }
    return {
      id,
      descripcion,
      obligatorio: esVacio(item.obligatorio)
        ? true
        : parseBooleano(item.obligatorio, `${etiqueta}.obligatorio`),
      acreditaPagoCurso: esVacio(item.acreditaPagoCurso)
        ? false
        : parseBooleano(item.acreditaPagoCurso, `${etiqueta}.acreditaPagoCurso`),
      orden: esVacio(item.orden)
        ? index + 1
        : parseNumero(item.orden, `${etiqueta}.orden`, { min: 1, entero: true }),
    };
  });
}

/**
 * Valida la regla del requisito que acredita el pago del curso: a lo sumo UNO por
 * curso y solo tiene sentido si el curso tiene entidad certificadora.
 *
 * @param {Array<{acreditaPagoCurso?: boolean}>} requisitos - Lista final de requisitos
 * @param {string|null|undefined} entidadCertificadora - Entidad final del curso
 * @throws {ValidationError}
 */
export function validarRequisitoAcreditaPago(requisitos, entidadCertificadora) {
  const acreditan = (requisitos ?? []).filter((r) => r.acreditaPagoCurso);
  if (acreditan.length === 0) return;
  if (acreditan.length > 1) {
    throw new ValidationError(
      'Solo un requisito del curso puede acreditar el pago del curso (acreditaPagoCurso)'
    );
  }
  if (!tienePagoCursoExterno(entidadCertificadora)) {
    throw new ValidationError(
      'acreditaPagoCurso solo aplica a cursos con entidad certificadora (el costo del curso se deposita a esa entidad)'
    );
  }
}

/**
 * Sincroniza los requisitos de un curso con la lista recibida: actualiza los
 * que traen `id`, crea los nuevos y da de baja lógica los ausentes. Corre en la
 * transacción del caller.
 *
 * @param {Object} params
 * @param {Object} params.capacitacionRequisitoRepository
 * @param {number} params.capacitacionId
 * @param {Array<Object>} params.requisitos - Resultado de `normalizarRequisitos`
 * @param {number|null} params.userId
 * @param {Object} [params.transaction]
 * @returns {Promise<Array<Object>>} Requisitos vigentes tras la sincronización
 */
export async function sincronizarRequisitos({
  capacitacionRequisitoRepository,
  capacitacionId,
  requisitos,
  userId = null,
  transaction,
}) {
  const existentes = await capacitacionRequisitoRepository.findByCapacitacionId(capacitacionId, {
    transaction,
  });
  const idsExistentes = new Set(existentes.map((r) => r.id));

  const idsConservados = new Set();
  for (const requisito of requisitos) {
    if (requisito.id !== null) {
      if (!idsExistentes.has(requisito.id)) {
        throw new NotFoundError(`requisito con ID ${requisito.id} del curso ${capacitacionId}`);
      }
      idsConservados.add(requisito.id);
      // eslint-disable-next-line no-await-in-loop
      await capacitacionRequisitoRepository.update(
        requisito.id,
        {
          descripcion: requisito.descripcion,
          obligatorio: requisito.obligatorio,
          acreditaPagoCurso: requisito.acreditaPagoCurso,
          orden: requisito.orden,
        },
        userId,
        { transaction }
      );
    } else {
      // eslint-disable-next-line no-await-in-loop
      await capacitacionRequisitoRepository.create(
        {
          capacitacionId,
          descripcion: requisito.descripcion,
          obligatorio: requisito.obligatorio,
          acreditaPagoCurso: requisito.acreditaPagoCurso,
          orden: requisito.orden,
        },
        userId,
        { transaction }
      );
    }
  }

  const ausentes = existentes.filter((r) => !idsConservados.has(r.id)).map((r) => r.id);
  await capacitacionRequisitoRepository.softDeleteByIds(ausentes, userId, { transaction });

  return capacitacionRequisitoRepository.findByCapacitacionId(capacitacionId, { transaction });
}
