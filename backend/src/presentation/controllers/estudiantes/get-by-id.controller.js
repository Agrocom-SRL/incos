import { logger } from '../../../infrastructure/config/logger.config.js';

/**
 * GET /api/v1/estudiantes/:id
 * Controller para obtener estudiante por ID
 */
export class GetStudentByIdController {
    constructor({ getStudentByIdUseCase }) {
        this.getStudentByIdUseCase = getStudentByIdUseCase;
    }

    async handle(req, res, next) {
        try {
            const { id } = req.params;

            logger.info('Request para obtener estudiante', { id });

            // TODO: Implementar GetStudentByIdUseCase
            res.status(501).json({
                success: false,
                message: 'Endpoint no implementado',
                endpoint: `GET /api/v1/estudiantes/${id}`,
                note: 'Pendiente: Implementar GetStudentByIdUseCase',
            });
        } catch (error) {
            next(error);
        }
    }
}