// ============================================
// CONTROLLERS IMPLEMENTADOS - CARRERAS
// ============================================
export { ListCarrerasController } from './carreras/list.controller.js';
export { CreateCarreraController } from './carreras/create.controller.js';
export { GetCarreraByIdController } from './carreras/get-by-id.controller.js';
export { UpdateCarreraController } from './carreras/update.controller.js';
export { DeleteCarreraController } from './carreras/delete.controller.js';
export { UploadCarreraImagenController } from './carreras/upload-imagen.controller.js';

// ============================================
// CONTROLLERS IMPLEMENTADOS - MATERIAS
// ============================================
export { ListMateriasController } from './materias/list.controller.js';
export { CreateMateriaController } from './materias/create.controller.js';
export { GetMateriaByIdController } from './materias/get-by-id.controller.js';
export { UpdateMateriaController } from './materias/update.controller.js';
export { DeleteMateriaController } from './materias/delete.controller.js';

// ============================================
// CONTROLLERS IMPLEMENTADOS - PLANES DE ESTUDIO (Sprint 1 CFG)
// ============================================
export { ListPlanesEstudiosController } from './planes-estudios/list.controller.js';
export { GetPlanEstudiosByIdController } from './planes-estudios/get-by-id.controller.js';
export { GetPlanEstudiosMatrizController } from './planes-estudios/matriz.controller.js';
export { ValidarPlanEstudiosController } from './planes-estudios/validar.controller.js';
export { CreatePlanEstudiosController } from './planes-estudios/create.controller.js';
export { UpdatePlanEstudiosController } from './planes-estudios/update.controller.js';
export { MarcarPlanEstudiosVigenteController } from './planes-estudios/marcar-vigente.controller.js';
export {
    ListPeriodosByPlanController,
    CreatePeriodoController,
    UpdatePeriodoController,
    DeletePeriodoController,
} from './planes-estudios/periodos.controllers.js';
export {
    ListAsignaturasPlanByPlanController,
    ListAsignaturasPlanByPeriodoController,
    CreateAsignaturaPlanController,
    UpdateAsignaturaPlanController,
    DeleteAsignaturaPlanController,
} from './planes-estudios/asignaturas.controllers.js';
// PARALELOS MAESTRO (CFG)
export { CreateParaleloController } from './paralelos/create.controller.js';
export { GetParaleloByIdController } from './paralelos/get-by-id.controller.js';
export { UpdateParaleloController } from './paralelos/update.controller.js';
export { DeleteParaleloController } from './paralelos/delete.controller.js';
export { ListParalelosGestionByParaleloController } from './paralelos/list-paralelos-gestion-by-paralelo.controller.js';

export {
    ListPrerrequisitosByAsignaturaController,
    ListEsPrerrequisitoDeController,
    CreatePrerrequisitoController,
    DeletePrerrequisitoController,
} from './planes-estudios/prerrequisitos.controllers.js';

