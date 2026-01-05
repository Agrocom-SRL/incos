/**
 * Hook: useDocumentacionDinamica
 * 
 * Single Responsibility: Procesar y preparar documentación para el formulario de registro
 * 
 * Clean Architecture:
 * - Application Layer: Hook específico para la lógica de procesamiento de documentación
 * 
 * SOLID Principles:
 * - Single Responsibility: Solo procesa y prepara datos de documentación
 * 
 * Este hook:
 * - Filtra documentos del sistema (esDocumentoSistema = true)
 * - Maneja la lógica de documentos padre-hijo:
 *   - Si el documento padre está entregado (true): muestra solo el padre
 *   - Si el documento padre NO está entregado (false): muestra los documentos hijos en lugar del padre
 * - Ordena documentos por campo 'orden' y luego por nombre
 * - Prepara datos para la generación de campos en la capa de presentación
 * 
 * NOTA: La generación de campos se hace en la capa de presentación (config)
 */

import { useMemo } from 'react';

/**
 * Hook para procesar documentación dinámica
 * 
 * @param {Array} documentacion - Array de documentos recuperados del endpoint
 * @param {Object} formValues - Valores actuales del formulario (opcional, para reactividad)
 * @returns {Object} Objeto con documentación procesada y lista para usar
 */
export const useDocumentacionDinamica = (documentacion = [], formValues = {}) => {
  /**
   * Procesa la documentación: filtra, ordena y agrega estado de entregado
   */
  const documentacionProcesada = useMemo(() => {
    // Si no hay documentos, retornar array vacío
    if (!documentacion || documentacion.length === 0) {
      return [];
    }

    // Filtrar documentos del sistema (se generan automáticamente)
    // El backend puede devolver 'esDocumentoSistema' o el frontend puede esperar otro nombre
    const documentosSinSistema = documentacion.filter(
      (documento) => !(documento.esDocumentoSistema === true)
    );

    // Normalizar datos del backend (español) a formato esperado por el frontend (inglés)
    const documentosNormalizados = documentosSinSistema.map((doc) => ({
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

    // Separar documentos padres (documentoPadreId === null) e hijos (documentoPadreId !== null)
    const documentosPadres = documentosNormalizados.filter(
      (doc) => doc.documentoPadreId === null || doc.documentoPadreId === undefined
    );
    const documentosHijos = documentosNormalizados.filter(
      (doc) => doc.documentoPadreId !== null && doc.documentoPadreId !== undefined
    );

    // Agregar estado de entregado a cada documento
    // Por defecto true (entregado) para ocultar inicialmente los campos de en_tramite y observaciones
    // El componente DocumentoItem escuchará cambios del switch para mostrar/ocultar campos dinámicamente
    const documentosPadresConEstado = documentosPadres.map((documento) => {
      const fieldName = `documento_${documento.id}`;
      const entregadoDelForm = formValues[fieldName];
      return {
        ...documento,
        // Si hay valor en el formulario, usarlo; si no, por defecto true (entregado)
        // Esto oculta inicialmente los campos de en_tramite y observaciones
        entregado: entregadoDelForm !== undefined ? entregadoDelForm : true,
      };
    });

    const documentosHijosConEstado = documentosHijos.map((documento) => {
      const fieldName = `documento_${documento.id}`;
      const entregadoDelForm = formValues[fieldName];
      return {
        ...documento,
        // Si hay valor en el formulario, usarlo; si no, por defecto true (entregado)
        // Esto oculta inicialmente los campos de en_tramite y observaciones
        entregado: entregadoDelForm !== undefined ? entregadoDelForm : true,
      };
    });

    // Lógica de mostrar documentos según estado del padre:
    // - Si el padre está entregado (true): mostrar solo el padre
    // - Si el padre NO está entregado (false): mostrar los hijos en lugar del padre
    // Los hijos heredan características del padre si no las tienen
    const documentosFinales = documentosPadresConEstado.flatMap((padre) => {
      // Si el padre está entregado, mostrar solo el padre
      if (padre.entregado === true) {
        return [padre];
      }

      // Si el padre NO está entregado, buscar y mostrar sus hijos
      const hijosDelPadre = documentosHijosConEstado.filter(
        (hijo) => hijo.documentoPadreId === padre.id
      );

      // Si tiene hijos, retornar los hijos con características heredadas del padre
      if (hijosDelPadre.length > 0) {
        return hijosDelPadre.map((hijo) => ({
          ...hijo,
          // Heredar características del padre si el hijo no las tiene o están vacías
          description: hijo.description || padre.description || null,
          required: hijo.required !== undefined ? hijo.required : (padre.required !== undefined ? padre.required : true),
          acceptsPhotocopy: hijo.acceptsPhotocopy !== undefined ? hijo.acceptsPhotocopy : (padre.acceptsPhotocopy !== undefined ? padre.acceptsPhotocopy : false),
          esOriginal: hijo.esOriginal !== undefined ? hijo.esOriginal : (padre.esOriginal !== undefined ? padre.esOriginal : false),
          // Mantener el orden del hijo si existe, sino usar el del padre
          orden: hijo.orden !== undefined ? hijo.orden : (padre.orden !== undefined ? padre.orden : 0),
        }));
      }

      // Si no tiene hijos, retornar el padre
      return [padre];
    });

    // Ordenar documentos por el campo 'orden' (si existe) o por nombre
    const documentosOrdenados = [...documentosFinales].sort((a, b) => {
      // Primero por orden (si existe)
      if (a.orden !== undefined && b.orden !== undefined) {
        if (a.orden !== b.orden) {
          return a.orden - b.orden;
        }
      }
      // Luego por nombre
      return (a.name || '').localeCompare(b.name || '');
    });

    return documentosOrdenados;
  }, [documentacion, formValues]);

  /**
   * Obtiene solo los documentos requeridos
   */
  const documentosRequeridos = useMemo(() => {
    return documentacionProcesada.filter((doc) => doc.required === true);
  }, [documentacionProcesada]);

  /**
   * Obtiene solo los documentos opcionales
   */
  const documentosOpcionales = useMemo(() => {
    return documentacionProcesada.filter((doc) => doc.required !== true);
  }, [documentacionProcesada]);

  return {
    documentacion: documentacionProcesada,
    documentosRequeridos,
    documentosOpcionales,
    cantidadDocumentos: documentacionProcesada.length,
    cantidadRequeridos: documentosRequeridos.length,
    cantidadOpcionales: documentosOpcionales.length,
  };
};

