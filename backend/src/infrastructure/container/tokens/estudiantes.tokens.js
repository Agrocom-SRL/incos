/**
 * Tokens del Módulo Estudiantes
 * 
 * Convenciones:
 * - Use Cases: {modulo}_list{Entity}UseCase (ej: 'estudiantes.listStudentsUseCase')
 * - Controllers: {modulo}_list{Entity}Controller (ej: 'estudiantes.listStudentsController')
 * - Routers: {modulo}_{entity}Router (ej: 'estudiantes.estudiantesRouter')
 * - Validators: {modulo}_{entity}Validator (ej: 'estudiantes.studentValidator')
 */

export const ESTUDIANTES_TOKENS = {
    // VALIDATORS
    studentValidator: 'estudiantes.studentValidator',

    // USE CASES
    listStudentsUseCase: 'estudiantes.listStudentsUseCase',
    registerStudentUseCase: 'estudiantes.registerStudentUseCase',
    updateStudentUseCase: 'estudiantes.updateStudentUseCase',
    getStudentByIdUseCase: 'estudiantes.getStudentByIdUseCase',
    getMisDatosEstudianteUseCase: 'estudiantes.getMisDatosEstudianteUseCase',
    getMiMatriculaEstudianteUseCase: 'estudiantes.getMiMatriculaEstudianteUseCase',
    searchStudentUseCase: 'estudiantes.searchStudentUseCase',
    generateActaCompromisoUseCase: 'estudiantes.generateActaCompromisoUseCase',
    generateDeclaracionJuradaUseCase: 'estudiantes.generateDeclaracionJuradaUseCase',
    listBecasDescuentosUseCase: 'estudiantes.listBecasDescuentosUseCase',
    createStudentScholarshipUseCase: 'estudiantes.createStudentScholarshipUseCase',
    deleteStudentScholarshipUseCase: 'estudiantes.deleteStudentScholarshipUseCase',
    getStudentScholarshipsByStudentIdUseCase: 'estudiantes.getStudentScholarshipsByStudentIdUseCase',
    listStudentScholarshipsUseCase: 'estudiantes.listStudentScholarshipsUseCase',
    getStudentScholarshipByIdUseCase: 'estudiantes.getStudentScholarshipByIdUseCase',
    searchStudentsForBecaAsignacionUseCase: 'estudiantes.searchStudentsForBecaAsignacionUseCase',
    deleteStudentUseCase: 'estudiantes.deleteStudentUseCase',
    exportStudentEnrollmentStatisticsExcelUseCase: 'estudiantes.exportStudentEnrollmentStatisticsExcelUseCase',
    exportStudentEnrollmentStudentListExcelUseCase: 'estudiantes.exportStudentEnrollmentStudentListExcelUseCase',

    // CONTROLLERS
    listStudentsController: 'estudiantes.listStudentsController',
    registerStudentController: 'estudiantes.registerStudentController',
    updateStudentController: 'estudiantes.updateStudentController',
    getStudentByIdController: 'estudiantes.getStudentByIdController',
    getMisDatosEstudianteController: 'estudiantes.getMisDatosEstudianteController',
    getMiMatriculaEstudianteController: 'estudiantes.getMiMatriculaEstudianteController',
    searchStudentController: 'estudiantes.searchStudentController',
    actaCompromisoController: 'estudiantes.actaCompromisoController',
    declaracionJuradaController: 'estudiantes.declaracionJuradaController',
    listBecasDescuentosController: 'estudiantes.listBecasDescuentosController',
    asignarBecaController: 'estudiantes.asignarBecaController',
    deleteStudentScholarshipController: 'estudiantes.deleteStudentScholarshipController',
    getStudentScholarshipsController: 'estudiantes.getStudentScholarshipsController',
    listStudentScholarshipsController: 'estudiantes.listStudentScholarshipsController',
    getStudentScholarshipByIdController: 'estudiantes.getStudentScholarshipByIdController',
    searchStudentsForBecaAsignacionController: 'estudiantes.searchStudentsForBecaAsignacionController',
    deleteStudentController: 'estudiantes.deleteStudentController',
    exportEstadisticaInscritosExcelController: 'estudiantes.exportEstadisticaInscritosExcelController',
    exportListaInscritosPorCarreraExcelController: 'estudiantes.exportListaInscritosPorCarreraExcelController',

    // ROUTERS
    estudiantesRouter: 'estudiantes.estudiantesRouter',
    becasDescuentosRouter: 'estudiantes.becasDescuentosRouter',
};

