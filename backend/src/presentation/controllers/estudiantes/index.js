// ============================================
// CONTROLLERS IMPLEMENTADOS - ESTUDIANTES (CRUD básico)
// ============================================
export { ListStudentsController } from './estudiantes/list.controller.js';
export { RegisterStudentController } from './estudiantes/register.controller.js';
export { UpdateStudentController } from './estudiantes/update.controller.js';
export { GetStudentByIdController } from './estudiantes/get-by-id.controller.js';
export { GetMisDatosEstudianteController } from './estudiantes/get-mis-datos.controller.js';
export { SearchStudentController } from './estudiantes/search.controller.js';
export { ActaCompromisoController } from './estudiantes/acta-compromiso.controller.js';
export { DeclaracionJuradaController } from './estudiantes/declaracion-jurada.controller.js';
export { DeleteStudentController } from './estudiantes/delete-student.controller.js';
export { ExportEstadisticaInscritosExcelController } from './estudiantes/export-estadistica-inscritos-excel.controller.js';
export { ExportListaInscritosPorCarreraExcelController } from './estudiantes/export-lista-inscritos-por-carrera-excel.controller.js';

// ============================================
// CONTROLLERS - BECAS
// ============================================
export { AsignarBecaController } from './becas/asignar.controller.js';
export { DeleteStudentScholarshipController } from './becas/delete-student-scholarship.controller.js';
export { GetStudentScholarshipsController } from './becas/get-scholarships.controller.js';
export { ListStudentScholarshipsController } from './becas/list-student-scholarships.controller.js';
export { GetStudentScholarshipByIdController } from './becas/get-student-scholarship-by-id.controller.js';
export { SearchStudentsForBecaAsignacionController } from './becas/search-students-asignacion-beca.controller.js';
// TODO: Agregar otros Controllers cuando se implementen sus endpoints
// export { AprobarBecaController } from './becas/aprobar.controller.js';

// ============================================
// CONTROLLERS FUTUROS - LICENCIAS
// ============================================
// export { ListLicenciasController } from './licencias/list.controller.js';
// export { SolicitarLicenciaController } from './licencias/solicitar.controller.js';
// export { AprobarLicenciaController } from './licencias/aprobar.controller.js';

// ============================================
// CONTROLLERS FUTUROS - DOCUMENTOS
// ============================================
// export { ListDocumentosController } from './documentos/list.controller.js';
// export { UploadDocumentoController } from './documentos/upload.controller.js';