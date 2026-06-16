import { Op } from 'sequelize';
import { ISesionClaseRepository } from '../../domain/interfaces/repositories/ISesionClaseRepository.js';
import { SesionClase as SesionClaseModel } from '../database/models/sesion_clase.js';
import { ESTADOS_SESION_CLASE } from '../../domain/constants/asistencia.constants.js';

/**
 * Repositorio de escritura/lectura de `sesiones_clase` (arquetipo A).
 *
 * Una sesión = 1 curso × 1 fecha en que se tomó asistencia. Su existencia marca el
 * día tomado; su estado (ABIERTA/CERRADA) gobierna el cierre/reapertura del registro.
 *
 * @implements {ISesionClaseRepository}
 */
export class SesionClaseRepository extends ISesionClaseRepository {
  /**
   * Inserta o reactiva la sesión (UNIQUE asignacion+fecha+deleted_at). Idempotente.
   * Si existe una fila viva la reutiliza (actualiza periodo/horas/especial si llegan).
   *
   * @param {number} asignacionDocenteId
   * @param {string} fecha
   * @param {{ esEspecial?: boolean, motivo?: string|null, periodoAcademicoId?: number|null,
   *           horaInicio?: string|null, horaFin?: string|null }} datos
   * @param {number} usuarioId
   * @param {import('sequelize').Transaction} [transaction]
   * @returns {Promise<{ id: number, creada: boolean }>}
   */
  async upsertSesion(asignacionDocenteId, fecha, datos = {}, usuarioId = null, transaction = null) {
    const existente = await SesionClaseModel.findOne({
      where: {
        asignacionDocenteId,
        fecha,
        deletedAt: null,
      },
      transaction,
    });

    if (existente) {
      const cambios = {};
      if (datos.periodoAcademicoId != null && existente.periodoAcademicoId == null) {
        cambios.periodoAcademicoId = datos.periodoAcademicoId;
      }
      if (datos.esEspecial === true) {
        cambios.esEspecial = true;
        if (datos.motivo != null) cambios.motivo = datos.motivo;
      }
      if (datos.horaInicio != null) cambios.horaInicio = datos.horaInicio;
      if (datos.horaFin != null) cambios.horaFin = datos.horaFin;

      if (Object.keys(cambios).length > 0) {
        cambios.updatedBy = usuarioId;
        await existente.update(cambios, { transaction });
      }
      return { id: existente.id, creada: false };
    }

    const creada = await SesionClaseModel.create(
      {
        asignacionDocenteId,
        fecha,
        periodoAcademicoId: datos.periodoAcademicoId ?? null,
        horaInicio: datos.horaInicio ?? null,
        horaFin: datos.horaFin ?? null,
        esEspecial: datos.esEspecial === true,
        motivo: datos.esEspecial === true ? (datos.motivo ?? null) : null,
        estado: ESTADOS_SESION_CLASE.ABIERTA,
        createdBy: usuarioId,
        updatedBy: usuarioId,
      },
      { transaction },
    );

    return { id: creada.id, creada: true };
  }

  /**
   * Obtiene una sesión viva por asignación + fecha.
   * @returns {Promise<SesionClaseModel|null>}
   */
  async obtenerSesionPorFecha(asignacionDocenteId, fecha, transaction = null) {
    return SesionClaseModel.findOne({
      where: { asignacionDocenteId, fecha, deletedAt: null },
      transaction,
    });
  }

  /** @returns {Promise<number>} filas afectadas */
  async cerrarSesionesBimestre(asignacionDocenteId, periodoAcademicoId, usuarioId = null) {
    const [afectadas] = await SesionClaseModel.update(
      { estado: ESTADOS_SESION_CLASE.CERRADA, updatedBy: usuarioId },
      {
        where: {
          asignacionDocenteId,
          periodoAcademicoId,
          estado: ESTADOS_SESION_CLASE.ABIERTA,
          deletedAt: null,
        },
      },
    );
    return afectadas;
  }

  /** @returns {Promise<number>} filas afectadas */
  async reabrirSesionesBimestre(asignacionDocenteId, periodoAcademicoId, usuarioId = null) {
    const [afectadas] = await SesionClaseModel.update(
      { estado: ESTADOS_SESION_CLASE.ABIERTA, updatedBy: usuarioId },
      {
        where: {
          asignacionDocenteId,
          periodoAcademicoId,
          estado: ESTADOS_SESION_CLASE.CERRADA,
          deletedAt: null,
        },
      },
    );
    return afectadas;
  }

  /** @returns {Promise<Array<Object>>} */
  async listarSesionesCursoRango(asignacionDocenteId, desde, hasta) {
    const filas = await SesionClaseModel.findAll({
      where: {
        asignacionDocenteId,
        fecha: { [Op.between]: [desde, hasta] },
        deletedAt: null,
      },
      order: [['fecha', 'ASC']],
    });
    return filas.map((f) => f.get({ plain: true }));
  }

  /** @returns {Promise<Array<{ fecha: string, sesionEstado: string, esEspecial: boolean }>>} */
  async listarFechasTomadas(asignacionDocenteId, desde, hasta) {
    const filas = await SesionClaseModel.findAll({
      attributes: ['fecha', 'estado', 'esEspecial', 'motivo'],
      where: {
        asignacionDocenteId,
        fecha: { [Op.between]: [desde, hasta] },
        deletedAt: null,
      },
      order: [['fecha', 'ASC']],
    });
    return filas.map((f) => ({
      fecha: f.fecha,
      sesionEstado: f.estado,
      esEspecial: Boolean(f.esEspecial),
      motivo: f.motivo ?? null,
    }));
  }
}

export default SesionClaseRepository;
