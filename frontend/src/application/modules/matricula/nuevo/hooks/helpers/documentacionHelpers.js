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
    acceptsPhotocopy: doc.aceptaFotocopia !== undefined ? doc.aceptaFotocopia : (doc.acceptsPhotocopy !== undefined ? doc.acceptsPhotocopy : false),
    orden: doc.orden !== undefined ? doc.orden : (doc.order !== undefined ? doc.order : 0),
    esDocumentoSistema: doc.esDocumentoSistema !== undefined ? doc.esDocumentoSistema : false,
    documentoPadreId: doc.documentoPadreId !== undefined ? doc.documentoPadreId : (doc.documento_padre_id !== undefined ? doc.documento_padre_id : null),
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
 * Agrega estado de entregado, en trámite y observaciones a un documento basándose en los valores del formulario
 * 
 * @param {Object} documento - Documento al que agregar estado
 * @param {Object} formValues - Valores actuales del formulario
 * @returns {Object} Documento con estado agregado (entregado, en_tramite, observaciones)
 */
export const addEstadoEntregado = (documento, formValues = {}) => {
  // Buscar en la estructura: documentacion['doc_id'].* (objeto con keys con prefijo 'doc_')
  const docKey = `doc_${documento.id}`;
  const docForm = formValues.documentacion?.[docKey];
  const entregadoDelForm = docForm?.entregado;
  const enTramiteDelForm = docForm?.en_tramite;
  const observacionesDelForm = docForm?.observaciones;

  return {
    ...documento,
    // Si hay valor en el formulario, usarlo; si no, por defecto true (entregado)
    entregado: entregadoDelForm !== undefined ? entregadoDelForm : true,
    en_tramite: enTramiteDelForm !== undefined ? enTramiteDelForm : false,
    observaciones: observacionesDelForm ?? null,
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
    // Si el padre está entregado (true o 1 desde backend/form), mostrar solo el padre
    const padreEntregado = padre.entregado === true || padre.entregado === 1;
    if (padreEntregado) {
      return [padre];
    }

    // Si el padre NO está entregado, buscar sus hijos para mostrarlos al lado
    const padreId = Number(padre.id);
    const hijosDelPadre = documentosHijos.filter(
      (hijo) => Number(hijo.documentoPadreId ?? hijo.documento_padre_id) === padreId
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
 * Devuelve el catálogo de documentación a usar al filtrar valores del form en edición.
 * Debe incluir todos los documentos que pueden estar en el form (padres e hijos), con
 * documentoPadreId/documento_padre_id, para que al cargar en edición se oculten los hijos
 * cuyo padre está marcado como entregado (sin importar tipo de admisión).
 * Para TRASPASO: inscripción completa (incluye hijos, ej. doc 6) + documentación traspaso.
 *
 * @param {string} tipoAdmision - NUEVO, ANTIGUO, TRASPASO, TRANSITABILIDAD
 * @param {Array} documentacionRaw - Catálogo de documentación inscripción (padres e hijos)
 * @param {Array} documentacionTraspasoRaw - Catálogo de documentación traspaso
 * @returns {Array} Catálogo a pasar a filterDocumentacionOcultarHijosCuandoPadreEntregado
 */
export const getDocumentacionCatalogForEdit = (tipoAdmision = '', documentacionRaw = [], documentacionTraspasoRaw = []) => {
  const tipo = String(tipoAdmision || '').toUpperCase();
  const inscripcion = documentacionRaw || [];
  if (tipo !== 'TRASPASO') {
    return inscripcion;
  }
  const traspaso = documentacionTraspasoRaw || [];
  // Incluir todos los documentos de inscripción (padres e hijos) + traspaso, para que
  // la regla "ocultar hijo si padre entregado" aplique a todos (ej. doc 6 hijo de doc 1).
  return [...traspaso, ...inscripcion];
};

/**
 * Filtra el objeto documentacion del formulario para no incluir hijos cuando el padre está entregado.
 * Así, al cargar en edición, el form no tendrá doc_6 si doc_1.entregado es true y la UI aplicará
 * correctamente "solo padre visible cuando entregado".
 * Para TRASPASO debe usarse un catálogo que incluya documentacionTraspaso (getDocumentacionCatalogForEdit).
 *
 * @param {Object} documentacionForm - Objeto documentacion del form (doc_X: { entregado, ... })
 * @param {Array} documentacionCatalog - Catálogo raw (con id y documentoPadreId/documento_padre_id)
 * @returns {Object} Copia de documentacionForm sin las keys de hijos cuyo padre está entregado
 */
export const filterDocumentacionOcultarHijosCuandoPadreEntregado = (documentacionForm = {}, documentacionCatalog = []) => {
  if (!documentacionForm || typeof documentacionForm !== 'object') return documentacionForm;
  if (!documentacionCatalog || documentacionCatalog.length === 0) return { ...documentacionForm };

  const catalogById = new Map(documentacionCatalog.map((d) => [Number(d.id), d]));
  const result = { ...documentacionForm };

  for (const key of Object.keys(result)) {
    if (!key.startsWith('doc_')) continue;
    const docId = parseInt(key.replace('doc_', ''), 10);
    if (Number.isNaN(docId)) continue;
    const doc = catalogById.get(docId);
    if (!doc) continue;
    const padreId = Number(doc.documentoPadreId ?? doc.documento_padre_id);
    if (Number.isNaN(padreId) || padreId === 0) continue;
    const padreKey = `doc_${padreId}`;
    const padreEntregadoVal = result[padreKey]?.entregado;
    const padreEntregado = padreEntregadoVal === true || padreEntregadoVal === 1;
    if (padreEntregado) delete result[key];
  }

  return result;
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

