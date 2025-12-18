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
    
    // El campo de archivo NO es requerido, solo muestra "Acepta fotocopia" si corresponde
    const labelUpload = doc.aceptaFotocopia 
      ? `Subir ${doc.nombre} (Acepta fotocopia)`
      : `Subir ${doc.nombre}`;
    
    fields.push({
      name: `documento_${doc.id}_archivo`,
      label: labelUpload,
      type: 'upload',
      span: 16,
      accept: '.pdf,.jpg,.jpeg,.png',
      maxCount: 1,
      uploadText: 'Seleccionar archivo',
      documentacionId: doc.id,
      required: false, // NUNCA requerido - solo el checkbox "Solo original" será requerido
      aceptaFotocopia: doc.aceptaFotocopia,
      descripcion: doc.descripcion,
      documentoExistente: documentoExistente, // Pasar información del documento existente
      rules: [], // Sin validación requerida para el archivo
    });
    
    // Campo checkbox "Solo original" - SOLO este es requerido cuando el documento no acepta fotocopia
    if (!doc.aceptaFotocopia) {
      fields.push({
        name: `documento_${doc.id}_soloOriginal`,
        label: 'Solo original *',
        type: 'checkbox',
        span: 8,
        required: doc.requerido, // Requerido solo si el documento es requerido
        rules: doc.requerido
          ? [
              {
                validator: (_, value) => {
                  if (!value) {
                    return Promise.reject(
                      new Error('Debe confirmar que el documento es original')
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]
          : [],
        documentacionId: doc.id,
        soloOriginal: true, // Flag para identificar este campo
      });
    }
  });

  return fields;
};
