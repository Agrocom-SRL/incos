/**
 * GET /api/v1/pagos-aportes/mis-aportes
 * Aportes (cabeceras pago_aporte) del estudiante de la sesión.
 *
 * El estudiante se resuelve en servidor desde req.usuario.id (evita IDOR). Cualquier
 * `estudiante_id` que llegue por query se IGNORA: se fuerza el resuelto.
 *
 * Reutiliza ListPagosAportesUseCase (mismo listado/vista que Finanzas) forzando el
 * filtro `estudiante_id`. Añade un `resumen` de saldo agregado de las cabeceras.
 */
import { resolveEstudianteIdForUsuario } from '../../../../application/utils/resolveEstudianteIdForUsuario.js';

export class MisAportesController {
  /**
   * @param {Object} params
   * @param {Object} params.listPagosAportesUseCase
   * @param {Object} params.studentRepository
   * @param {Object} params.userRepository
   * @param {Object} params.logger
   * @param {Object} params.responseFormatter
   */
  constructor({
    listPagosAportesUseCase,
    studentRepository,
    userRepository,
    logger,
    responseFormatter,
  }) {
    this.listPagosAportesUseCase = listPagosAportesUseCase;
    this.studentRepository = studentRepository;
    this.userRepository = userRepository;
    this.logger = logger;
    this.responseFormatter = responseFormatter;
  }

  async handle(req, res, next) {
    try {
      const usuarioId = req.usuario?.id;
      const estudianteId = await resolveEstudianteIdForUsuario({
        studentRepository: this.studentRepository,
        userRepository: this.userRepository,
        usuarioId,
      });

      const page = parseInt(req.query?.page, 10) || 1;
      const limit = parseInt(req.query?.limit, 10) || 50;

      this.logger.info('[Pagos] Mis aportes solicitado', { usuarioId, estudianteId, page, limit });

      // Forzar el filtro de estudiante: ignora cualquier estudiante_id del cliente.
      const result = await this.listPagosAportesUseCase.execute(
        {},
        page,
        limit,
        { estudiante_id: estudianteId }
      );

      const aportes = result.pagos ?? [];
      const resumen = this._buildResumen(aportes);

      return this.responseFormatter._success(
        res,
        { aportes, resumen },
        {
          message: 'Mis aportes obtenidos correctamente',
          pagination: {
            page: result.page,
            limit: result.limit,
            total: result.total,
            totalPages: result.totalPages,
          },
        },
        req
      );
    } catch (error) {
      this.logger.error('[Pagos] Error al obtener mis aportes', {
        error: error.message,
        stack: error.stack,
      });
      return next(error);
    }
  }

  /**
   * Resumen agregado de saldo a partir de las cabeceras del estudiante.
   * @private
   */
  _buildResumen(aportes) {
    let montoObligatorio = 0;
    let totalPagado = 0;
    let saldoPendiente = 0;
    for (const a of aportes) {
      montoObligatorio += Number(a.monto_obligatorio ?? 0) || 0;
      totalPagado += Number(a.total_pagado ?? 0) || 0;
      saldoPendiente += Number(a.saldo_pendiente ?? 0) || 0;
    }
    return {
      cantidadAportes: aportes.length,
      montoObligatorio,
      totalPagado,
      saldoPendiente,
    };
  }
}

export default MisAportesController;
