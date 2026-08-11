/**
 * Controllers del módulo Pasantías (TUT · práctica laboral)
 */

// Trámites de pasantía / convalidación
export { ListPasantiasController } from './list-pasantias.controller.js';
export { GetPasantiaByIdController } from './get-pasantia-by-id.controller.js';
export { CreatePasantiaController } from './create-pasantia.controller.js';
export { UpdatePasantiaController } from './update-pasantia.controller.js';
export { DeletePasantiaController } from './delete-pasantia.controller.js';
export { TransicionarPasantiaController } from './transicionar-pasantia.controller.js';

// Catálogo de empresas
export { ListPasantiasEmpresasController } from './list-pasantias-empresas.controller.js';
export { GetPasantiaEmpresaController } from './get-pasantia-empresa.controller.js';
export { CreatePasantiaEmpresaController } from './create-pasantia-empresa.controller.js';
export { UpdatePasantiaEmpresaController } from './update-pasantia-empresa.controller.js';
export { SetEstadoPasantiaEmpresaController } from './set-estado-pasantia-empresa.controller.js';
export { DeletePasantiaEmpresaController } from './delete-pasantia-empresa.controller.js';

// Portal por rol (anti-IDOR: ids resueltos en servidor)
export { ListMisPasantiasSupervisadasController } from './list-mis-pasantias-supervisadas.controller.js';
export { GetMiPasantiaController } from './get-mi-pasantia.controller.js';

// Informes (con PDF institucional)
export { ListInformesPasantiaController } from './list-informes-pasantia.controller.js';
export { CreateInformePasantiaController } from './create-informe-pasantia.controller.js';
export { UpdateInformePasantiaController } from './update-informe-pasantia.controller.js';
export { ExportInformePasantiaPdfController } from './export-informe-pasantia-pdf.controller.js';

// Seguimientos (con PDF de la hoja, generado al vuelo)
export { ListSeguimientosPasantiaController } from './list-seguimientos-pasantia.controller.js';
export { CreateSeguimientoPasantiaController } from './create-seguimiento-pasantia.controller.js';
export { UpdateSeguimientoPasantiaController } from './update-seguimiento-pasantia.controller.js';
export { ExportSeguimientoPasantiaPdfController } from './export-seguimiento-pasantia-pdf.controller.js';
