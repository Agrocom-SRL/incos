/**
 * Validators del módulo Referencia
 */

export { listDocumentacionValidator } from './list-documentacion.validator.js';
export { createDocumentacionValidator } from './create-documentacion.validator.js';
export { updateDocumentacionValidator } from './update-documentacion.validator.js';

// Discapacidad y Tipos de Parentesco (Apoderados): shape idéntico (nombre + descripcion),
// comparten un factory genérico (nombre-descripcion.validator.js) en vez de 2 archivos duplicados.
export {
  createDiscapacidadValidator,
  updateDiscapacidadValidator,
  createTipoParentescoValidator,
  updateTipoParentescoValidator,
} from './nombre-descripcion.validator.js';

// Idiomas: shape distinto (nombre + codigoIso, sin descripcion), validator propio.
export { createIdiomaValidator, updateIdiomaValidator } from './idiomas.validator.js';

// Estados civiles: shape distinto (nombre + abreviatura, sin descripcion), validator propio.
export {
  createEstadoCivilValidator,
  updateEstadoCivilValidator,
} from './estados-civiles.validator.js';

// Activar/desactivar (PATCH /:id/estado): body { activo: boolean }, compartido por los 4 catálogos.
export { setEstadoCatalogoValidator } from './set-estado.validator.js';
