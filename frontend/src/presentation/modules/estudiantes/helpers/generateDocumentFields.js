// modules/estudiantes/helpers/generateDocumentFields.js
/**
 * Helper para generar campos de documentos dinámicamente
 * 
 * Responsabilidad: Generar configuración de campos de formulario
 * para documentos basándose en la documentación requerida
 */

/**
 * Genera campos de formulario para documentos (switches para marcar como entregados y checkboxes para propiedades booleanas)
 * Solo muestra documentos padre (documentoPadreId === null) de tipo INSCRIPCION
 * Muestra documentos alternativos (hijos) cuando se desmarca el padre
 * @param {Array} documentacionInscripcion - Lista de documentos requeridos
 * @param {Object} documentosExistentes - Objeto con documentos ya subidos { documentacionId: { id, nombreArchivo, rutaArchivo, url } }
 * @returns {Array} Array de campos de formulario (switches y checkboxes)
 */
export const generateDocumentFields = (documentacionInscripcion = [], documentosExistentes = {}) => {
  if (!documentacionInscripcion || documentacionInscripcion.length === 0) {
    return [];
  }

  const fields = [];
  
  // Filtrar solo documentos de tipo INSCRIPCION que son padres (documentoPadreId/documento_padre_id === null o undefined)
  // El backend puede enviar el campo como documentoPadreId (camelCase) o documento_padre_id (snake_case)
  const documentosPadres = documentacionInscripcion.filter(doc => {
    const documentoPadreId = doc.documentoPadreId ?? doc.documento_padre_id ?? null;
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
    const labelSwitch = `${doc.nombre}${asteriscoRequerido}`;
    
    // Verificar si el documento ya está marcado como entregado (por entregas físicas o documentos existentes)
    const estaEntregado = documentosExistentes[doc.id] || false;
    
    // Campo switch para marcar si el documento está entregado
    // Por defecto marcado como true (entregado)
    fields.push({
      name: `documento_${doc.id}_entregado`,
      label: labelSwitch,
      type: 'switch',
      span: 24,
      required: doc.requerido,
      initialValue: true, // Marcado por defecto
      descripcion: doc.descripcion, // Descripción para mostrar en Alert
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
      tipoDocumento: doc.tipoDocumento,
      orden: doc.orden,
      documentoPadreId: doc.documentoPadreId || doc.documento_padre_id,
      showTooltip: false, // No mostrar tooltip
    });

    // Campo checkbox "En trámite" - solo mostrar cuando el documento NO está entregado
    fields.push({
      name: `documento_${doc.id}_en_tramite`,
      label: 'En Trámite',
      type: 'checkbox',
      span: 12,
      initialValue: false,
      dependencies: [`documento_${doc.id}_entregado`],
      watchFields: [`documento_${doc.id}_entregado`],
      shouldRender: (formValues) => {
        const entregado = formValues?.[`documento_${doc.id}_entregado`];
        return entregado === false; // Solo mostrar si NO está entregado
      },
      documentacionId: doc.id,
    });

    // Campo de fecha de vencimiento del trámite - solo mostrar cuando está en trámite
    fields.push({
      name: `documento_${doc.id}_fecha_vencimiento_tramite`,
      label: 'Fecha de Vencimiento del Trámite',
      type: 'datePicker',
      span: 12,
      dependencies: [`documento_${doc.id}_entregado`, `documento_${doc.id}_en_tramite`],
      watchFields: [`documento_${doc.id}_entregado`, `documento_${doc.id}_en_tramite`],
      shouldRender: (formValues) => {
        const entregado = formValues?.[`documento_${doc.id}_entregado`];
        const enTramite = formValues?.[`documento_${doc.id}_en_tramite`];
        return entregado === false && enTramite === true; // Solo mostrar si NO está entregado Y está en trámite
      },
      documentacionId: doc.id,
    });

    // Campo checkbox "Es Original" - solo mostrar cuando está entregado Y NO está en trámite
    // Este campo corresponde a la columna es_original de la tabla estudiantes_documentos_entrega
    fields.push({
      name: `documento_${doc.id}_es_original`,
      label: 'Es Original',
      type: 'checkbox',
      span: 12,
      initialValue: false,
      dependencies: [`documento_${doc.id}_entregado`, `documento_${doc.id}_en_tramite`],
      watchFields: [`documento_${doc.id}_entregado`, `documento_${doc.id}_en_tramite`],
      shouldRender: (formValues) => {
        const entregado = formValues?.[`documento_${doc.id}_entregado`];
        const enTramite = formValues?.[`documento_${doc.id}_en_tramite`];
        return entregado === true && enTramite === false; // Solo mostrar si está entregado Y NO está en trámite
      },
      documentacionId: doc.id,
    });

    // Campo de observaciones - solo mostrar cuando el documento NO está entregado
    fields.push({
      name: `documento_${doc.id}_observaciones`,
      label: 'Observaciones',
      type: 'textarea',
      span: 24,
      rows: 2,
      placeholder: 'Ingrese observaciones sobre la entrega del documento...',
      dependencies: [`documento_${doc.id}_entregado`],
      watchFields: [`documento_${doc.id}_entregado`],
      shouldRender: (formValues) => {
        const entregado = formValues?.[`documento_${doc.id}_entregado`];
        return entregado === false; // Solo mostrar si NO está entregado
      },
      documentacionId: doc.id,
    });
    
    // Agregar documentos alternativos (hijos) que se muestran cuando se desmarca el padre
    const documentosHijos = documentosHijosMap[doc.id] || [];
    documentosHijos.forEach((hijo) => {
      const asteriscoHijo = hijo.requerido ? ' *' : '';
      const labelHijo = `${hijo.nombre}${asteriscoHijo} (Alternativo)`;
      
      fields.push({
        name: `documento_${hijo.id}_entregado`,
        label: labelHijo,
        type: 'switch',
        span: 24,
        required: hijo.requerido,
        initialValue: true, // Marcado por defecto también para alternativos
        descripcion: hijo.descripcion, // Descripción para mostrar en Alert
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
        tipoDocumento: hijo.tipoDocumento,
        orden: hijo.orden,
        documentoPadreId: hijo.documentoPadreId || hijo.documento_padre_id,
      });

      // Agregar checkboxes para propiedades booleanas del documento alternativo

      // Campo checkbox "En trámite" para documento alternativo - solo mostrar cuando NO está entregado
      fields.push({
        name: `documento_${hijo.id}_en_tramite`,
        label: 'En Trámite',
        type: 'checkbox',
        span: 12,
        initialValue: false,
        dependencies: [`documento_${doc.id}_entregado`, `documento_${hijo.id}_entregado`],
        watchFields: [`documento_${doc.id}_entregado`, `documento_${hijo.id}_entregado`],
        shouldRender: (formValues) => {
          const padreDesmarcado = formValues?.[`documento_${doc.id}_entregado`] === false;
          const hijoNoMarcado = formValues?.[`documento_${hijo.id}_entregado`] === false;
          return padreDesmarcado && hijoNoMarcado; // Solo mostrar si el padre está desmarcado y el hijo TAMBIÉN está desmarcado
        },
        documentacionId: hijo.id,
      });

      // Campo de fecha de vencimiento del trámite para documento alternativo
      fields.push({
        name: `documento_${hijo.id}_fecha_vencimiento_tramite`,
        label: 'Fecha de Vencimiento del Trámite',
        type: 'datePicker',
        span: 12,
        dependencies: [`documento_${doc.id}_entregado`, `documento_${hijo.id}_entregado`, `documento_${hijo.id}_en_tramite`],
        watchFields: [`documento_${doc.id}_entregado`, `documento_${hijo.id}_entregado`, `documento_${hijo.id}_en_tramite`],
        shouldRender: (formValues) => {
          const padreDesmarcado = formValues?.[`documento_${doc.id}_entregado`] === false;
          const hijoNoMarcado = formValues?.[`documento_${hijo.id}_entregado`] === false;
          const enTramite = formValues?.[`documento_${hijo.id}_en_tramite`] === true;
          return padreDesmarcado && hijoNoMarcado && enTramite === true;
        },
        documentacionId: hijo.id,
      });

      // Campo checkbox "Es Original" para documento alternativo - solo mostrar cuando está entregado Y NO está en trámite
      fields.push({
        name: `documento_${hijo.id}_es_original`,
        label: 'Es Original',
        type: 'checkbox',
        span: 12,
        initialValue: false,
        dependencies: [`documento_${doc.id}_entregado`, `documento_${hijo.id}_entregado`, `documento_${hijo.id}_en_tramite`],
        watchFields: [`documento_${doc.id}_entregado`, `documento_${hijo.id}_entregado`, `documento_${hijo.id}_en_tramite`],
        shouldRender: (formValues) => {
          const padreDesmarcado = formValues?.[`documento_${doc.id}_entregado`] === false;
          const hijoMarcado = formValues?.[`documento_${hijo.id}_entregado`] === true;
          const enTramite = formValues?.[`documento_${hijo.id}_en_tramite`] === true;
          return padreDesmarcado && hijoMarcado === true && enTramite === false;
        },
        documentacionId: hijo.id,
      });

      // Campo de observaciones para documento alternativo - solo mostrar cuando NO está entregado
      fields.push({
        name: `documento_${hijo.id}_observaciones`,
        label: 'Observaciones',
        type: 'textarea',
        span: 24,
        rows: 2,
        placeholder: 'Ingrese observaciones sobre la entrega del documento...',
        dependencies: [`documento_${doc.id}_entregado`, `documento_${hijo.id}_entregado`],
        watchFields: [`documento_${doc.id}_entregado`, `documento_${hijo.id}_entregado`],
        shouldRender: (formValues) => {
          const padreDesmarcado = formValues?.[`documento_${doc.id}_entregado`] === false;
          const hijoNoMarcado = formValues?.[`documento_${hijo.id}_entregado`] === false;
          return padreDesmarcado && hijoNoMarcado; // Solo mostrar si el padre está desmarcado y el hijo NO está entregado
        },
        documentacionId: hijo.id,
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
  // Crear opciones para el select de documentos (solo documentos de inscripción)
  const documentosInscripcion = documentacionInscripcion
    .filter(doc => doc.tipoDocumento === 'INSCRIPCION')
    .map(doc => ({
      label: doc.nombre,
      value: doc.id,
    }));

  return [
    {
      name: 'alcanceDocumento',
      label: '¿Qué representa este archivo?',
      type: 'radio',
      span: 8,
      required: false,
      options: [
        { label: '1', value: '1' },
        { label: '+1', value: '+1' },
        { label: 'todos', value: 'todos' },
      ],
      rules: [],
    },
    {
      name: 'tipoDocumento',
      label: 'Tipo de Documento',
      type: 'select',
      span: 8,
      required: false,
      placeholder: 'Seleccione el tipo de documento',
      dependencies: ['alcanceDocumento'],
      watchFields: ['alcanceDocumento'],
      // Mostrar lista de documentos si es "1", o texto fijo si es "+1" o "todos"
      shouldRender: (formValues) => {
        const alcance = formValues?.alcanceDocumento;
        return alcance !== undefined && alcance !== null;
      },
      // Opciones dinámicas basadas en alcanceDocumento
      // Se calcularán en FormField usando Form.useWatch
      options: documentosInscripcion, // Valor por defecto, se actualizará dinámicamente
      dynamicOptions: true, // Flag para indicar que las opciones son dinámicas
      getDynamicOptions: (formValues) => {
        const alcance = formValues?.alcanceDocumento;
        if (alcance === '1') {
          // Mostrar lista de documentos individuales
          return documentosInscripcion;
        } else if (alcance === '+1') {
          // Mostrar opción de documento parcial
          return [
            { label: 'Documento Parcial', value: 'DOCUMENTO_PARCIAL' }
          ];
        } else if (alcance === 'todos') {
          // Mostrar opción de documentación completa
          return [
            { label: 'Documentación Completa', value: 'DOCUMENTACION_COMPLETA' }
          ];
        }
        return [];
      },
      rules: [],
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
      watchFields: ['alcanceDocumento'],
      // Solo mostrar si es "1" (documento individual)
      shouldRender: (formValues) => {
        const alcance = formValues?.alcanceDocumento;
        return alcance === '1';
      },
      rules: [],
    },
    {
      name: 'archivoDocumento',
      label: 'Subir Archivo',
      type: 'upload',
      span: 24,
      accept: '.pdf,.jpg,.jpeg,.png',
      maxCount: 1,
      uploadText: 'Seleccionar archivo',
      required: false,
      rules: [],
    },
  ];
};
