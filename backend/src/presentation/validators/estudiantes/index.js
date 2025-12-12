/**
 * Validadores del módulo de Estudiantes
 * Organizados por actividad/endpoint
 *
 * Estructura:
 * - create.validator.js - Crear estudiante (POST /estudiantes)
 * - list.validator.js - Listar estudiantes (GET /estudiantes)
 * - getById.validator.js - Obtener por ID (GET /estudiantes/:id)
 * - update.validator.js - Actualizar estudiante (PUT /estudiantes/:id)
 * - status.validator.js - Cambiar estado (PATCH /estudiantes/:id/estado)
 * - becas.validator.js - Asignar beca (POST /estudiantes/:id/becas)
 * - licencias.validator.js - Solicitar licencia (POST /estudiantes/:id/licencias)
 */

export { registerStudentValidator } from './create.validator.js';
export { listStudentsValidator } from './list.validator.js';
export { getStudentByIdValidator } from './getById.validator.js';
export { updateStudentValidator } from './update.validator.js';
export { changeStudentStatusValidator } from './status.validator.js';
export { assignBecaValidator } from './becas.validator.js';
export { requestLicenciaValidator } from './licencias.validator.js';
