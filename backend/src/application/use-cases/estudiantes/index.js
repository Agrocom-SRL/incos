// ============================================
// USE CASES IMPLEMENTADOS - ESTUDIANTES (CRUD básico)
// ============================================
export { ListStudentsUseCase } from './ListStudentsUseCase.js';
export { RegisterStudentUseCase } from './RegisterStudentUseCase.js';
export { UpdateStudentUseCase } from './UpdateStudentUseCase.js';
export { GetStudentByIdUseCase } from './GetStudentByIdUseCase.js';
export { GetMisDatosEstudianteUseCase } from './GetMisDatosEstudianteUseCase.js';
export { SearchStudentUseCase } from './SearchStudentUseCase.js';
export { GenerateActaCompromisoUseCase } from './GenerateActaCompromisoUseCase.js';
export { GenerateDeclaracionJuradaUseCase } from './GenerateDeclaracionJuradaUseCase.js';
export { DeleteStudentUseCase } from './DeleteStudentUseCase.js';
export { ExportStudentEnrollmentStatisticsExcelUseCase } from './ExportStudentEnrollmentStatisticsExcelUseCase.js';
export { ExportStudentEnrollmentStudentListExcelUseCase } from './ExportStudentEnrollmentStudentListExcelUseCase.js';

// ============================================
// USE CASES - BECAS
// ============================================
export { CreateStudentScholarshipUseCase } from './becas/CreateStudentScholarshipUseCase.js';
export { DeleteStudentScholarshipUseCase } from './becas/DeleteStudentScholarshipUseCase.js';
export { SearchStudentsForBecaAsignacionUseCase } from './becas/SearchStudentsForBecaAsignacionUseCase.js';
export { GetStudentScholarshipByIdUseCase } from './becas/GetStudentScholarshipByIdUseCase.js';
// TODO: Agregar otros Use Cases cuando se implementen sus endpoints
// export { ListBecasUseCase } from './becas/ListBecasUseCase.js';
// export { AprobarBecaUseCase } from './becas/AprobarBecaUseCase.js';

// ============================================
// USE CASES FUTUROS - LICENCIAS
// ============================================
// export { ListLicenciasUseCase } from './licencias/ListLicenciasUseCase.js';
// export { SolicitarLicenciaUseCase } from './licencias/SolicitarLicenciaUseCase.js';
// export { AprobarLicenciaUseCase } from './licencias/AprobarLicenciaUseCase.js';

// ============================================
// USE CASES FUTUROS - DOCUMENTOS
// ============================================
// export { ListDocumentosUseCase } from './documentos/ListDocumentosUseCase.js';
// export { UploadDocumentoUseCase } from './documentos/UploadDocumentoUseCase.js';

