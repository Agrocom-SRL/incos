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
 * @returns {Object} Objeto con documentación procesada y lista para usar
 */
export const useDocumentacionDinamica = (documentacion = []) => {
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
    const documentosFiltrados = documentacion.filter(
      (documento) => !(documento.esDocumentoSistema === true)
    );

    // Normalizar datos del backend (español) a formato esperado por el frontend (inglés)
    const documentosNormalizados = documentosFiltrados.map((doc) => ({
      id: doc.id,
      name: doc.nombre || doc.name, // Backend devuelve 'nombre', frontend espera 'name'
      description: doc.descripcion || doc.description, // Backend devuelve 'descripcion', frontend espera 'description'
      required: doc.requerido !== undefined ? doc.requerido : (doc.required !== undefined ? doc.required : true),
      esOriginal: doc.esOriginal !== undefined ? doc.esOriginal : false,
      acceptsPhotocopy: doc.aceptaFotocopia !== undefined ? doc.aceptaFotocopia : (doc.acceptsPhotocopy !== undefined ? doc.acceptsPhotocopy : false),
      orden: doc.orden !== undefined ? doc.orden : (doc.order !== undefined ? doc.order : 0),
      esDocumentoSistema: doc.esDocumentoSistema !== undefined ? doc.esDocumentoSistema : false,
      // Mantener otros campos si existen
      ...(doc.tipoDocumento && { tipoDocumento: doc.tipoDocumento }),
      ...(doc.documentoPadreId && { documentoPadreId: doc.documentoPadreId }),
    }));

    // Ordenar documentos por el campo 'orden' (si existe) o por nombre
    const documentosOrdenados = [...documentosNormalizados].sort((a, b) => {
      // Primero por orden (si existe)
      if (a.orden !== undefined && b.orden !== undefined) {
        if (a.orden !== b.orden) {
          return a.orden - b.orden;
        }
      }
      // Luego por nombre
      return (a.name || '').localeCompare(b.name || '');
    });

    // Agregar estado de entregado a cada documento (por defecto false)
    return documentosOrdenados.map((documento) => ({
      ...documento,
      entregado: false, // Estado inicial: no entregado
    }));
  }, [documentacion]);

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

