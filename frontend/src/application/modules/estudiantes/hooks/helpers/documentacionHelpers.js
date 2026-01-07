/**
 * Helpers para procesamiento de documentación
 * 
 * Single Responsibility: Funciones puras para procesar datos de documentación
 * 
 * Clean Architecture:
 * - Application Layer: Helpers específicos para la lógica de procesamiento de documentación
 * 
 * SOLID Principles:
 * - Single Responsibility: Cada función tiene una responsabilidad única
 * - Open/Closed: Extensible agregando nuevos helpers sin modificar existentes
 * 
 * Estas funciones son puras (no tienen efectos secundarios) y pueden ser testeadas fácilmente
 */

/**
 * Filtra documentos del sistema (esDocumentoSistema = true)
 * 
 * @param {Array} documentacion - Array de documentos
 * @returns {Array} Array de documentos sin los del sistema
 */
export const filterDocumentosSistema = (documentacion = []) => {
  if (!documentacion || documentacion.length === 0) {
    return [];
  }
  
  return documentacion.filter(
    (documento) => !(documento.esDocumentoSistema === true)
  );
};

/**
 * Normaliza datos del backend (español) a formato esperado por el frontend (inglés)
 * 
 * @param {Array} documentos - Array de documentos del backend
 * @returns {Array} Array de documentos normalizados
 */
export const normalizeDocumentos = (documentos = []) => {
  if (!documentos || documentos.length === 0) {
    return [];
  }
  
  return documentos.map((doc) => ({
    id: doc.id,
    name: doc.nombre || doc.name, // Backend devuelve 'nombre', frontend espera 'name'
    description: doc.descripcion || doc.description, // Backend devuelve 'descripcion', frontend espera 'description'
    required: doc.requerido !== undefined ? doc.requerido : (doc.required !== undefined ? doc.required : true),
    esOriginal: doc.esOriginal !== undefined ? doc.esOriginal : false,
    acceptsPhotocopy: doc.aceptaFotocopia !== undefined ? doc.aceptaFotocopia : (doc.acceptsPhotocopy !== undefined ? doc.acceptsPhotocopy : false),
    orden: doc.orden !== undefined ? doc.orden : (doc.order !== undefined ? doc.order : 0),
    esDocumentoSistema: doc.esDocumentoSistema !== undefined ? doc.esDocumentoSistema : false,
    documentoPadreId: doc.documentoPadreId !== undefined ? doc.documentoPadreId : null,
    // Mantener otros campos si existen
    ...(doc.tipoDocumento && { tipoDocumento: doc.tipoDocumento }),
  }));
};

/**
 * Separa documentos en padres e hijos
 * 
 * @param {Array} documentos - Array de documentos normalizados
 * @returns {Object} Objeto con {padres, hijos}
 */
export const separateDocumentosPadresHijos = (documentos = []) => {
  if (!documentos || documentos.length === 0) {
    return { padres: [], hijos: [] };
  }
  
  const padres = documentos.filter(
    (doc) => doc.documentoPadreId === null || doc.documentoPadreId === undefined
  );
  
  const hijos = documentos.filter(
    (doc) => doc.documentoPadreId !== null && doc.documentoPadreId !== undefined
  );
  
  return { padres, hijos };
};

/**
 * Agrega estado de entregado a un documento basándose en los valores del formulario
 * 
 * @param {Object} documento - Documento al que agregar estado
 * @param {Object} formValues - Valores actuales del formulario
 * @returns {Object} Documento con estado de entregado agregado
 */
export const addEstadoEntregado = (documento, formValues = {}) => {
  // Buscar en la estructura: documentacion['doc_id'].entregado (objeto con keys con prefijo 'doc_')
  const docKey = `doc_${documento.id}`;
  const entregadoDelForm = formValues.documentacion?.[docKey]?.entregado;
  
  return {
    ...documento,
    // Si hay valor en el formulario, usarlo; si no, por defecto true (entregado)
    // El switch debe iniciar en true, y cuando el usuario lo cambie a false, se mostrarán los hijos
    entregado: entregadoDelForm !== undefined ? entregadoDelForm : true,
  };
};

/**
 * Agrega estado de entregado a múltiples documentos
 * 
 * @param {Array} documentos - Array de documentos
 * @param {Object} formValues - Valores actuales del formulario
 * @returns {Array} Array de documentos con estado de entregado
 */
export const addEstadoEntregadoMultiple = (documentos = [], formValues = {}) => {
  if (!documentos || documentos.length === 0) {
    return [];
  }
  
  return documentos.map((documento) => addEstadoEntregado(documento, formValues));
};

/**
 * Hereda características del padre al hijo si el hijo no las tiene
 * 
 * @param {Object} hijo - Documento hijo
 * @param {Object} padre - Documento padre
 * @returns {Object} Documento hijo con características heredadas
 */
export const heredarCaracteristicasPadre = (hijo, padre) => {
  return {
    ...hijo,
    // Heredar características del padre si el hijo no las tiene o están vacías
    description: hijo.description || padre.description || null,
    required: hijo.required !== undefined ? hijo.required : (padre.required !== undefined ? padre.required : true),
    acceptsPhotocopy: hijo.acceptsPhotocopy !== undefined ? hijo.acceptsPhotocopy : (padre.acceptsPhotocopy !== undefined ? padre.acceptsPhotocopy : false),
    esOriginal: hijo.esOriginal !== undefined ? hijo.esOriginal : (padre.esOriginal !== undefined ? padre.esOriginal : false),
    // Mantener el orden del hijo si existe, sino usar el del padre
    orden: hijo.orden !== undefined ? hijo.orden : (padre.orden !== undefined ? padre.orden : 0),
  };
};

/**
 * Aplica la lógica de mostrar documentos según el estado del padre
 * - Si el padre está entregado (true): muestra solo el padre
 * - Si el padre NO está entregado (false): muestra el padre Y los hijos al lado
 * 
 * @param {Array} documentosPadres - Array de documentos padres con estado
 * @param {Array} documentosHijos - Array de documentos hijos con estado (lista secundaria)
 * @returns {Array} Array de documentos finales a mostrar
 */
export const applyLogicaPadreHijo = (documentosPadres = [], documentosHijos = []) => {
  if (!documentosPadres || documentosPadres.length === 0) {
    return [];
  }
  
  return documentosPadres.flatMap((padre) => {
    // Si el padre está entregado, mostrar solo el padre
    if (padre.entregado === true) {
      return [padre];
    }

    // Si el padre NO está entregado, buscar sus hijos para mostrarlos al lado
    const hijosDelPadre = documentosHijos.filter(
      (hijo) => hijo.documentoPadreId === padre.id
    );

    // Si tiene hijos, retornar el padre Y los hijos (el padre primero, luego los hijos)
    if (hijosDelPadre.length > 0) {
      const hijosConCaracteristicasHeredadas = hijosDelPadre.map((hijo) =>
        heredarCaracteristicasPadre(hijo, padre)
      );
      
      // Retornar el padre primero, luego los hijos
      return [padre, ...hijosConCaracteristicasHeredadas];
    }

    // Si no tiene hijos, retornar solo el padre
    return [padre];
  });
};

/**
 * Ordena documentos por campo 'orden' (mantiene el orden original si no tiene orden)
 * 
 * @param {Array} documentos - Array de documentos a ordenar
 * @returns {Array} Array de documentos ordenados por 'orden' (mantiene orden original si no tiene orden)
 */
export const ordenarDocumentos = (documentos = []) => {
  if (!documentos || documentos.length === 0) {
    return [];
  }
  
  return [...documentos].sort((a, b) => {
    // Solo ordenar por 'orden' si ambos tienen el campo definido
    if (a.orden !== undefined && b.orden !== undefined) {
      return a.orden - b.orden;
    }
    // Si solo uno tiene 'orden', el que tiene orden va primero
    if (a.orden !== undefined && b.orden === undefined) {
      return -1;
    }
    if (a.orden === undefined && b.orden !== undefined) {
      return 1;
    }
    // Si ninguno tiene 'orden', mantener el orden original (retornar 0)
    return 0;
  });
};

