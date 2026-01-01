/**
 * Validadores del módulo de Configuración
 * Organizados por actividad/endpoint
 *
 * Estructura:
 * - list.validator.js - Listar recursos (GET /carreras, GET /materias, GET /discapacidad)
 * - create.validator.js - Crear recursos (POST /carreras, POST /materias, POST /discapacidad)
 * - getById.validator.js - Obtener por ID (GET /carreras/:id, GET /materias/:id, GET /discapacidad/:id)
 * - update.validator.js - Actualizar recursos (PUT /carreras/:id, PUT /materias/:id, PUT /discapacidad/:id)
 */

export { listCarrerasValidator, listMateriasValidator, listDiscapacidadValidator } from './list.validator.js';
// TODO: Agregar otros validators cuando se implementen sus endpoints
// export { createCarreraValidator } from './create.validator.js';
// export { getCarreraByIdValidator } from './getById.validator.js';
// export { updateCarreraValidator } from './update.validator.js';

