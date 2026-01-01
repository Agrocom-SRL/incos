/**
 * Validadores del módulo de Referencia
 * Organizados por actividad/endpoint
 *
 * Estructura:
 * - list.validator.js - Listar recursos (GET /idiomas, GET /estados-civiles, GET /tipos-parentesco, GET /documentacion)
 * - create.validator.js - Crear recursos (POST /idiomas, POST /estados-civiles, POST /tipos-parentesco, POST /documentacion)
 * - getById.validator.js - Obtener por ID (GET /idiomas/:id, GET /estados-civiles/:id, GET /tipos-parentesco/:id, GET /documentacion/:id)
 * - update.validator.js - Actualizar recursos (PUT /idiomas/:id, PUT /estados-civiles/:id, PUT /tipos-parentesco/:id, PUT /documentacion/:id)
 */

export { listIdiomasValidator, listEstadosCivilesValidator, listTiposParentescoValidator, listDocumentacionValidator } from './list.validator.js';
// TODO: Agregar otros validators cuando se implementen sus endpoints
// export { createIdiomaValidator } from './create.validator.js';
// export { getIdiomaByIdValidator } from './getById.validator.js';
// export { updateIdiomaValidator } from './update.validator.js';

