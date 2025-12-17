// modules/estudiantes/helpers/generateDocumentFields.js
/**
 * Helper para generar campos de documentos dinámicamente
 * 
 * Responsabilidad: Generar configuración de campos de formulario
 * para documentos basándose en la documentación requerida
 */

/**
 * Genera campos de formulario para documentos
 * @param {Array} documentacionInscripcion - Lista de documentos requeridos
 * @param {Object} documentosExistentes - Objeto con documentos ya subidos { documentacionId: { id, nombreArchivo, rutaArchivo, url } }
 * @returns {Array} Array de campos de formulario
 */
export const generateDocumentFields = (documentacionInscripcion = [], documentosExistentes = {}) => {
  if (!documentacionInscripcion || documentacionInscripcion.length === 0) {
    return [];
  }

  const fields = [];
  // Ordenar por orden antes de generar campos
  const documentosOrdenados = [...documentacionInscripcion].sort((a, b) => (a.orden || 0) - (b.orden || 0));
  
  documentosOrdenados.forEach((doc) => {
    // Construir label con asterisco si es requerido
    const asteriscoRequerido = doc.requerido ? ' *' : '';
    const labelCheckbox = `${doc.nombre}${asteriscoRequerido}`;
    
    // Campo checkbox para marcar si el documento está entregado
    fields.push({
      name: `documento_${doc.id}_entregado`,
      label: labelCheckbox,
      type: 'checkbox',
      span: 8,
      required: doc.requerido,
      rules: doc.requerido
        ? [
            {
              validator: (_, value) => {
                if (!value) {
                  return Promise.reject(
                    new Error(`${doc.nombre} es requerido`)
                  );
                }
                return Promise.resolve();
              },
            },
          ]
        : [],
      documentacionId: doc.id,
      requerido: doc.requerido,
      aceptaFotocopia: doc.aceptaFotocopia,
      descripcion: doc.descripcion,
      tipoDocumento: doc.tipoDocumento,
      orden: doc.orden,
    });

    // Campo upload para subir el archivo
    // Verificar si ya existe un documento para este campo
    const documentoExistente = documentosExistentes[doc.id];
    
    // Solo hacer requerido si no hay documento existente
    const esRequerido = doc.requerido && !documentoExistente;
    
    const labelUpload = `Subir ${doc.nombre}${asteriscoRequerido}`;
    fields.push({
      name: `documento_${doc.id}_archivo`,
      label: labelUpload,
      type: 'upload',
      span: 16,
      accept: '.pdf,.jpg,.jpeg,.png',
      maxCount: 1,
      uploadText: 'Seleccionar archivo',
      documentacionId: doc.id,
      required: esRequerido,
      aceptaFotocopia: doc.aceptaFotocopia,
      descripcion: doc.descripcion,
      documentoExistente: documentoExistente, // Pasar información del documento existente
      rules: esRequerido
        ? [
            {
              validator: (_, value) => {
                // Si hay documento existente, no es requerido
                if (documentoExistente) {
                  return Promise.resolve();
                }
                if (!value || (Array.isArray(value) && value.length === 0)) {
                  return Promise.reject(
                    new Error(`Debe subir el archivo de ${doc.nombre}`)
                  );
                }
                return Promise.resolve();
              },
            },
          ]
        : [],
    });
  });

  return fields;
};
