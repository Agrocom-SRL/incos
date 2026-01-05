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
 * - Determina nombres de campos adicionales (en_tramite, observaciones, es_original)
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
   * Por defecto es true (entregado) para ocultar inicialmente los campos de en_tramite y observaciones
   * El componente DocumentoItem usa Form.useWatch para escuchar cambios del switch y mostrar/ocultar campos dinámicamente
   */
  const defaultChecked = useMemo(() => {
    // Usar el estado entregado del documento (por defecto true desde useDocumentacionDinamica)
    // Esto oculta inicialmente los campos de en_tramite y observaciones
    // Cuando el usuario cambie el switch, Form.useWatch detectará el cambio y mostrará/ocultará los campos
    return documento.entregado === true;
  }, [documento.entregado]);

  /**
   * Nombre del campo para en_tramite
   */
  const fieldNameEnTramite = useMemo(() => {
    return `documento_${documento.id}_en_tramite`;
  }, [documento.id]);

  /**
   * Nombre del campo para observaciones
   */
  const fieldNameObservaciones = useMemo(() => {
    return `documento_${documento.id}_observaciones`;
  }, [documento.id]);

  /**
   * Nombre del campo para es_original
   */
  const fieldNameEsOriginal = useMemo(() => {
    return `documento_${documento.id}_es_original`;
  }, [documento.id]);

  /**
   * Determina si debe mostrar el campo es_original
   * Solo se muestra si acceptsPhotocopy es true (acepta fotocopia)
   */
  const mostrarCampoEsOriginal = useMemo(() => {
    return documento.acceptsPhotocopy === true;
  }, [documento.acceptsPhotocopy]);

  return {
    fieldName,
    fieldNameEnTramite,
    fieldNameObservaciones,
    fieldNameEsOriginal,
    tituloDocumento,
    esRequerido: documento.required === true,
    mostrarIndicadorOriginal,
    mostrarIndicadorFotocopia,
    mostrarCampoEsOriginal,
    defaultChecked,
  };
};

