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
