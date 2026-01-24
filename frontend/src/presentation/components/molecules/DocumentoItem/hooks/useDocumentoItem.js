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
 * - Determina nombres de campos adicionales (en_tramite, observaciones)
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
 * @param {boolean} documento.acceptsPhotocopy - Si acepta fotocopia
 * @param {boolean} documento.entregado - Estado de entrega del documento
 * @returns {Object} Objeto con datos procesados para renderizado
 */
export const useDocumentoItem = (documento) => {
  /**
   * Base path para los campos del documento usando array notation
   * Formato: ['documentacion', 'doc_id'] para que los datos se guarden como documentacion['doc_id'] (objeto, no array)
   * Usar prefijo 'doc_' garantiza que Ant Design siempre cree un objeto, nunca un array
   */
  const basePath = useMemo(() => {
    return ['documentacion', `doc_${documento.id}`];
  }, [documento.id]);

  /**
   * Nombre del campo principal (entregado) en el formulario
   * Formato: ['documentacion', id, 'entregado']
   */
  const fieldName = useMemo(() => {
    return [...basePath, 'entregado'];
  }, [basePath]);

  /**
   * Título del documento (sin incluir "Requerido" en el texto, se muestra como icono)
   */
  const tituloDocumento = useMemo(() => {
    return documento.name || '';
  }, [documento.name]);

  /**
   * Determina si debe mostrar el indicador de fotocopia
   */
  const mostrarIndicadorFotocopia = useMemo(() => {
    return documento.acceptsPhotocopy === true;
  }, [documento.acceptsPhotocopy]);

  /**
   * Valor por defecto del switch (estado de entrega)
   * Usa el estado entregado del documento (por defecto false para mostrar hijos cuando el padre no está marcado)
   * El componente DocumentoItem usa Form.useWatch para escuchar cambios del switch y mostrar/ocultar campos dinámicamente
   */
  const defaultChecked = useMemo(() => {
    // Usar el estado entregado del documento
    // Si es undefined o null, usar false para que los hijos se muestren cuando el padre no está marcado
    return documento.entregado === true;
  }, [documento.entregado]);

  /**
   * Nombre del campo para en_tramite
   * Formato: ['documentacion', id, 'en_tramite']
   */
  const fieldNameEnTramite = useMemo(() => {
    return [...basePath, 'en_tramite'];
  }, [basePath]);

  /**
   * Nombre del campo para observaciones
   * Formato: ['documentacion', id, 'observaciones']
   */
  const fieldNameObservaciones = useMemo(() => {
    return [...basePath, 'observaciones'];
  }, [basePath]);

  /**
   * Valor inicial de observaciones (motivo de no entrega).
   * Se usa al editar para mostrar por qué no se entregó el documento.
   */
  const initialObservaciones = useMemo(() => {
    const v = documento.observaciones;
    return v != null && v !== '' ? String(v) : undefined;
  }, [documento.observaciones]);

  return {
    fieldName,
    fieldNameEnTramite,
    fieldNameObservaciones,
    initialObservaciones,
    tituloDocumento,
    esRequerido: documento.required === true,
    mostrarIndicadorFotocopia,
    defaultChecked,
  };
};

