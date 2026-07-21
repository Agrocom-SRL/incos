import { Op, literal } from 'sequelize';
import { BaseRepository } from './BaseRepository.js';
import { Participante as ParticipanteModel } from '../database/models/participante.js';

/**
 * Subquery escalar: título de la capacitación de la inscripción vigente más
 * reciente del participante (`NULL` si no tiene ninguna).
 * "Vigente" = mismo criterio que `ESTADOS_INSCRIPCION_CAPACITACION` /
 * `InscripcionCapacitacionRepository.findActivaByParticipanteAndCapacitacion`:
 * estado='INSCRITO' AND activo=TRUE AND deleted_at IS NULL.
 */
const CURSO_ACTUAL_TITULO_LITERAL = literal(`(
  SELECT c.titulo FROM capacitacion_inscritos ci
  INNER JOIN capacitaciones c ON c.id = ci.capacitacion_id AND c.deleted_at IS NULL
  WHERE ci.participante_id = \`Participante\`.\`id\`
    AND ci.estado = 'INSCRITO' AND ci.activo = TRUE AND ci.deleted_at IS NULL
  ORDER BY ci.fecha_inscripcion DESC LIMIT 1
)`);

/** Subquery escalar: id de la capacitación de la inscripción vigente más reciente (o `NULL`). */
const CURSO_ACTUAL_ID_LITERAL = literal(`(
  SELECT ci.capacitacion_id FROM capacitacion_inscritos ci
  WHERE ci.participante_id = \`Participante\`.\`id\`
    AND ci.estado = 'INSCRITO' AND ci.activo = TRUE AND ci.deleted_at IS NULL
  ORDER BY ci.fecha_inscripcion DESC LIMIT 1
)`);

/** Condición NOT EXISTS: participante sin ninguna inscripción vigente (mismo criterio de arriba). */
const SIN_INSCRIPCION_ACTIVA_LITERAL = literal(`NOT EXISTS (
  SELECT 1 FROM capacitacion_inscritos ci
  WHERE ci.participante_id = \`Participante\`.\`id\`
    AND ci.estado = 'INSCRITO' AND ci.activo = TRUE AND ci.deleted_at IS NULL
)`);

/**
 * Repositorio CRUD de participantes de capacitación (`participantes`).
 *
 * Arquetipo A: hereda de BaseRepository (Template Method) que implementa
 * IRepository. Sin Mapper/Entidad pesados: la entidad de dominio es un objeto
 * plano con claves del contrato (camelCase).
 *
 * La unicidad CI+expedición se valida en los use cases usando
 * findByCiExpedicion (sin UNIQUE en BD, mismo criterio que `estudiantes`).
 *
 * @implements {IParticipanteRepository}
 */
export class ParticipanteRepository extends BaseRepository {
  getModel() {
    return ParticipanteModel;
  }

  /**
   * Convierte el modelo Sequelize a objeto de dominio (claves del contrato).
   * @param {Object|null} model
   * @returns {Object|null}
   */
  toEntity(model) {
    if (!model) return null;
    const v = model.dataValues || model;
    return {
      id: v.id,
      ci: v.ci ?? null,
      expedicion: v.expedicion ?? null,
      nombres: v.nombres ?? null,
      apellidoPaterno: v.apellidoPaterno ?? null,
      apellidoMaterno: v.apellidoMaterno ?? null,
      celular: v.celular ?? null,
      email: v.email ?? null,
      activo: v.activo ?? null,
      createdAt: v.createdAt ?? null,
      updatedAt: v.updatedAt ?? null,
      // Calculados solo cuando la query los pide vía attributes.include (ver findAll()).
      cursoActualId: v.cursoActualId ?? null,
      cursoActualTitulo: v.cursoActualTitulo ?? null,
    };
  }

  buildWhereClause(filters) {
    const where = {};
    if (filters.ci !== undefined) {
      where.ci = filters.ci;
    }
    if (filters.expedicion !== undefined) {
      where.expedicion =
        filters.expedicion !== null && String(filters.expedicion).trim() !== ''
          ? String(filters.expedicion).trim().toUpperCase()
          : filters.expedicion;
    }
    if (filters.excludeId !== undefined && filters.excludeId !== null) {
      where.id = { [Op.ne]: Number(filters.excludeId) };
    }
    if (filters.sinInscripcionActiva === true) {
      where[Op.and] = [...(where[Op.and] || []), SIN_INSCRIPCION_ACTIVA_LITERAL];
    }
    return where;
  }

  /**
   * Listado/búsqueda de participantes (usado también para el paso 1 del
   * wizard de inscripción). Extiende `findAll` del `BaseRepository` para
   * agregar dos columnas calculadas (`cursoActualId`/`cursoActualTitulo`,
   * subqueries escalares) sin tener que reescribir el resto del listado.
   *
   * @param {Object} filters - Filtros de `buildWhereClause` + `search`/`sort`/`includeInactive`.
   * @param {boolean} [filters.sinInscripcionActiva] - Si es `true`, excluye participantes
   *   con alguna inscripción vigente en `capacitacion_inscritos`.
   * @param {number|null} page
   * @param {number|null} limit
   * @returns {Promise<Object>}
   */
  async findAll(filters = {}, page = null, limit = null) {
    const Model = this.getModel();
    const where = {
      ...this.buildWhereClause(filters),
    };

    if (!filters.includeInactive) {
      where.activo = true;
    }

    if (filters.search) {
      const searchFields = this.getSearchFields();
      where[Op.or] = searchFields.map((field) => ({
        [field]: { [Op.like]: `%${filters.search}%` },
      }));
    }

    const options = {
      where,
      order: filters.sort
        ? [[filters.sort.split(':')[0], filters.sort.includes(':') ? filters.sort.split(':')[1] : 'ASC']]
        : this._getEffectiveSort(),
      attributes: {
        include: [
          [CURSO_ACTUAL_TITULO_LITERAL, 'cursoActualTitulo'],
          [CURSO_ACTUAL_ID_LITERAL, 'cursoActualId'],
        ],
      },
    };

    if (filters.attributes && Array.isArray(filters.attributes) && filters.attributes.length > 0) {
      options.attributes = filters.attributes;
    }

    if (page && limit) {
      const offset = (page - 1) * limit;
      options.limit = limit;
      options.offset = offset;

      const { count, rows } = await Model.findAndCountAll(options);
      const collectionName = this.getCollectionName();
      return {
        [collectionName]: rows.map((model) => this.toEntity(model)),
        total: count,
        page,
        limit,
      };
    }

    const rows = await Model.findAll(options);
    const collectionName = this.getCollectionName();
    return {
      [collectionName]: rows.map((model) => this.toEntity(model)),
      total: rows.length,
    };
  }

  getSearchFields() {
    return ['ci', 'nombres', 'apellido_paterno', 'apellido_materno', 'celular'];
  }

  /**
   * Orden estándar de personas: APELLIDO_PATERNO APELLIDO_MATERNO NOMBRES.
   */
  getDefaultSort() {
    return [
      ['apellidoPaterno', 'ASC'],
      ['apellidoMaterno', 'ASC'],
      ['nombres', 'ASC'],
    ];
  }

  mapDataToModel(data) {
    const model = {};
    if ('ci' in data) model.ci = data.ci;
    if ('expedicion' in data) {
      model.expedicion =
        data.expedicion !== null && data.expedicion !== undefined && String(data.expedicion).trim() !== ''
          ? String(data.expedicion).trim().toUpperCase()
          : null;
    }
    if ('nombres' in data) model.nombres = data.nombres;
    if ('apellidoPaterno' in data) model.apellidoPaterno = data.apellidoPaterno ?? null;
    if ('apellidoMaterno' in data) model.apellidoMaterno = data.apellidoMaterno ?? null;
    if ('celular' in data) model.celular = data.celular;
    if ('email' in data) model.email = data.email ?? null;
    return model;
  }

  mapDataToUpdate(data) {
    const model = this.mapDataToModel(data);
    // Toggle de activo (reactivación desde edición)
    if ('activo' in data) model.activo = data.activo;
    if ('active' in data) model.activo = data.active;
    return model;
  }

  getCollectionName() {
    return 'participantes';
  }

  /**
   * Participante activo por CI + expedición (identidad de negocio).
   * `expedicion` null/'' matchea filas con expedicion NULL.
   *
   * @param {string} ci
   * @param {string|null} expedicion
   * @param {Object} options - { excludeId }
   * @returns {Promise<Object|null>}
   */
  async findByCiExpedicion(ci, expedicion, options = {}) {
    const expedicionNormalizada =
      expedicion !== null && expedicion !== undefined && String(expedicion).trim() !== ''
        ? String(expedicion).trim().toUpperCase()
        : null;

    return this.findBy({
      ci,
      expedicion: expedicionNormalizada,
      ...(options.excludeId ? { excludeId: options.excludeId } : {}),
    });
  }
}
