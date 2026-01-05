/**
 * Hook: useDocumentoItem
 * 
 * Single Responsibility: Procesar y preparar datos del documento para renderizado
 * 
 * Clean Architecture:
 * - Presentation Layer: Hook específico del componente DocumentoItem
 * - Co-localizado: Está junto al componente que lo usa (Atomic Design)
 * 
 * SOLID Principles:
 * - Single Responsibility: Solo procesa datos del documento
 * - Dependency Inversion: Depende de abstracciones (props del documento)
 * 
 * Este hook:
 * - Construye el nombre del campo del formulario
 * - Genera los indicadores del documento (requerido, original, acepta fotocopia)
 * - Construye el título con indicadores
 * - Determina qué indicadores visuales mostrar
 */

import { useMemo } from 'react';

/**
 * Hook para procesar datos del documento
 * 
 * @param {Object} documento - Objeto con datos del documento
 * @param {number} documento.id - ID del documento
 * @param {string} documento.name - Nombre del documento
 * @param {string} documento.description - Descripción del documento
 * @param {boolean} documento.required - Si el documento es requerido
 * @param {boolean} documento.esOriginal - Si debe ser original
 * @param {boolean} documento.acceptsPhotocopy - Si acepta fotocopia
 * @param {boolean} documento.entregado - Estado de entrega del documento
 * @returns {Object} Objeto con datos procesados para renderizado
 */
export const useDocumentoItem = (documento) => {
  /**
   * Nombre del campo en el formulario
   */
  const fieldName = useMemo(() => {
    return `documento_${documento.id}`;
  }, [documento.id]);

  /**
   * Título del documento (sin incluir "Requerido" en el texto, se muestra como icono)
   */
  const tituloDocumento = useMemo(() => {
    return documento.name || '';
  }, [documento.name]);

  /**
   * Determina si debe mostrar el indicador de original
   */
  const mostrarIndicadorOriginal = useMemo(() => {
    return documento.esOriginal === true;
  }, [documento.esOriginal]);

  /**
   * Determina si debe mostrar el indicador de fotocopia
   */
  const mostrarIndicadorFotocopia = useMemo(() => {
    return !documento.esOriginal && documento.acceptsPhotocopy === true;
  }, [documento.esOriginal, documento.acceptsPhotocopy]);

  /**
   * Valor por defecto del switch (estado de entrega)
   */
  const defaultChecked = useMemo(() => {
    return documento.entregado || false;
  }, [documento.entregado]);

  return {
    fieldName,
    tituloDocumento,
    esRequerido: documento.required === true,
    mostrarIndicadorOriginal,
    mostrarIndicadorFotocopia,
    defaultChecked,
  };
};

