// modules/estudiantes/helpers/generateDocumentFields.js
/**
 * Helper para generar campos de documentos dinámicamente
 * 
 * Responsabilidad: Generar configuración de campos de formulario
 * para documentos basándose en la documentación requerida
 */

/**
 * Genera campos de formulario para documentos (solo checkboxes para marcar como entregados)
 * Solo muestra documentos padre (documentoPadreId === null) de tipo INSCRIPCION
 * Muestra documentos alternativos (hijos) cuando se desmarca el padre
 * @param {Array} documentacionInscripcion - Lista de documentos requeridos
 * @param {Object} documentosExistentes - Objeto con documentos ya subidos { documentacionId: { id, nombreArchivo, rutaArchivo, url } }
 * @returns {Array} Array de campos de formulario (solo checkboxes)
 */
export const generateDocumentFields = (documentacionInscripcion = [], documentosExistentes = {}) => {
  if (!documentacionInscripcion || documentacionInscripcion.length === 0) {
    return [];
  }

  const fields = [];
  
  // Filtrar solo documentos de tipo INSCRIPCION que son padres (documentoPadreId/documento_padre_id === null)
  // El backend puede enviar el campo como documentoPadreId (camelCase) o documento_padre_id (snake_case)
  const documentosPadres = documentacionInscripcion.filter(doc => {
    const documentoPadreId = doc.documentoPadreId || doc.documento_padre_id;
    return doc.tipoDocumento === 'INSCRIPCION' && 
           (documentoPadreId === null || documentoPadreId === undefined);
  });
  
  // Crear mapa de documentos hijos (alternativos) por documento padre
  const documentosHijosMap = {};
  documentacionInscripcion.forEach(doc => {
    const documentoPadreId = doc.documentoPadreId || doc.documento_padre_id;
    if (documentoPadreId) {
      if (!documentosHijosMap[documentoPadreId]) {
        documentosHijosMap[documentoPadreId] = [];
      }
      documentosHijosMap[documentoPadreId].push(doc);
    }
  });
  
  // Ordenar documentos padres por orden
  const documentosOrdenados = [...documentosPadres].sort((a, b) => (a.orden || 0) - (b.orden || 0));
  
  documentosOrdenados.forEach((doc) => {
    // Construir label con asterisco si es requerido
    const asteriscoRequerido = doc.requerido ? ' *' : '';
    const labelCheckbox = `${doc.nombre}${asteriscoRequerido}`;
    
    // Verificar si el documento ya está marcado como entregado (por entregas físicas o documentos existentes)
    const estaEntregado = documentosExistentes[doc.id] || false;
    
    // Campo checkbox para marcar si el documento está entregado
    // Por defecto marcado como true (entregado)
    fields.push({
      name: `documento_${doc.id}_entregado`,
      label: labelCheckbox,
      type: 'checkbox',
      span: 24,
      required: doc.requerido,
      initialValue: true, // Marcado por defecto
      rules: doc.requerido
        ? [
            {
              validator: (_, value, form) => {
                // Si se desmarca un documento requerido, verificar que haya un alternativo marcado
                if (!value) {
                  const documentosHijos = documentosHijosMap[doc.id] || [];
                  if (documentosHijos.length > 0) {
                    // Hay alternativos, verificar que al menos uno esté marcado
                    const algunHijoMarcado = documentosHijos.some(hijo => {
                      const hijoValue = form?.getFieldValue(`documento_${hijo.id}_entregado`);
                      return hijoValue === true;
                    });
                    if (!algunHijoMarcado) {
                      return Promise.reject(
                        new Error(`${doc.nombre} es requerido. Si no lo tiene, debe marcar su documento alternativo.`)
                      );
                    }
                  } else {
                    // No hay alternativos, es requerido
                    return Promise.reject(
                      new Error(`${doc.nombre} es requerido`)
                    );
                  }
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
      documentoPadreId: doc.documentoPadreId || doc.documento_padre_id,
    });
    
    // Agregar documentos alternativos (hijos) que se muestran cuando se desmarca el padre
    const documentosHijos = documentosHijosMap[doc.id] || [];
    documentosHijos.forEach((hijo) => {
      const asteriscoHijo = hijo.requerido ? ' *' : '';
      const labelHijo = `${hijo.nombre}${asteriscoHijo} (Alternativo)`;
      
      fields.push({
        name: `documento_${hijo.id}_entregado`,
        label: labelHijo,
        type: 'checkbox',
        span: 24,
        required: hijo.requerido,
        initialValue: true, // Marcado por defecto también para alternativos
        dependencies: [`documento_${doc.id}_entregado`],
        watchFields: [`documento_${doc.id}_entregado`], // Observar explícitamente el campo padre
        // Solo mostrar cuando el documento padre está desmarcado
        // IMPORTANTE: Si el valor es undefined, asumir que está marcado (initialValue: true)
        shouldRender: (formValues) => {
          const padreValue = formValues?.[`documento_${doc.id}_entregado`];
          // Si el valor es undefined, asumir que está marcado (por initialValue: true)
          // Solo mostrar si está explícitamente en false
          if (padreValue === undefined) {
            return false; // No mostrar si no se ha inicializado (asumir marcado)
          }
          return padreValue === false; // Solo mostrar si está explícitamente desmarcado
        },
        rules: hijo.requerido
          ? [
              {
                validator: (_, value) => {
                  if (!value) {
                    return Promise.reject(
                      new Error(`${hijo.nombre} es requerido como documento alternativo`)
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]
          : [],
        documentacionId: hijo.id,
        requerido: hijo.requerido,
        aceptaFotocopia: hijo.aceptaFotocopia,
        descripcion: hijo.descripcion,
        tipoDocumento: hijo.tipoDocumento,
        orden: hijo.orden,
        documentoPadreId: hijo.documentoPadreId || hijo.documento_padre_id,
      });
    });
  });

  return fields;
};

/**
 * Genera campos para la sección de subir documentos
 * @param {Array} documentacionInscripcion - Lista de documentos requeridos para crear opciones
 * @returns {Array} Array de campos de formulario para subir documentos
 */
export const generateUploadDocumentFields = (documentacionInscripcion = []) => {
  // Obtener tipos de documento únicos
  const tiposDocumento = [...new Set(documentacionInscripcion.map(doc => doc.tipoDocumento).filter(Boolean))];
  
  // Crear opciones para el select de documentos (solo documentos de inscripción)
  const documentosInscripcion = documentacionInscripcion
    .filter(doc => doc.tipoDocumento === 'INSCRIPCION')
    .map(doc => ({
      label: doc.nombre,
      value: doc.id,
    }));

  return [
    {
      name: 'tipoDocumento',
      label: 'Tipo de Documento',
      type: 'select',
      span: 8,
      required: true,
      placeholder: 'Seleccione el tipo de documento',
      options: tiposDocumento.map(tipo => ({
        label: tipo,
        value: tipo,
      })),
      rules: [
        { required: true, message: 'El tipo de documento es requerido' },
      ],
    },
    {
      name: 'alcanceDocumento',
      label: '¿Qué representa este archivo?',
      type: 'radio',
      span: 8,
      required: true,
      options: [
        { label: 'Documento Individual', value: 'INDIVIDUAL' },
        { label: 'Parcial (2 o más documentos)', value: 'PARCIAL' },
        { label: 'Documentación Completa', value: 'COMPLETO' },
      ],
      rules: [
        { required: true, message: 'Debe indicar qué representa el archivo' },
      ],
    },
    {
      name: 'documentosRepresentados',
      label: 'Documentos que representa este archivo',
      type: 'select',
      span: 8,
      mode: 'multiple',
      placeholder: 'Seleccione los documentos',
      options: documentosInscripcion,
      dependencies: ['alcanceDocumento'],
      // Solo mostrar si es INDIVIDUAL o PARCIAL
      shouldRender: (formValues) => {
        const alcance = formValues?.alcanceDocumento;
        return alcance === 'INDIVIDUAL' || alcance === 'PARCIAL';
      },
      rules: [
        {
          validator: (_, value, form) => {
            const alcance = form?.getFieldValue('alcanceDocumento');
            if (alcance === 'INDIVIDUAL' || alcance === 'PARCIAL') {
              if (!value || value.length === 0) {
                return Promise.reject(
                  new Error('Debe seleccionar al menos un documento')
                );
              }
              if (alcance === 'INDIVIDUAL' && value.length > 1) {
                return Promise.reject(
                  new Error('Debe seleccionar solo un documento para "Documento Individual"')
                );
              }
              if (alcance === 'PARCIAL' && value.length < 2) {
                return Promise.reject(
                  new Error('Debe seleccionar al menos 2 documentos para "Parcial"')
                );
              }
            }
            return Promise.resolve();
          },
        },
      ],
    },
    {
      name: 'archivoDocumento',
      label: 'Subir Archivo',
      type: 'upload',
      span: 24,
      accept: '.pdf,.jpg,.jpeg,.png',
      maxCount: 1,
      uploadText: 'Seleccionar archivo',
      required: true,
      rules: [
        {
          validator: (_, value) => {
            if (!value || (Array.isArray(value) && value.length === 0)) {
              return Promise.reject(
                new Error('Debe subir un archivo')
              );
            }
            return Promise.resolve();
          },
        },
      ],
    },
  ];
};
