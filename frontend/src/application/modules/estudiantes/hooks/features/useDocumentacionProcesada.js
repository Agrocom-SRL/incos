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
 * - Observa valores del formulario usando getFormValues
 * - Transforma estructura documentacion[id][field] a documento_id_field
 * - Procesa documentación usando useDocumentacionDinamica
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
  // Estado para almacenar valores del formulario observados y transformados
  const [formValuesDocumentacion, setFormValuesDocumentacion] = useState({});

  // Observar valores del formulario y transformarlos para useDocumentacionDinamica
  useEffect(() => {
    if (!getFormValues) return;

    // Función para actualizar valores de documentación
    const updateDocumentacionValues = () => {
      try {
        const values = getFormValues();
        // Extraer solo los valores de documentación
        const docValues = {};
        if (values.documentacion) {
          // Convertir estructura documentacion[id][field] a documento_id_field
          // Esto es lo que espera useDocumentacionDinamica
          Object.keys(values.documentacion).forEach(id => {
            const docData = values.documentacion[id];
            if (docData && typeof docData === 'object') {
              Object.keys(docData).forEach(field => {
                docValues[`documento_${id}_${field}`] = docData[field];
              });
            }
          });
        }
        setFormValuesDocumentacion(prev => {
          // Solo actualizar si hay cambios para evitar renders innecesarios
          const prevStr = JSON.stringify(prev);
          const newStr = JSON.stringify(docValues);
          if (prevStr !== newStr) {
            return docValues;
          }
          return prev;
        });
      } catch (error) {
        // Silenciar errores si el formulario no está registrado aún
      }
    };

    // Actualizar inicialmente
    updateDocumentacionValues();

    // Usar un intervalo para observar cambios en los valores del formulario
    // Intervalo de 300ms para balancear reactividad y performance
    const interval = setInterval(updateDocumentacionValues, 300);

    return () => clearInterval(interval);
  }, [getFormValues]);

  // Procesar documentación con los valores observados del formulario
  const documentacionProcesadaResult = useDocumentacionDinamica(documentacion, formValuesDocumentacion);

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

