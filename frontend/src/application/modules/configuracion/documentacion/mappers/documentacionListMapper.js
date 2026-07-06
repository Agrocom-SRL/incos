/**
 * Mapper: documentacionListMapper
 *
 * Single Responsibility: Transformar datos del backend (documentacion) al
 * formato necesario para la lista. dataFieldName backend = 'documentacion'.
 *
 * Ubicación: application/modules/configuracion/documentacion/mappers
 */
export const documentacionListMapper = (documentacionBackend) => {
  if (!documentacionBackend) {
    return null;
  }

  return {
    id: documentacionBackend.id,
    nombre: documentacionBackend.nombre,
    tipoDocumento: documentacionBackend.tipoDocumento,
    documentoPadreId: documentacionBackend.documentoPadreId ?? null,
    aceptaFotocopia: Boolean(documentacionBackend.aceptaFotocopia),
    requerido: documentacionBackend.requerido !== false,
    esDocumentoSistema: Boolean(documentacionBackend.esDocumentoSistema),
    orden: documentacionBackend.orden ?? 0,
    descripcion: documentacionBackend.descripcion,
    activo: documentacionBackend.activo,
  };
};

/**
 * Mapea un array de documentación del backend al formato de lista
 */
export const mapDocumentacionList = (documentacionBackend) => {
  if (!Array.isArray(documentacionBackend)) {
    return [];
  }

  return documentacionBackend.map(documentacionListMapper).filter(Boolean);
};
