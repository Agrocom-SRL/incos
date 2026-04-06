/**
 * Punto de entrada del registro de módulos de dominio
 * 
 * Responsabilidades:
 * - Registrar módulos de dominio (estudiantes, configuración, geográficos, referencia)
 * 
 * Orden de registro (esta capa asume que infraestructura ya fue registrada):
 * 1. Módulos de dominio (dependen de repositorios y servicios)
 */

import { registerEstudiantesModule } from './estudiantes/index.js';
import { registerConfiguracionModule } from './configuracion/index.js';
import { registerAcademicoModule } from './academico/index.js';
import { registerGeograficosModule } from './geograficos/index.js';
import { registerReferenciaModule } from './referencia/index.js';
import { registerInscripcionesModule } from './inscripciones/index.js';
import { registerPagosModule } from './pagos/index.js';
import { registerAuthModule } from './auth/index.js';

/**
 * Registra todos los módulos de dominio en el contenedor
 * 
 * @param {Container} container - Contenedor de DI
 * @returns {Container} Contenedor con todos los módulos registrados
 */
export function registerAllModules(container) {
    registerAuthModule(container);

    // 1. Módulos de dominio (use cases + controllers + routers)
    // IMPORTANTE: Inscripciones debe registrarse antes de Estudiantes
    // porque GetStudentByIdUseCase depende de GetEnrollmentByIdUseCase
    registerInscripcionesModule(container);
    registerEstudiantesModule(container);
    registerConfiguracionModule(container);
    registerAcademicoModule(container);
    registerGeograficosModule(container);
    registerReferenciaModule(container);
    registerPagosModule(container);

    return container;
}