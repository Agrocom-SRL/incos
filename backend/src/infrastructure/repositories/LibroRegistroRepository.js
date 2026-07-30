import { BaseRepository } from './BaseRepository.js';
import { LibroRegistro as LibroRegistroModel } from '../database/models/libro_registro.js';
import { FolioLibro as FolioLibroModel } from '../database/models/folio_libro.js';
import { FolioEstudiante as FolioEstudianteModel } from '../database/models/folio_estudiante.js';
import { sequelize } from '../database/sequelize.js';
import { ESTADOS_FOLIO } from '../../domain/constants/libros.constants.js';

/** Modelo Sequelize (camelCase) → objeto plano; null-safe. */
const toPlain = (model) => {
  if (!model) return null;
  return model.get ? model.get({ plain: true }) : { ...(model.dataValues || model) };
};

/**
 * Repositorio de escritura del agregado Libros de registro (schema 25):
 * libros_registro (raíz, vía BaseRepository) + folios_libro + folio_estudiantes
 * (operaciones transaccionales propias).
 *
 * Arquetipo A: hereda de BaseRepository (Template Method). Las lecturas ricas
 * de listado/ficha viven en views/LibroRegistroViewRepository (vistas 175-177);
 * aquí el CRUD del libro y la persistencia transaccional de folios.
 *
 * @implements {ILibroRegistroRepository}
 */
export class LibroRegistroRepository extends BaseRepository {
  getModel() {
    return LibroRegistroModel;
  }

  toEntity(model) {
    const v = toPlain(model);
    if (!v) return null;
    return {
      id: v.id,
      numeroLibro: v.numeroLibro ?? null,
      carreraId: v.carreraId ?? null,
      gestionId: v.gestionId ?? null,
      codigoRegistro: v.codigoRegistro ?? null,
      folioInicial: v.folioInicial ?? null,
      folioActual: v.folioActual ?? null,
      folioFinal: v.folioFinal ?? null,
      estado: v.estado ?? null,
      fechaApertura: v.fechaApertura ?? null,
      fechaCierre: v.fechaCierre ?? null,
      observaciones: v.observaciones ?? null,
      activo: v.activo ?? null,
      createdAt: v.createdAt ?? null,
      updatedAt: v.updatedAt ?? null,
    };
  }

  buildWhereClause(filters = {}) {
    const where = {};
    if (filters.carreraId !== undefined) where.carreraId = filters.carreraId;
    if (filters.gestionId !== undefined) where.gestionId = filters.gestionId;
    if (filters.estado !== undefined) where.estado = filters.estado;
    if (filters.numeroLibro !== undefined) where.numeroLibro = filters.numeroLibro;
    return where;
  }

  getSearchFields() {
    return ['codigoRegistro', 'observaciones'];
  }

  getDefaultSort() {
    return [['gestionId', 'DESC'], ['numeroLibro', 'DESC']];
  }

  mapDataToModel(data) {
    const model = {};
    if ('numeroLibro' in data) model.numeroLibro = data.numeroLibro;
    if ('carreraId' in data) model.carreraId = data.carreraId ?? null;
    if ('gestionId' in data) model.gestionId = data.gestionId ?? null;
    if ('codigoRegistro' in data) model.codigoRegistro = data.codigoRegistro ?? null;
    if ('folioInicial' in data) model.folioInicial = data.folioInicial;
    if ('folioActual' in data) model.folioActual = data.folioActual;
    if ('folioFinal' in data) model.folioFinal = data.folioFinal ?? null;
    if ('estado' in data) model.estado = data.estado;
    if ('fechaApertura' in data) model.fechaApertura = data.fechaApertura ?? null;
    if ('fechaCierre' in data) model.fechaCierre = data.fechaCierre ?? null;
    if ('observaciones' in data) model.observaciones = data.observaciones ?? null;
    return model;
  }

  mapDataToUpdate(data) {
    return this.mapDataToModel(data);
  }

  getCollectionName() {
    return 'registryBooks';
  }

  /**
   * Libro de una carrera en una gestión (UNIQUE uk_carrera_gestion) o null.
   * @param {number} carreraId
   * @param {number} gestionId
   * @returns {Promise<Object|null>}
   */
  async findByCarreraGestion(carreraId, gestionId) {
    const model = await LibroRegistroModel.findOne({
      where: { carreraId, gestionId },
    });
    return this.toEntity(model);
  }

  /**
   * Máximo numero_folio de la GESTIÓN completa, cruzando TODAS las carreras
   * (los folios de la gestión se numeran de corrido entre libros: SIS-INF,
   * ADM-EMP y CON-GEN comparten el contador 1..N). Incluye ANULADOS: un número
   * de folio nunca se reutiliza. 0 si la gestión no tiene folios.
   *
   * @param {number} gestionId
   * @param {Object} [options] - { transaction?, lock? } (lectura FOR UPDATE
   *        dentro de la transacción de generación para evitar carreras).
   * @returns {Promise<number>}
   */
  async getMaxNumeroFolioByGestion(gestionId, options = {}) {
    const lockClause = options.lock ? 'FOR UPDATE' : '';
    const rows = await sequelize.query(
      `
      SELECT MAX(fl.numero_folio) AS max_folio
      FROM folios_libro fl
      INNER JOIN libros_registro lr
        ON lr.id = fl.libro_id
        AND lr.deleted_at IS NULL
      WHERE lr.gestion_id = ?
        AND fl.deleted_at IS NULL
        AND fl.activo = TRUE
      ${lockClause}
      `,
      {
        replacements: [gestionId],
        type: sequelize.QueryTypes.SELECT,
        transaction: options.transaction,
      },
    );
    const max = Number(rows[0]?.max_folio);
    return Number.isFinite(max) ? max : 0;
  }

  /**
   * Folios VIGENTES (activos, no eliminados y no ANULADOS) de un paralelo en un
   * libro — un paralelo con folios vigentes no admite regenerar (se anula antes).
   * @param {number} libroId
   * @param {number} paraleloGestionId
   * @returns {Promise<number>}
   */
  async countFoliosVigentesByParalelo(libroId, paraleloGestionId) {
    const rows = await sequelize.query(
      `
      SELECT COUNT(*) AS total
      FROM folios_libro fl
      WHERE fl.libro_id = ?
        AND fl.paralelo_gestion_id = ?
        AND fl.deleted_at IS NULL
        AND fl.activo = TRUE
        AND fl.estado <> ?
      `,
      {
        replacements: [libroId, paraleloGestionId, ESTADOS_FOLIO.ANULADO],
        type: sequelize.QueryTypes.SELECT,
      },
    );
    return Number(rows[0]?.total ?? 0);
  }

  /**
   * TRANSACCIONAL: asigna numero_folio y persiste los folios generados de un
   * paralelo con sus filas de estudiantes — todo o nada.
   *
   * numero_folio es correlativo POR GESTIÓN cruzando TODAS las carreras: el
   * próximo número se calcula DENTRO de la transacción como
   * MAX(numero_folio de la gestión) + 1 con lectura FOR UPDATE (evita colisión
   * si dos paralelos de distintas carreras generan casi a la vez). Si la
   * gestión aún no tiene folios, arranca en folioInicial (arranque histórico:
   * el libro 14 real empieza en 56 por lotes previos fuera del sistema).
   *
   * libros_registro.folio_actual se actualiza como dato INFORMATIVO del último
   * folio asentado en ESTE libro; la fuente de verdad del próximo número es
   * siempre el máximo de la gestión completa.
   *
   * @param {Object} params
   * @param {number} params.libroId
   * @param {number} params.gestionId - Gestión del libro (contador compartido).
   * @param {number} params.folioInicial - Arranque si la gestión no tiene folios.
   * @param {Array<Object>} params.folios - En orden de página: [{
   *        paraleloGestionId, ordenEnParalelo, estado, fechaRegistro,
   *        estudiantes: [{ numeroOrden, estudianteId, inscripcionId,
   *        estadoAcademico, observaciones }] }] (sin numeroFolio: se asigna aquí).
   * @param {number} [userId]
   * @returns {Promise<Array<Object>>} Folios creados (planos, con id y numeroFolio).
   */
  async crearFoliosConEstudiantes({ libroId, gestionId, folioInicial, folios }, userId = null) {
    return sequelize.transaction(async (t) => {
      const maxGestion = await this.getMaxNumeroFolioByGestion(gestionId, {
        transaction: t,
        lock: true,
      });
      const primerFolio = maxGestion > 0 ? maxGestion + 1 : Number(folioInicial ?? 1);

      const creados = [];

      for (let i = 0; i < folios.length; i += 1) {
        const folio = folios[i];
        // Secuencial a propósito: numeración correlativa y volumen acotado
        // (páginas de 10 estudiantes por paralelo).
        // eslint-disable-next-line no-await-in-loop
        const folioModel = await FolioLibroModel.create(
          {
            libroId,
            numeroFolio: primerFolio + i,
            paraleloGestionId: folio.paraleloGestionId,
            ordenEnParalelo: folio.ordenEnParalelo,
            estado: folio.estado,
            fechaRegistro: folio.fechaRegistro ?? null,
            activo: true,
            createdBy: userId,
          },
          { transaction: t },
        );

        const filas = (folio.estudiantes ?? []).map((est) => ({
          folioId: folioModel.id,
          numeroOrden: est.numeroOrden,
          estudianteId: est.estudianteId ?? null,
          inscripcionId: est.inscripcionId ?? null,
          estadoAcademico: est.estadoAcademico ?? null,
          observaciones: est.observaciones ?? null,
          activo: true,
          createdBy: userId,
        }));
        // eslint-disable-next-line no-await-in-loop
        await FolioEstudianteModel.bulkCreate(filas, { transaction: t });

        creados.push({ ...toPlain(folioModel), totalEstudiantes: filas.length });
      }

      await LibroRegistroModel.update(
        { folioActual: primerFolio + folios.length - 1, updatedBy: userId },
        { where: { id: libroId }, transaction: t },
      );

      return creados;
    });
  }

  /**
   * Un folio por id (fila plana de folios_libro) o null.
   * @param {number} folioId
   * @returns {Promise<Object|null>}
   */
  async findFolioById(folioId) {
    const model = await FolioLibroModel.findByPk(folioId);
    return toPlain(model);
  }

  /**
   * Actualiza campos de un folio (estado, fecha_registro, observaciones).
   * @param {number} folioId
   * @param {Object} data - { estado?, fechaRegistro?, observaciones? }
   * @param {number} [userId]
   * @returns {Promise<Object|null>} Folio actualizado (plano).
   */
  async updateFolio(folioId, data, userId = null) {
    const updateData = { updatedBy: userId };
    if ('estado' in data) updateData.estado = data.estado;
    if ('fechaRegistro' in data) updateData.fechaRegistro = data.fechaRegistro ?? null;
    if ('observaciones' in data) updateData.observaciones = data.observaciones ?? null;

    await FolioLibroModel.update(updateData, { where: { id: folioId } });
    return this.findFolioById(folioId);
  }

  /**
   * Nómina congelada de un folio con los datos del estudiante resueltos por JOIN
   * (orden institucional APELLIDO_PATERNO APELLIDO_MATERNO NOMBRES ya materializado
   * en numero_orden). Raw query sobre tablas base (patrón LicenseRepository).
   *
   * @param {number} folioId
   * @returns {Promise<Array<Object>>} filas: id, folio_id, numero_orden,
   *   estudiante_id, inscripcion_id, codigo_estudiante, ci, expedicion,
   *   apellido_paterno, apellido_materno, nombres, nombre_completo,
   *   estado_academico, observaciones.
   */
  async listarEstudiantesFolio(folioId) {
    return sequelize.query(
      `
      SELECT
        fe.id,
        fe.folio_id,
        fe.numero_orden,
        fe.estudiante_id,
        fe.inscripcion_id,
        est.codigo_estudiante,
        est.ci,
        est.expedicion,
        est.apellido_paterno,
        est.apellido_materno,
        est.nombres,
        TRIM(CONCAT_WS(' ', est.apellido_paterno, est.apellido_materno, est.nombres)) AS nombre_completo,
        fe.estado_academico,
        fe.observaciones
      FROM folio_estudiantes fe
      LEFT JOIN estudiantes est
        ON est.id = fe.estudiante_id
        AND est.deleted_at IS NULL
      WHERE fe.folio_id = ?
        AND fe.deleted_at IS NULL
        AND fe.activo = TRUE
      ORDER BY fe.numero_orden ASC
      `,
      { replacements: [folioId], type: sequelize.QueryTypes.SELECT },
    );
  }

  /**
   * Una fila de folio_estudiantes por id (plana) o null.
   * @param {number} filaId
   * @returns {Promise<Object|null>}
   */
  async findFolioEstudianteById(filaId) {
    const model = await FolioEstudianteModel.findByPk(filaId);
    return toPlain(model);
  }

  /**
   * Actualiza la fila de un estudiante en el folio (ESTADO/OBSERVACIONES).
   * @param {number} filaId
   * @param {Object} data - { estadoAcademico?, observaciones? }
   * @param {number} [userId]
   * @returns {Promise<Object|null>} Fila actualizada (plana).
   */
  async updateFolioEstudiante(filaId, data, userId = null) {
    const updateData = { updatedBy: userId };
    if ('estadoAcademico' in data) updateData.estadoAcademico = data.estadoAcademico ?? null;
    if ('observaciones' in data) updateData.observaciones = data.observaciones ?? null;

    await FolioEstudianteModel.update(updateData, { where: { id: filaId } });
    return this.findFolioEstudianteById(filaId);
  }
}

export default LibroRegistroRepository;
