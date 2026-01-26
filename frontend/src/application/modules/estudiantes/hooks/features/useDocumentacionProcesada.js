/**
 * Hook: useDocumentacionProcesada
 * 
 * Single Responsibility: Procesar documentación para el formulario de registro
 * 
 * Clean Architecture:
 * - Application Layer: Hook que procesa documentación sin observar valores del formulario
 * 
 * SOLID Principles:
 * - Single Responsibility: Solo procesa documentación con valores por defecto
 * - Dependency Inversion: No depende de valores del formulario en tiempo real
 * 
 * Este hook:
 * - Procesa documentación con valores por defecto (todos entregado: true inicialmente)
 * - NO observa valores del formulario en tiempo real (evita lentitud en campos de texto)
 * - Los valores reales se capturan solo al finalizar el registro (en getFormValues)
 * - Retorna documentación procesada lista para generar campos dinámicos
 * 
 * NOTA: Eliminamos la observación en tiempo real porque:
 * 1. Los datos solo se necesitan al finalizar el registro
 * 2. No hay necesidad de procesar mientras el usuario escribe
 * 3. Evita completamente la lentitud en campos de texto
 * 
 * Usado por: StudentRegisterProvider (para procesar documentación estática)
 */

import { useMemo, useRef } from 'react';
import { useDocumentacionDinamica } from './useDocumentacionDinamica';

/**
 * Hook para procesar documentación sin observar valores del formulario
 * 
 * @param {Array} documentacion - Array de documentos recuperados del endpoint
 * @param {Object} formRef - Ref que contiene la instancia del formulario (NO se usa para observación)
 * @returns {Object} Objeto con documentación procesada y lista para usar
 */
export const useDocumentacionProcesada = (documentacion = [], formRef) => {
  // Procesar documentación con valores por defecto (todos entregado: true)
  // NO observamos valores del formulario en tiempo real
  // Los valores reales se capturarán solo al finalizar el registro en getFormValues
  // useDocumentacionDinamica usará valores por defecto cuando formValues.documentacion esté vacío
  const formValues = useMemo(() => {
    // Retornar objeto vacío - useDocumentacionDinamica usará valores por defecto (entregado: true)
    return { documentacion: {} };
  }, []); // Sin dependencias - valores estáticos, no cambian

  // Procesar documentación con valores por defecto (sin observar formulario)
  const documentacionProcesadaResult = useDocumentacionDinamica(documentacion, formValues);

  // MANTENER REFERENCIA ESTABLE
  // Comparar valores, no solo referencias, para evitar recálculos innecesarios
  const prevResultRef = useRef(null);
  
  return useMemo(() => {
    const current = {
      documentacion: documentacionProcesadaResult.documentacion,
      documentosRequeridos: documentacionProcesadaResult.documentosRequeridos,
      documentosOpcionales: documentacionProcesadaResult.documentosOpcionales,
      cantidadDocumentos: documentacionProcesadaResult.cantidadDocumentos,
      cantidadRequeridos: documentacionProcesadaResult.cantidadRequeridos,
      cantidadOpcionales: documentacionProcesadaResult.cantidadOpcionales,
    };

    const prev = prevResultRef.current;
    
    // Comparar valores, no solo referencias
    // Para arrays, comparar por cantidad y IDs (si tienen)
    if (prev &&
        prev.cantidadDocumentos === current.cantidadDocumentos &&
        prev.cantidadRequeridos === current.cantidadRequeridos &&
        prev.cantidadOpcionales === current.cantidadOpcionales) {
      // Comparar arrays por longitud y IDs si están disponibles
      const prevDocIds = prev.documentacion?.map(d => d.id).sort().join(',') || '';
      const currentDocIds = current.documentacion?.map(d => d.id).sort().join(',') || '';
      
      if (prevDocIds === currentDocIds) {
        return prev;
      }
    }

    prevResultRef.current = current;
    return current;
  }, [documentacionProcesadaResult]);
};

