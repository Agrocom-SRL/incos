/**
 * Controllers del módulo Tutorías y Acompañamiento (TUT)
 */

// Titulación — proyectos de grado
export { ListProyectosGradoController } from './list-proyectos-grado.controller.js';
export { ListModalidadesGradoController } from './list-modalidades-grado.controller.js';
export { ListMisTutoradosController } from './list-mis-tutorados.controller.js';
export { GetMiProyectoGradoController } from './get-mi-proyecto-grado.controller.js';
export { ExportBitacoraMensualTutorController } from './export-bitacora-mensual-tutor.controller.js';
export { GetProyectoGradoByIdController } from './get-proyecto-grado-by-id.controller.js';
export { CreateProyectoGradoController } from './create-proyecto-grado.controller.js';
export { UpdateProyectoGradoController } from './update-proyecto-grado.controller.js';
export { DeleteProyectoGradoController } from './delete-proyecto-grado.controller.js';
export { AsignarTutorProyectoController } from './asignar-tutor-proyecto.controller.js';
export { AprobarEtapaProyectoController } from './aprobar-etapa-proyecto.controller.js';
export { AddIntegranteProyectoController } from './add-integrante-proyecto.controller.js';
export { UpdateIntegranteProyectoController } from './update-integrante-proyecto.controller.js';

// Titulación — bitácora
export { ListBitacoraProyectoController } from './list-bitacora-proyecto.controller.js';
export { CreateBitacoraEntradaController } from './create-bitacora-entrada.controller.js';
export { UpdateBitacoraEntradaController } from './update-bitacora-entrada.controller.js';
export { ConfirmarBitacoraEstudianteController } from './confirmar-bitacora-estudiante.controller.js';

// Titulación — avances y dictámenes
export { ListAvancesProyectoController } from './list-avances-proyecto.controller.js';
export { GetAvanceByIdController } from './get-avance-by-id.controller.js';
export { CreateAvanceProyectoController } from './create-avance-proyecto.controller.js';
export { DownloadAvanceArchivoController } from './download-avance-archivo.controller.js';
export { ListDictamenesProyectoController } from './list-dictamenes-proyecto.controller.js';
export { ExportDictamenPdfController } from './export-dictamen-pdf.controller.js';

// Acompañamiento — alertas de riesgo
export { ListAlertasRiesgoController } from './list-alertas-riesgo.controller.js';
export { ListMisAlertasRiesgoDocenteController } from './list-mis-alertas-riesgo-docente.controller.js';
export { GetAlertaRiesgoEstudianteController } from './get-alerta-riesgo-estudiante.controller.js';

// Acompañamiento — sesiones de refuerzo
export { ListSesionesRefuerzoController } from './list-sesiones-refuerzo.controller.js';
export { GetSesionRefuerzoByIdController } from './get-sesion-refuerzo-by-id.controller.js';
export { CreateSesionRefuerzoController } from './create-sesion-refuerzo.controller.js';
export { UpdateSesionRefuerzoController } from './update-sesion-refuerzo.controller.js';
export { DeleteSesionRefuerzoController } from './delete-sesion-refuerzo.controller.js';
export { RegisterAsistenciaSesionController } from './register-asistencia-sesion.controller.js';

// Acompañamiento — panel
export { GetPanelAcompanamientoController } from './get-panel-acompanamiento.controller.js';
export { ExportPanelAcompanamientoController } from './export-panel-acompanamiento.controller.js';
