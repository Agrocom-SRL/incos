/**
 * Controladores del módulo de Estudiantes
 * Organizados por actividad/endpoint
 *
 * Estructura:
 * - create.controller.js - Crear estudiante (POST /estudiantes)
 * - list.controller.js - Listar estudiantes (GET /estudiantes)
 * - getById.controller.js - Obtener por ID (GET /estudiantes/:id)
 * - update.controller.js - Actualizar estudiante (PUT /estudiantes/:id)
 * - status.controller.js - Cambiar estado (PATCH /estudiantes/:id/estado)
 * - becas.controller.js - Asignar beca (POST /estudiantes/:id/becas)
 * - licencias.controller.js - Solicitar licencia (POST /estudiantes/:id/licencias)
 */

export { CreateStudentController } from './create.controller.js';
export { ListStudentsController } from './list.controller.js';
export { GetStudentByIdController } from './getById.controller.js';
export { UpdateStudentController } from './update.controller.js';
export { ChangeStudentStatusController } from './status.controller.js';
export { AssignBecaController } from './becas.controller.js';
export { RequestLicenciaController } from './licencias.controller.js';
export { GenerateCompromisoActaController } from './generate-compromiso-acta.controller.js';
