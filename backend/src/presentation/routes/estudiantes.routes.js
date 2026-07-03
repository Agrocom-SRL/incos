import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { verificarPermiso, verificarPermisoCualquiera } from '../middleware/permisos.middleware.js';
import { estudianteSelfOnlyGuard } from '../middleware/estudianteSelfOnly.middleware.js';
import { estudianteAlcanceDocenteGuard } from '../middleware/estudianteAlcanceDocente.middleware.js';
import { listValidator, idValidator, searchValidator } from '../validators/common/index.js';
import {
    registerStudentValidator,
    updateStudentValidator,
    assignBecaValidator,
    searchStudentsAsignacionBecaValidator,
} from '../validators/estudiantes/index.js';

/**
 * Construye el router del módulo Estudiantes
 * 
 * Responsabilidades:
 * - Definir rutas y métodos HTTP
 * - Vincular validators y middlewares
 * - Delegar lógica a controllers inyectados
 * 
 * @param {Object} params - Dependencias inyectadas
 * @param {Object} params.controllers - Controllers del módulo
 * @param {Object} params.middlewares - Middlewares (validateRequest, upload, auth, etc.)
 * @returns {Router} Router configurado de Express
 * 
 * @example
 * const router = buildEstudiantesRouter({ controllers, middlewares });
 * app.use('/api/v1/estudiantes', router);
 */
export function buildEstudiantesRouter({ controllers, middlewares }) {
    const router = express.Router();
    const { validateRequest } = middlewares;

    const admisionListar = [authenticate, verificarPermiso('matricula.admision.ver', 'LISTAR')];
    const admisionDetalle = [authenticate, verificarPermiso('matricula.admision.ver', 'DETALLE')];
    const admisionCrear = [authenticate, verificarPermiso('matricula.admision.crear', 'CREAR')];
    const admisionEditar = [authenticate, verificarPermiso('matricula.admision.editar', 'EDITAR')];
    const admisionEliminar = [authenticate, verificarPermiso('matricula.admision.editar', 'ELIMINAR')];
    const admisionExportar = [authenticate, verificarPermiso('matricula.admision.ver', 'EXPORTAR')];
    /** Excel lista inscritos por carrera: admisión o módulo inscripciones (misma ruta API). */
    const listaInscritosPorCarreraExportar = [
        authenticate,
        verificarPermisoCualquiera([
            ['matricula.admision.ver', 'EXPORTAR'],
            ['matricula.inscribir', 'EXPORTAR'],
        ]),
    ];
    const documentoPdf = [authenticate, verificarPermiso('matricula.documento.ver', 'GENERAR_PDF')];
    // "Mis datos" se consume desde "Mi perfil" (autoservicio, sin permiso propio, como /auth/me).
    // El acceso lo blinda resolveEstudianteIdForUsuario: 403 si el usuario no es estudiante.
    const misDatosDetalle = [authenticate];
    // "Mi matrícula": reutiliza la opción de menú "Matrículas" (matricula.inscribir).
    // El wrapper de rol decide ver "Mi matrícula" (estudiante) vs el listado de
    // inscripciones (staff). El acceso real lo blinda resolveEstudianteIdForUsuario
    // (403 si el usuario no es estudiante).
    const miMatriculaListar = [authenticate, verificarPermiso('matricula.inscribir', 'LISTAR')];
    const becaListar = [authenticate, verificarPermiso('matricula.beca.ver', 'LISTAR')];
    const becaDetalle = [authenticate, verificarPermiso('matricula.beca.ver', 'DETALLE')];
    const becaAsignarCrear = [authenticate, verificarPermiso('matricula.beca.asignar', 'CREAR')];
    const becaAsignarEliminar = [authenticate, verificarPermiso('matricula.beca.asignar', 'ELIMINAR')];
    const historialDetalle = [authenticate, verificarPermiso('academico.historial.academico', 'DETALLE')];
    const historialExportar = [authenticate, verificarPermiso('academico.historial.academico', 'EXPORTAR')];

    // ============================================
    // CRUD BÁSICO
    // ============================================

    /**
     * GET /api/v1/estudiantes
     * Listar estudiantes con filtros y paginación
     * Query: page, limit, search
     */
    router.get(
        '/',
        ...admisionListar,
        listValidator, // 1. Validator primero
        validateRequest, // 2. Middleware que procesa errores
        (req, res, next) => controllers.listStudentsController.handle(req, res, next) // 3. Controller al final
    );

    /**
     * POST /api/v1/estudiantes
     * Registrar nuevo estudiante con datos relacionados
     * Body: student, guardians, disabilities, origins, documentation
     */
    router.post(
        '/',
        ...admisionCrear,
        registerStudentValidator,  // 1. Validator primero
        validateRequest,            // 2. Middleware que procesa errores
        (req, res, next) => controllers.registerStudentController.handle(req, res, next)  // 3. Controller al final
    );

    /**
     * PUT /api/v1/estudiantes/:id
     * Actualizar estudiante existente con todos sus datos relacionados
     * Path: id (ID del estudiante)
     * Body: student (opcional - actualización parcial), guardians (opcional - reemplazo completo),
     *       disabilities (opcional - reemplazo completo), origins (opcional - reemplazo completo),
     *       documentation (opcional - reemplazo completo)
     * 
     * NOTA: Similar a RegisterStudentUseCase, actualiza estudiante y todas sus relaciones.
     * - Datos básicos: actualización parcial (solo campos proporcionados)
     * - Relaciones: reemplazo completo (si se proporcionan, elimina todas las existentes y crea las nuevas)
     */
    router.put(
        '/:id',
        ...admisionEditar,
        idValidator,  // 1. Validator primero
        updateStudentValidator,  // 2. Validator de datos del body
        validateRequest,  // 3. Middleware que procesa errores
        (req, res, next) => controllers.updateStudentController.handle(req, res, next)  // 4. Controller al final
    );

    // ============================================
    // GENERACIÓN DE DOCUMENTOS
    // ============================================

    /**
     * POST /api/v1/estudiantes/:id/documentos/acta-compromiso
     * Generar acta de compromiso para un estudiante
     * Path: id
     */
    router.post(
        '/:id/documentos/acta-compromiso',
        ...documentoPdf,
        idValidator,  // 1. Validator primero
        validateRequest,  // 2. Middleware que procesa errores
        (req, res, next) => controllers.actaCompromisoController.handle(req, res, next)  // 3. Controller al final
    );

  /**
   * POST /api/v1/estudiantes/:id/documentos/declaracion-jurada
   * Generar declaración jurada del formulario de inscripción para un estudiante
   * Path: id
   */
  router.post(
    '/:id/documentos/declaracion-jurada',
    ...documentoPdf,
    idValidator,  // 1. Validator primero
    validateRequest,  // 2. Middleware que procesa errores
    (req, res, next) => controllers.declaracionJuradaController.handle(req, res, next)  // 3. Controller al final
  );

    // ============================================
    // PORTAL DEL ESTUDIANTE (datos propios)
    // ============================================

    /**
     * GET /api/v1/estudiantes/mis-datos
     * Datos del estudiante de la sesión (se resuelve desde req.usuario.id en servidor).
     * Payload recortado: { student, guardians, origins, academicData, inscripcion }.
     *
     * IMPORTANTE: debe ir ANTES de /:id para evitar conflictos.
     */
    router.get(
        '/mis-datos',
        ...misDatosDetalle,
        (req, res, next) => controllers.getMisDatosEstudianteController.handle(req, res, next)
    );

    /**
     * GET /api/v1/estudiantes/mi-matricula
     * "Mi matrícula" del estudiante de la sesión: materias matriculadas + horario
     * semanal (gestión vigente), solo lectura. El estudiante se resuelve desde
     * req.usuario.id en servidor (anti-IDOR).
     *
     * IMPORTANTE: debe ir ANTES de /:id para evitar conflictos.
     */
    router.get(
        '/mi-matricula',
        ...miMatriculaListar,
        (req, res, next) => controllers.getMiMatriculaEstudianteController.handle(req, res, next)
    );

    // ============================================
    // BÚSQUEDA DE ESTUDIANTE
    // ============================================

    /**
     * GET /api/v1/estudiantes/search
     * Buscar estudiante por texto libre
     * Query: query (busca en codigo, ci, nombres, apellidos), limit (opcional)
     * 
     * IMPORTANTE: Esta ruta debe estar ANTES de /:id para evitar conflictos
     */
    router.get(
        '/search',
        ...admisionListar,
        searchValidator,  // 1. Validator común de búsqueda
        validateRequest,  // 2. Middleware que procesa errores
        (req, res, next) => controllers.searchStudentController.handle(req, res, next)  // 3. Controller al final
    );

    /**
     * GET /api/v1/estudiantes/buscar-asignacion-beca
     * Muestra previa o búsqueda de estudiantes sin beca ACTIVA/PENDIENTE en gestión vigente.
     * Debe ir antes de rutas con /:id.
     */
    router.get(
        '/buscar-asignacion-beca',
        ...becaAsignarCrear,
        ...searchStudentsAsignacionBecaValidator,
        validateRequest,
        (req, res, next) => controllers.searchStudentsForBecaAsignacionController.handle(req, res, next)
    );

    /**
     * GET /api/v1/estudiantes/export/estadistica-inscritos
     * Descargar Excel de estadística de inscritos (vista_reporte_excel_inscritos).
     * Query: gestion_id (opcional; por defecto la gestión vigente)
     *
     * Debe ir antes de rutas con /:id.
     */
    router.get(
        '/export/estadistica-inscritos',
        ...admisionExportar,
        (req, res, next) => controllers.exportEstadisticaInscritosExcelController.handle(req, res, next)
    );

    /**
     * GET /api/v1/estudiantes/export/lista-inscritos-por-carrera
     * Descargar Excel de lista de inscritos por carrera, una hoja por paralelo.
     * Query: carrera_id (requerido), gestion_id (opcional; por defecto la gestión vigente)
     * Permiso: matricula.admision.ver EXPORTAR o matricula.inscribir EXPORTAR.
     *
     * Debe ir antes de rutas con /:id.
     */
    router.get(
        '/export/lista-inscritos-por-carrera',
        ...listaInscritosPorCarreraExportar,
        (req, res, next) => controllers.exportListaInscritosPorCarreraExcelController.handle(req, res, next)
    );

    // ============================================
    // ASIGNACIÓN DE BECAS
    // ============================================

    /**
     * GET /api/v1/estudiantes/becas
     * Listar todas las becas asignadas a estudiantes con datos enriquecidos
     * Query: page, limit, search, studentId, managementId, state, scholarshipId
     * 
     * Retorna todas las becas asignadas con información del estudiante, tipo de beca y gestión.
     * Útil para el listado general de becas asignadas.
     * 
     * IMPORTANTE: Esta ruta debe estar ANTES de /:id/scholarships para evitar conflictos
     */
    router.get(
        '/becas',
        ...becaListar,
        listValidator,  // 1. Validator primero
        validateRequest,  // 2. Middleware que procesa errores
        (req, res, next) => controllers.listStudentScholarshipsController.handle(req, res, next)  // 3. Controller al final
    );

    /**
     * GET /api/v1/estudiantes/becas/:id
     * Detalle de una asignación de beca (enriquecido + pago de aporte vinculado si existe).
     * Debe declararse después de GET /becas y antes de DELETE /becas/:id (mismo path, otro método).
     */
    router.get(
        '/becas/:id',
        ...becaDetalle,
        idValidator,
        validateRequest,
        (req, res, next) => controllers.getStudentScholarshipByIdController.handle(req, res, next)
    );

    /**
     * GET /api/v1/estudiantes/:id/scholarships
     * Obtener todas las becas de un estudiante con datos enriquecidos
     * Path: id (ID del estudiante)
     * 
     * Retorna las becas del estudiante con información de tipo de beca y gestión.
     * Útil para el módulo de pagos para calcular descuentos.
     * 
     * IMPORTANTE: Esta ruta debe estar ANTES de /:id para evitar conflictos
     */
    router.get(
        '/:id/scholarships',
        ...becaDetalle,
        idValidator,  // 1. Validator primero
        validateRequest,  // 2. Middleware que procesa errores
        (req, res, next) => controllers.getStudentScholarshipsController.handle(req, res, next)  // 3. Controller al final
    );

    /**
     * POST /api/v1/estudiantes/:id/scholarships
     * Asignar una beca/descuento a un estudiante
     * Path: id (ID del estudiante)
     * Body: student_id, scholarship_id, observations? (opcional)
     * 
     * NOTA: La gestión se obtiene automáticamente de la configuración del sistema.
     * La fecha de solicitud se establece automáticamente como la fecha actual.
     * El estado se establece automáticamente como PENDIENTE.
     */
    router.post(
        '/:id/scholarships',
        ...becaAsignarCrear,
        assignBecaValidator,  // 1. Validator primero
        validateRequest,  // 2. Middleware que procesa errores
        (req, res, next) => controllers.asignarBecaController.handle(req, res, next)  // 3. Controller al final
    );

    /**
     * DELETE /api/v1/estudiantes/becas/:id
     * Eliminar una beca asignada a un estudiante (soft delete)
     * Path: id (ID de la beca asignada - estudiantes_becas.id)
     * 
     * Regla de negocio: Solo se pueden eliminar becas que NO tengan pagos vigentes asociados.
     * Las becas vinculadas a pagos no se eliminan (RegisterAporteVoluntarioUseCase las usa).
     * 
     * IMPORTANTE: Esta ruta debe estar ANTES de /:id para evitar conflictos
     */
    router.delete(
        '/becas/:id',
        ...becaAsignarEliminar,
        idValidator,  // 1. Validator primero
        validateRequest,  // 2. Middleware que procesa errores
        (req, res, next) => controllers.deleteStudentScholarshipController.handle(req, res, next)  // 3. Controller al final
    );

    // ============================================
    // HISTORIAL ACADÉMICO (kardex / transcript FORM-SIE-ITT-04)
    // ============================================

    /**
     * GET /api/v1/estudiantes/:id/historial-academico/export
     * Descarga el historial académico del estudiante en Excel.
     * Permiso: academico.historial.academico EXPORTAR.
     *
     * Debe declararse ANTES de GET /:id/historial-academico y de GET /:id.
     */
    // anti-IDOR: un estudiante solo exporta SU propio historial
    router.get(
        '/:id/historial-academico/export',
        ...historialExportar,
        idValidator,
        validateRequest,
        estudianteSelfOnlyGuard,
        (req, res, next) => controllers.exportHistorialAcademicoExcelController.handle(req, res, next)
    );

    /**
     * GET /api/v1/estudiantes/:id/historial-academico/export-pdf
     * Descarga el historial académico del estudiante en PDF (FORM-SIE-ITT-04).
     * Permiso: academico.historial.academico EXPORTAR.
     *
     * Debe declararse ANTES de GET /:id/historial-academico y de GET /:id.
     */
    // anti-IDOR: un estudiante solo exporta SU propio historial
    router.get(
        '/:id/historial-academico/export-pdf',
        ...historialExportar,
        idValidator,
        validateRequest,
        estudianteSelfOnlyGuard,
        (req, res, next) => controllers.exportHistorialAcademicoPdfController.handle(req, res, next)
    );

    /**
     * GET /api/v1/estudiantes/:id/historial-academico
     * Historial académico (kardex / transcript) del estudiante: { estudiante, filas, resumen }.
     * Permiso: academico.historial.academico DETALLE.
     *
     * Debe declararse ANTES de GET /:id para evitar conflictos.
     */
    router.get(
        '/:id/historial-academico',
        ...historialDetalle,
        idValidator,
        validateRequest,
        estudianteSelfOnlyGuard,  // anti-IDOR: un estudiante solo ve SU historial
        (req, res, next) => controllers.getHistorialAcademicoController.handle(req, res, next)
    );

    // ============================================
    // ELIMINACIÓN DE ESTUDIANTE
    // ============================================

    /**
     * DELETE /api/v1/estudiantes/:id
     * Eliminar un estudiante y todas sus relaciones (soft delete)
     * Path: id (ID del estudiante)
     * 
     * Regla de negocio: Solo se pueden eliminar estudiantes que NO tengan:
     * - Inscripciones activas
     * - Pagos activos vinculados
     * - Becas activas asignadas
     * 
     * Elimina (soft delete):
     * - Apoderados (estudiantes_apoderados)
     * - Discapacidades (estudiantes_discapacidades)
     * - Orígenes (estudiantes_origenes)
     * - Entregas de documentos (estudiantes_documentos_entrega)
     * - Documentos del estudiante (documentos_estudiante) - incluyendo actas de compromiso
     * - Estudiante principal (estudiantes)
     * 
     * IMPORTANTE: Esta ruta debe estar ANTES de GET /:id para evitar conflictos
     */
    router.delete(
        '/:id',
        ...admisionEliminar,
        idValidator,  // 1. Validator primero
        validateRequest,  // 2. Middleware que procesa errores
        (req, res, next) => controllers.deleteStudentController.handle(req, res, next)  // 3. Controller al final
    );

    // ============================================
    // OBTENCIÓN DE ESTUDIANTE POR ID
    // ============================================

    /**
     * GET /api/v1/estudiantes/:id
     * Obtener estudiante por ID con datos relacionados
     * Path: id
     * 
     * IMPORTANTE: Esta ruta genérica debe estar AL FINAL para evitar conflictos
     * con rutas más específicas como /search o /:id/scholarships
     */
    router.get(
        '/:id',
        ...admisionDetalle,
        idValidator,  // 1. Validator primero
        validateRequest,  // 2. Middleware que procesa errores
        estudianteSelfOnlyGuard,  // 3. Anti-IDOR: un estudiante solo ve SU propia ficha
        estudianteAlcanceDocenteGuard, // 4. Anti-IDOR: docente solo ve estudiantes de SUS cursos
        (req, res, next) => controllers.getStudentByIdController.handle(req, res, next)  // 5. Controller al final
    );

    return router;
}

