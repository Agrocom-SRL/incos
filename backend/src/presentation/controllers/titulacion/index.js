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
