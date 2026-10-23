import { ConflictError, NotFoundError, ValidationError } from '../../../../domain/errors/AppError.js';
import { TIPOS_HORARIO } from '../../../../domain/constants/cursos.constants.js';
import {
  parseIdOpcional,
  parseIdPositivo,
  parseNumero,
} from '../../../utils/validacionEntrada.js';

/** Tipos de horario que un grupo de capacitación puede usar como sesión. */
export const TIPOS_HORARIO_CAPACITACION = [TIPOS_HORARIO.CLASES, TIPOS_HORARIO.CAPACITACION];

const MAX_GRUPOS = 10;
const MAX_HORARIOS_POR_GRUPO = 20;
const MAX_NOMBRE_GRUPO = 60;

const esVacio = (valor) =>
  valor === undefined || valor === null || (typeof valor === 'string' && valor.trim() === '');

function normalizarHorariosGrupo(horarios, etiqueta) {
  if (horarios === undefined || horarios === null) return [];
  if (!Array.isArray(horarios)) {
    throw new ValidationError(`${etiqueta}.horarios debe ser un array de { horarioId }`);
  }
  if (horarios.length > MAX_HORARIOS_POR_GRUPO) {
    throw new ValidationError(`${etiqueta}.horarios no puede superar los ${MAX_HORARIOS_POR_GRUPO} elementos`);
  }
  const vistos = new Set();
  return horarios.map((item, index) => {
    const nombre = `${etiqueta}.horarios[${index}]`;
    if (item === null || typeof item !== 'object' || Array.isArray(item)) {
      throw new ValidationError(`${nombre} debe ser un objeto`);
    }
    const horarioId = parseIdPositivo(item.horarioId, `${nombre}.horarioId`);
    if (vistos.has(horarioId)) {
      throw new ValidationError(`${nombre}: el horario ${horarioId} está repetido dentro del grupo`);
    }
    vistos.add(horarioId);

    return { horarioId };
  });
}

/**
 * Valida y normaliza el array `grupos` de un curso. `undefined` devuelve `null`
 * (no tocar los grupos existentes); `null` equivale a "sin grupos".
 *
 * @param {*} grupos
 * @returns {Array<{id: number|null, nombre: string, cupoMaximo: number|null, costoMatricula: number|null, aulaId: number|null, orden: number,
 *   horarios: Array<{horarioId: number}>}>|null}
 */
export function normalizarGrupos(grupos) {
  if (grupos === undefined) return null;
  if (grupos === null) return [];
  if (!Array.isArray(grupos)) {
    throw new ValidationError('grupos debe ser un array de grupos del curso');
  }
  if (grupos.length > MAX_GRUPOS) {
    throw new ValidationError(`grupos no puede superar los ${MAX_GRUPOS} elementos`);
  }

  const idsVistos = new Set();
  return grupos.map((item, index) => {
    const etiqueta = `grupos[${index}]`;
    if (item === null || typeof item !== 'object' || Array.isArray(item)) {
      throw new ValidationError(`${etiqueta} debe ser un objeto`);
    }
    const id = parseIdOpcional(item.id, `${etiqueta}.id`);
    if (id !== null) {
      if (idsVistos.has(id)) throw new ValidationError(`${etiqueta}.id está repetido`);
      idsVistos.add(id);
    }
    if (typeof item.nombre !== 'string' || item.nombre.trim() === '') {
      throw new ValidationError(`${etiqueta}.nombre es requerido`);
    }
    const nombre = item.nombre.trim();
    if (nombre.length > MAX_NOMBRE_GRUPO) {
      throw new ValidationError(`${etiqueta}.nombre no debe superar los ${MAX_NOMBRE_GRUPO} caracteres`);
    }
    return {
      id,
      nombre,
      aulaId: parseIdOpcional(item.aulaId, `${etiqueta}.aulaId`),
      cupoMaximo: esVacio(item.cupoMaximo)
        ? null
        : parseNumero(item.cupoMaximo, `${etiqueta}.cupoMaximo`, { min: 1, entero: true }),
      costoMatricula: esVacio(item.costoMatricula)
        ? null
        : parseNumero(item.costoMatricula, `${etiqueta}.costoMatricula`, { min: 0 }),
      orden: esVacio(item.orden)
        ? index + 1
        : parseNumero(item.orden, `${etiqueta}.orden`, { min: 1, entero: true }),
      horarios: normalizarHorariosGrupo(item.horarios, etiqueta),
    };
  });
}

/**
 * Con el curso cobrando matrícula, cada grupo debe tener la suya (o heredar una matrícula
 * por defecto del curso mayor a 0); si no, el participante se inscribiría sin matrícula.
 *
 * @param {Object} params
 * @param {boolean} params.cobraMatricula - Interruptor final del curso
 * @param {number|null} params.costoMatriculaCurso - Matrícula por defecto del curso
 * @param {Array<Object>} params.grupos - Resultado de `normalizarGrupos`
 * @throws {ValidationError}
 */
export function validarMatriculaGrupos({ cobraMatricula, costoMatriculaCurso, grupos }) {
  if (!cobraMatricula || Number(costoMatriculaCurso) > 0) return;
  const sinPrecio = grupos.find((g) => g.costoMatricula === null);
  if (sinPrecio) {
    throw new ValidationError(
      `El grupo "${sinPrecio.nombre}" necesita su matrícula: el curso cobra matrícula`
    );
  }
}

/**
 * Valida que cada horario usado exista en el catálogo `horarios` y sea de un
 * tipo utilizable por capacitación (CLASES o CAPACITACION).
 *
 * @param {Object} scheduleRepository
 * @param {Array<Object>} grupos - Resultado de `normalizarGrupos`
 */
export async function validarHorariosGrupos(scheduleRepository, grupos) {
  const horarioIds = [...new Set(grupos.flatMap((g) => g.horarios.map((h) => h.horarioId)))];
  await Promise.all(
    horarioIds.map(async (horarioId) => {
      const horario = await scheduleRepository.findById(horarioId);
      if (!horario) throw new NotFoundError(`horario con ID ${horarioId}`);
      const tipo = horario.scheduleType;
      if (tipo && !TIPOS_HORARIO_CAPACITACION.includes(tipo)) {
        throw new ValidationError(
          `El horario ${horarioId} es de tipo ${tipo}; solo se admiten horarios de tipo ${TIPOS_HORARIO_CAPACITACION.join(' o ')}`
        );
      }
    })
  );
}

/**
 * Valida que cada aula indicada (opcional) exista en el catálogo `aulas`.
 *
 * @param {Object} classroomRepository
 * @param {Array<Object>} grupos - Resultado de `normalizarGrupos`
 */
export async function validarAulasGrupos(classroomRepository, grupos) {
  const aulaIds = [...new Set(grupos.map((g) => g.aulaId).filter((id) => id !== null))];
  await Promise.all(
    aulaIds.map(async (aulaId) => {
      const aula = await classroomRepository.findById(aulaId);
      if (!aula) throw new NotFoundError(`aula con ID ${aulaId}`);
    })
  );
}

/** Impide quitar grupos con inscripciones vigentes (409 con el detalle por grupo). */
async function asegurarGruposSinInscritos({ ausentes, inscripcionCapacitacionRepository, transaction }) {
  if (ausentes.length === 0) return;
  const conteos = await inscripcionCapacitacionRepository.countVigentesByGrupoIds(
    ausentes.map((g) => g.id),
    { transaction }
  );
  const conInscritos = ausentes
    .filter((g) => conteos[g.id] > 0)
    .map((g) => ({ grupoId: g.id, nombre: g.nombre, inscritos: conteos[g.id] }));
  if (conInscritos.length === 0) return;

  const nombres = conInscritos.map((g) => `"${g.nombre}" (${g.inscritos})`).join(', ');
  throw new ConflictError(
    `No se pueden quitar los grupos con inscripciones vigentes: ${nombres}. Retire o reasigne a los inscritos primero.`,
    conInscritos
  );
}

/** Sincroniza por diferencia los bloques de UN grupo conservando los ids existentes. */
async function sincronizarBloquesGrupo({
  bloqueCapacitacionRepository,
  capacitacionId,
  grupoId,
  horarios,
  existentes,
  userId,
  transaction,
}) {
  const porHorario = new Map(existentes.map((b) => [b.horarioId, b]));
  const deseados = new Set(horarios.map((h) => h.horarioId));

  const aBorrar = existentes.filter((b) => !deseados.has(b.horarioId)).map((b) => b.id);
  await bloqueCapacitacionRepository.softDeleteByIds(aBorrar, userId, { transaction });

  for (let index = 0; index < horarios.length; index += 1) {
    const { horarioId } = horarios[index];
    const ordenSecuencia = index + 1;
    const actual = porHorario.get(horarioId);
    if (!actual) {
      // eslint-disable-next-line no-await-in-loop
      await bloqueCapacitacionRepository.create(
        { capacitacionId, grupoId, horarioId, ordenSecuencia },
        userId,
        { transaction }
      );
    } else if (actual.ordenSecuencia !== ordenSecuencia) {
      // eslint-disable-next-line no-await-in-loop
      await bloqueCapacitacionRepository.update(actual.id, { ordenSecuencia }, userId, { transaction });
    }
  }
}

/**
 * Sincroniza los grupos de un curso y sus horarios por diferencia: conserva los
 * ids de grupos y bloques que siguen, crea los nuevos y da de baja los ausentes.
 * Quitar un grupo con inscripciones vigentes lanza ConflictError (409). Corre en
 * la transacción del caller.
 *
 * @param {Object} params
 * @param {Object} params.grupoCapacitacionRepository
 * @param {Object} params.bloqueCapacitacionRepository
 * @param {Object} params.inscripcionCapacitacionRepository
 * @param {number} params.capacitacionId
 * @param {Array<Object>} params.grupos - Resultado de `normalizarGrupos`
 * @param {number|null} params.userId
 * @param {Object} [params.transaction]
 * @returns {Promise<{grupos: Array<Object>, bloques: Array<Object>}>} Estado final vigente
 */
export async function sincronizarGrupos({
  grupoCapacitacionRepository,
  bloqueCapacitacionRepository,
  inscripcionCapacitacionRepository,
  capacitacionId,
  grupos,
  userId = null,
  transaction,
}) {
  const existentes = await grupoCapacitacionRepository.findByCapacitacionId(capacitacionId, {
    transaction,
  });
  const idsExistentes = new Set(existentes.map((g) => g.id));
  const desconocido = grupos.find((g) => g.id !== null && !idsExistentes.has(g.id));
  if (desconocido) {
    throw new NotFoundError(`grupo con ID ${desconocido.id} del curso ${capacitacionId}`);
  }

  const idsConservados = new Set(grupos.filter((g) => g.id !== null).map((g) => g.id));
  const ausentes = existentes.filter((g) => !idsConservados.has(g.id));
  await asegurarGruposSinInscritos({ ausentes, inscripcionCapacitacionRepository, transaction });

  const bloquesExistentes = await bloqueCapacitacionRepository.findByCapacitacionId(capacitacionId, {
    transaction,
  });

  for (const grupo of grupos) {
    const datos = {
      nombre: grupo.nombre,
      cupoMaximo: grupo.cupoMaximo,
      costoMatricula: grupo.costoMatricula,
      aulaId: grupo.aulaId,
      orden: grupo.orden,
    };
    // eslint-disable-next-line no-await-in-loop
    const persistido =
      grupo.id === null
        ? await grupoCapacitacionRepository.create({ capacitacionId, ...datos }, userId, { transaction })
        : await grupoCapacitacionRepository.update(grupo.id, datos, userId, { transaction });
    // eslint-disable-next-line no-await-in-loop
    await sincronizarBloquesGrupo({
      bloqueCapacitacionRepository,
      capacitacionId,
      grupoId: persistido.id,
      horarios: grupo.horarios,
      existentes: bloquesExistentes.filter((b) => b.grupoId === persistido.id),
      userId,
      transaction,
    });
  }

  const idsAusentes = ausentes.map((g) => g.id);
  await bloqueCapacitacionRepository.softDeleteByIds(
    bloquesExistentes.filter((b) => idsAusentes.includes(b.grupoId)).map((b) => b.id),
    userId,
    { transaction }
  );
  await grupoCapacitacionRepository.softDeleteByIds(idsAusentes, userId, { transaction });

  return {
    grupos: await grupoCapacitacionRepository.findByCapacitacionId(capacitacionId, { transaction }),
    bloques: await bloqueCapacitacionRepository.findByCapacitacionId(capacitacionId, { transaction }),
  };
}
