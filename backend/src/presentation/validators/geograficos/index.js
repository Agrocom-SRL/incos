/**
 * Validadores del módulo de Geográficos
 * Organizados por actividad/endpoint
 *
 * Estructura:
 * - list.validator.js - Listar recursos (GET /paises, GET /departamentos, GET /provincias, GET /municipios)
 * - create.validator.js - Crear recursos (POST /paises, POST /departamentos, POST /provincias, POST /municipios)
 * - getById.validator.js - Obtener por ID (GET /paises/:id, GET /departamentos/:id, GET /provincias/:id, GET /municipios/:id)
 * - update.validator.js - Actualizar recursos (PUT /paises/:id, PUT /departamentos/:id, PUT /provincias/:id, PUT /municipios/:id)
 */

export { listPaisesValidator, listDepartamentosValidator, listProvinciasValidator, listMunicipiosValidator } from './list.validator.js';
// TODO: Agregar otros validators cuando se implementen sus endpoints
// export { createPaisValidator } from './create.validator.js';
// export { getPaisByIdValidator } from './getById.validator.js';
// export { updatePaisValidator } from './update.validator.js';

