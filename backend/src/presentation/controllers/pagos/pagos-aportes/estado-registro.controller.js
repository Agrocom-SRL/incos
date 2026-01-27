/**
 * GET /api/v1/pagos-aportes/estado-registro
 * Controller para obtener el estado actual del aporte de un estudiante (para el formulario de registro de pago).
 *
 * Query: estudiante_id (requerido), gestion_id (opcional; si no se envía, se usa la gestión vigente).
 * Retorna: cabecera, total_pagado, cantidad_pagos, saldo_pendiente, cuotas, tiene_descuento_aplicado, gestion.
 */

export class GetEstadoAporteRegistroController {
    /**
     * @param {Object} params - Dependencias inyectadas
     * @param {GetEstadoAporteRegistroUseCase} params.getEstadoAporteRegistroUseCase - Caso de uso
     * @param {ILogger} params.logger - Logger
     * @param {ResponseFormatter} params.responseFormatter - Formatter de respuestas
     */
    constructor({ getEstadoAporteRegistroUseCase, logger, responseFormatter }) {
        this.getEstadoAporteRegistroUseCase = getEstadoAporteRegistroUseCase;
        this.logger = logger;
        this.responseFormatter = responseFormatter;
    }

    /**
     * @param {Object} req - Request (req.query: estudiante_id, gestion_id)
     * @param {Object} res - Response
     * @param {Function} next - Next middleware
     */
    async handle(req, res, next) {
        try {
            const estudianteId = req.query.estudiante_id != null ? parseInt(req.query.estudiante_id, 10) : null;
            const gestionId = req.query.gestion_id != null && req.query.gestion_id !== '' ? parseInt(req.query.gestion_id, 10) : null;

            if (!estudianteId || isNaN(estudianteId) || estudianteId < 1) {
                return res.status(400).json({
                    success: false,
                    error: { message: 'estudiante_id es requerido y debe ser un número válido mayor a 0', code: 'INVALID_ESTUDIANTE_ID' },
                });
            }

            this.logger.info('[Pagos] Obteniendo estado de aporte para registro', { estudianteId, gestionId });

            const estado = await this.getEstadoAporteRegistroUseCase.execute({
                studentId: estudianteId,
                managementId: gestionId,
            });

            return this.responseFormatter.retrieved(res, estado, 'estadoAporte', estudianteId, req);
        } catch (error) {
            this.logger.error('[Pagos] Error al obtener estado de aporte para registro', {
                error: error.message,
                stack: error.stack,
                query: req.query,
            });
            return next(error);
        }
    }
}
