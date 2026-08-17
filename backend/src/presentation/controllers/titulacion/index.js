/**
 * Controllers del módulo Titulación (TIT · proyectos de grado)
 */

// Proyectos de grado
export { ListProyectosGradoController } from './list-proyectos-grado.controller.js';
export { ListModalidadesGradoController } from './list-modalidades-grado.controller.js';
export { ListMisTutoradosController } from './list-mis-tutorados.controller.js';
export { GetMiProyectoGradoController } from './get-mi-proyecto-grado.controller.js';
export { ExportBitacoraMensualTutorController } from './export-bitacora-mensual-tutor.controller.js';
export { GetProyectoGradoByIdController } from './get-proyecto-grado-by-id.controller.js';
export { CreateProyectoGradoController } from './create-proyecto-grado.controller.js';
export { RegistrarMiModalidadGradoController } from './registrar-mi-modalidad-grado.controller.js';
export { UpdateProyectoGradoController } from './update-proyecto-grado.controller.js';
export { DeleteProyectoGradoController } from './delete-proyecto-grado.controller.js';
export { AsignarTutorProyectoController } from './asignar-tutor-proyecto.controller.js';
export { AprobarEtapaProyectoController } from './aprobar-etapa-proyecto.controller.js';
export { AddIntegranteProyectoController } from './add-integrante-proyecto.controller.js';
export { UpdateIntegranteProyectoController } from './update-integrante-proyecto.controller.js';

// Bitácora
export { ListBitacoraProyectoController } from './list-bitacora-proyecto.controller.js';
export { CreateBitacoraEntradaController } from './create-bitacora-entrada.controller.js';
export { UpdateBitacoraEntradaController } from './update-bitacora-entrada.controller.js';
export { ConfirmarBitacoraEstudianteController } from './confirmar-bitacora-estudiante.controller.js';

// Avances y dictámenes
export { ListAvancesProyectoController } from './list-avances-proyecto.controller.js';
export { GetAvanceByIdController } from './get-avance-by-id.controller.js';
export { CreateAvanceProyectoController } from './create-avance-proyecto.controller.js';
export { DownloadAvanceArchivoController } from './download-avance-archivo.controller.js';
export { ListDictamenesProyectoController } from './list-dictamenes-proyecto.controller.js';
export { ExportDictamenPdfController } from './export-dictamen-pdf.controller.js';

// Acta de defensa (extensión 2026-08-01; anulación P8 agregada 2026-08-02)
export { RegistrarActaDefensaController } from './registrar-acta-defensa.controller.js';
export { ListActasDefensaController } from './list-actas-defensa.controller.js';
export { ExportActaDefensaPdfController } from './export-acta-defensa-pdf.controller.js';
export { AnularActaDefensaController } from './anular-acta-defensa.controller.js';

// Extensión 2026-07-31 (formulario de modalidad de graduación, reporte de
// avance por carrera)
export { ListEstudiantesElegiblesModalidadGradoController } from './list-estudiantes-elegibles-modalidad-grado.controller.js';
export { ExportFormularioModalidadGradoPdfController } from './export-formulario-modalidad-grado-pdf.controller.js';
export { GetAvanceTutoriaCarreraController } from './get-avance-tutoria-carrera.controller.js';
export { ExportAvanceTutoriaCarreraPdfController } from './export-avance-tutoria-carrera-pdf.controller.js';

// Extensión 2026-08-10: Seguimiento de tutorías a docentes (reemplaza la
// planilla de avance "10 en 10" de 3er año, que dependía de Matrícula sin
// datos en desarrollo y sin documento físico real)
export { GetSeguimientoTutoriaDocentesController } from './get-seguimiento-tutoria-docentes.controller.js';
export { ExportSeguimientoTutoriaDocentesExcelController } from './export-seguimiento-tutoria-docentes-excel.controller.js';
