/**
 * Controllers del recurso Supervisión docente (módulo DOC ·
 * fichas_seguimiento_clase, schema 27).
 *
 * Contrato con el frontend (dataKey == dataFieldName):
 * - listas → 'fichasSeguimiento' (GET / y GET /mis-fichas)
 * - objeto → 'fichaSeguimiento' (GET /:id, POST /, PUT /:id)
 */

export { ListFichasSeguimientoController } from './list-fichas-seguimiento.controller.js';
export { GetFichaSeguimientoByIdController } from './get-ficha-seguimiento-by-id.controller.js';
export { CreateFichaSeguimientoController } from './create-ficha-seguimiento.controller.js';
export { UpdateFichaSeguimientoController } from './update-ficha-seguimiento.controller.js';

// Portal del docente (anti-IDOR: docente resuelto en servidor)
export { ListMisFichasSeguimientoController } from './list-mis-fichas-seguimiento.controller.js';

// Exportación PDF (réplica del formulario físico)
export { ExportFichaSeguimientoPdfController } from './export-ficha-seguimiento-pdf.controller.js';
