/**
 * Registro de dependencias del recurso Tipos de Evaluación (catálogo maestro,
 * administración CFG — CRUD completo).
 *
 * Responsabilidades:
 * - Registrar Use Cases de escritura (Create/Update/GetById/Delete)
 * - Registrar Controllers de escritura
 * - Construir y registrar el router de administración `/api/v1/tipos-evaluacion`
 *
 * Principio SRP: Cada container maneja solo UN recurso/entidad
 *
 * NOTA: El repositorio (EvaluationTypeRepository / evaluationTypeRepository)
 * YA está registrado en repositories.container.js. El LISTAR reutiliza el
 * `ListTiposEvaluacionUseCase`/`ListTiposEvaluacionController` ya registrados
 * en `academico/calificaciones.container.js` (mismo catálogo, sin duplicar la
 * consulta) — aquí solo se consumen esos tokens, no se vuelven a crear.
 *
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor con recurso Tipos de Evaluación registrado
 */

import {
    ACADEMICO_TOKENS,
    CONFIGURACION_TOKENS,
    REPOSITORIOS_TOKENS,
    SERVICIOS_TOKENS,
} from '../../tokens/index.js';
import { registerComponent } from '../../utils/container.helpers.js';
import { CreateTipoEvaluacionUseCase } from '../../../../application/use-cases/configuracion/CreateTipoEvaluacionUseCase.js';
import { UpdateTipoEvaluacionUseCase } from '../../../../application/use-cases/configuracion/UpdateTipoEvaluacionUseCase.js';
import { GetTipoEvaluacionByIdUseCase } from '../../../../application/use-cases/configuracion/GetTipoEvaluacionByIdUseCase.js';
import { DeleteTipoEvaluacionUseCase } from '../../../../application/use-cases/configuracion/DeleteTipoEvaluacionUseCase.js';
import {
    CreateTipoEvaluacionController,
    UpdateTipoEvaluacionController,
    GetTipoEvaluacionByIdController,
    DeleteTipoEvaluacionController,
} from '../../../../presentation/controllers/configuracion/index.js';
import { buildTiposEvaluacionRouter } from '../../../../presentation/routes/tipos-evaluacion.routes.js';

/**
 * Registra el recurso Tipos de Evaluación (administración) en el contenedor
 *
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor actualizado
 */
export function registerTiposEvaluacionResource(container) {
    // ============================================
    // USE CASES (escritura)
    // ============================================
    registerComponent(
        container,
        CONFIGURACION_TOKENS.createTipoEvaluacionUseCase,
        (c) =>
            new CreateTipoEvaluacionUseCase({
                evaluationTypeRepository: c.resolve(REPOSITORIOS_TOKENS.evaluationTypeRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        CONFIGURACION_TOKENS.getTipoEvaluacionByIdUseCase,
        (c) =>
            new GetTipoEvaluacionByIdUseCase({
                evaluationTypeRepository: c.resolve(REPOSITORIOS_TOKENS.evaluationTypeRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        CONFIGURACION_TOKENS.updateTipoEvaluacionUseCase,
        (c) =>
            new UpdateTipoEvaluacionUseCase({
                evaluationTypeRepository: c.resolve(REPOSITORIOS_TOKENS.evaluationTypeRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    registerComponent(
        container,
        CONFIGURACION_TOKENS.deleteTipoEvaluacionUseCase,
        (c) =>
            new DeleteTipoEvaluacionUseCase({
                evaluationTypeRepository: c.resolve(REPOSITORIOS_TOKENS.evaluationTypeRepository),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
            })
    );

    // ============================================
    // CONTROLLERS (escritura)
    // ============================================
    registerComponent(
        container,
        CONFIGURACION_TOKENS.createTipoEvaluacionController,
        (c) =>
            new CreateTipoEvaluacionController({
                createTipoEvaluacionUseCase: c.resolve(
                    CONFIGURACION_TOKENS.createTipoEvaluacionUseCase
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        CONFIGURACION_TOKENS.getTipoEvaluacionByIdController,
        (c) =>
            new GetTipoEvaluacionByIdController({
                getTipoEvaluacionByIdUseCase: c.resolve(
                    CONFIGURACION_TOKENS.getTipoEvaluacionByIdUseCase
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        CONFIGURACION_TOKENS.updateTipoEvaluacionController,
        (c) =>
            new UpdateTipoEvaluacionController({
                updateTipoEvaluacionUseCase: c.resolve(
                    CONFIGURACION_TOKENS.updateTipoEvaluacionUseCase
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    registerComponent(
        container,
        CONFIGURACION_TOKENS.deleteTipoEvaluacionController,
        (c) =>
            new DeleteTipoEvaluacionController({
                deleteTipoEvaluacionUseCase: c.resolve(
                    CONFIGURACION_TOKENS.deleteTipoEvaluacionUseCase
                ),
                logger: c.resolve(SERVICIOS_TOKENS.logger),
                responseFormatter: c.resolve(SERVICIOS_TOKENS.responseFormatter),
            })
    );

    // ============================================
    // ROUTER
    // ============================================
    registerComponent(
        container,
        CONFIGURACION_TOKENS.tiposEvaluacionRouter,
        (c) => {
            const controllers = {
                // Reutiliza el listado ya registrado por calificaciones.container.js
                // (mismo catálogo tipos_evaluacion, distinto permiso de ruta).
                listTiposEvaluacionController: c.resolve(
                    ACADEMICO_TOKENS.listTiposEvaluacionController
                ),
                getTipoEvaluacionByIdController: c.resolve(
                    CONFIGURACION_TOKENS.getTipoEvaluacionByIdController
                ),
                createTipoEvaluacionController: c.resolve(
                    CONFIGURACION_TOKENS.createTipoEvaluacionController
                ),
                updateTipoEvaluacionController: c.resolve(
                    CONFIGURACION_TOKENS.updateTipoEvaluacionController
                ),
                deleteTipoEvaluacionController: c.resolve(
                    CONFIGURACION_TOKENS.deleteTipoEvaluacionController
                ),
            };

            const middlewares = {
                validateRequest: c.resolve(SERVICIOS_TOKENS.validateRequest),
            };

            return buildTiposEvaluacionRouter({ controllers, middlewares });
        }
    );

    return container;
}
