/**
 * Hook: useDocumentacionProcesada
 * 
 * Single Responsibility: Observar valores del formulario y procesar documentación dinámicamente
 * 
 * Clean Architecture:
 * - Application Layer: Hook compuesto que combina observación de formulario y procesamiento de documentación
 * 
 * SOLID Principles:
 * - Single Responsibility: Solo observa valores del formulario y procesa documentación
 * - Dependency Inversion: Depende de funciones inyectadas (getFormValues)
 * 
 * Este hook:
 * - Observa valores del formulario usando getFormValues (polling cada 200ms)
 * - Pasa los valores del formulario en su estructura original a useDocumentacionDinamica
 * - useDocumentacionDinamica usa addEstadoEntregado para leer el estado de cada documento
 * - Retorna documentación procesada lista para usar
 * 
 * Usado por: StudentRegisterProvider (para procesar documentación reactiva)
 */

import { useEffect, useState, useMemo } from 'react';
import { useDocumentacionDinamica } from './useDocumentacionDinamica';

/**
 * Hook para procesar documentación observando valores del formulario
 * 
 * @param {Array} documentacion - Array de documentos recuperados del endpoint
 * @param {Function} getFormValues - Función para obtener valores del formulario (de useStudentFormHandlers)
 * @returns {Object} Objeto con documentación procesada y lista para usar
 */
export const useDocumentacionProcesada = (documentacion = [], getFormValues) => {
  // Estado para almacenar valores del formulario observados (estructura original)
  // Mantener la estructura original documentacion['doc_id'][field] para que addEstadoEntregado pueda leerla
  const [formValues, setFormValues] = useState({});

  // Observar valores del formulario y pasarlos directamente a useDocumentacionDinamica
  // Usar polling con getFormValues para evitar problemas con hooks condicionales
  useEffect(() => {
    if (!getFormValues) return;

    // Función para actualizar valores del formulario
    const updateFormValues = () => {
      try {
        const values = getFormValues();
        // Extraer solo la sección de documentación, manteniendo la estructura original
        // Estructura: { documentacion: { 'doc_1': { entregado: true, ... }, 'doc_2': { ... } } }
        const documentacionValues = values.documentacion || {};
        
        setFormValues(prev => {
          // Solo actualizar si hay cambios para evitar renders innecesarios
          const prevStr = JSON.stringify(prev);
          const newStr = JSON.stringify(documentacionValues);
          if (prevStr !== newStr) {
            // Pasar la estructura completa del formulario para que addEstadoEntregado pueda leerla
            return { documentacion: documentacionValues };
          }
          return prev;
        });
      } catch (error) {
        // Silenciar errores si el formulario no está registrado aún
      }
    };

    // Actualizar inicialmente
    updateFormValues();

    // Usar un intervalo para observar cambios en los valores del formulario
    // Intervalo de 200ms para mejor reactividad (más rápido que antes)
    const interval = setInterval(updateFormValues, 200);

    return () => clearInterval(interval);
  }, [getFormValues]);

  // Procesar documentación con los valores observados del formulario (estructura original)
  const documentacionProcesadaResult = useDocumentacionDinamica(documentacion, formValues);

  // Retornar solo lo necesario (documentación procesada)
  return useMemo(() => ({
    documentacion: documentacionProcesadaResult.documentacion,
    documentosRequeridos: documentacionProcesadaResult.documentosRequeridos,
    documentosOpcionales: documentacionProcesadaResult.documentosOpcionales,
    cantidadDocumentos: documentacionProcesadaResult.cantidadDocumentos,
    cantidadRequeridos: documentacionProcesadaResult.cantidadRequeridos,
    cantidadOpcionales: documentacionProcesadaResult.cantidadOpcionales,
  }), [documentacionProcesadaResult]);
};

