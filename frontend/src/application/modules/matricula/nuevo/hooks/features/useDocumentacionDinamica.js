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
 *   - Si el documento padre NO está entregado (false): muestra el padre Y los hijos al lado
 *   - Los hijos aparecen después del padre y heredan características del padre si no las tienen
 * - Ordena documentos por campo 'orden' y luego por nombre
 * - Prepara datos para la generación de campos en la capa de presentación
 * - La validación se realiza sobre los documentos hijos cuando el padre no está entregado
 * 
 * NOTA: La generación de campos se hace en la capa de presentación (config)
 */

import { useMemo } from 'react';
import {
  filterDocumentosSistema,
  normalizeDocumentos,
  separateDocumentosPadresHijos,
  addEstadoEntregadoMultiple,
  applyLogicaPadreHijo,
  ordenarDocumentos,
} from '../helpers/documentacionHelpers';

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

    // Paso 1: Filtrar documentos del sistema (se generan automáticamente)
    const documentosSinSistema = filterDocumentosSistema(documentacion);

    // Paso 2: Normalizar datos del backend (español) a formato esperado por el frontend (inglés)
    const documentosNormalizados = normalizeDocumentos(documentosSinSistema);

    // Paso 3: Separar documentos padres e hijos
    // IMPORTANTE: Mantener ambas listas separadas para poder buscar hijos cuando el padre no esté entregado
    const { padres: documentosPadres, hijos: documentosHijos } = separateDocumentosPadresHijos(documentosNormalizados);

    // Paso 4: Agregar estado de entregado a cada documento
    // Por defecto true (entregado) para ocultar inicialmente los campos de en_tramite y observaciones
    // El componente DocumentoItem escuchará cambios del switch para mostrar/ocultar campos dinámicamente
    const documentosPadresConEstado = addEstadoEntregadoMultiple(documentosPadres, formValues);
    
    // Lista secundaria de hijos: se usa para buscar hijos cuando el padre no está entregado
    // Esta lista se mantiene separada y no se filtra inicialmente
    const documentosHijosConEstado = addEstadoEntregadoMultiple(documentosHijos, formValues);

    // Paso 5: Aplicar lógica de mostrar documentos según estado del padre
    // - Si el padre está entregado (true): mostrar solo el padre
    // - Si el padre NO está entregado (false): mostrar el padre Y los hijos al lado
    // Los hijos aparecen después del padre y heredan características del padre si no las tienen
    // La validación se realiza sobre los documentos hijos cuando el padre no está entregado
    const documentosFinales = applyLogicaPadreHijo(documentosPadresConEstado, documentosHijosConEstado);

    // Paso 6: Ordenar documentos por el campo 'orden' (si existe) o por nombre
    const documentosOrdenados = ordenarDocumentos(documentosFinales);

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

