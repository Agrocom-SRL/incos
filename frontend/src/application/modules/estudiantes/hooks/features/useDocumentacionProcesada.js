/**
 * Hook: useDocumentacionProcesada
 *
 * Single Responsibility: Procesar documentación para el formulario de registro
 *
 * Este hook procesa con valores por defecto (todos entregado: true). No observa el form aquí
 * para evitar Form.useWatch(null) en el primer render. La lógica padre-hijo (mostrar hijos al
 * desmarcar padre) se aplica en el paso de documentación con useDocumentacionProcesadaConForm.
 *
 * Usado por: StudentRegisterProvider
 */

import { useMemo, useRef } from 'react';
import { Form } from 'antd';
import { useDocumentacionDinamica } from './useDocumentacionDinamica';

/**
 * Procesa documentación con valores por defecto (sin observar formulario).
 *
 * @param {Array} documentacion - Array de documentos recuperados del endpoint
 * @param {React.RefObject} [formRef] - No usado aquí (evita useWatch con form null)
 * @returns {Object} Objeto con documentación procesada
 */
export const useDocumentacionProcesada = (documentacion = [], formRef) => {
  const formValues = useMemo(() => ({ documentacion: {} }), []);

  const documentacionProcesadaResult = useDocumentacionDinamica(documentacion, formValues);

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
    if (prev &&
        prev.cantidadDocumentos === current.cantidadDocumentos &&
        prev.cantidadRequeridos === current.cantidadRequeridos &&
        prev.cantidadOpcionales === current.cantidadOpcionales) {
      const prevDocIds = prev.documentacion?.map(d => d.id).sort().join(',') || '';
      const currentDocIds = current.documentacion?.map(d => d.id).sort().join(',') || '';
      if (prevDocIds === currentDocIds) return prev;
    }
    prevResultRef.current = current;
    return current;
  }, [documentacionProcesadaResult]);
};

/**
 * Procesa documentación observando el campo 'documentacion' del formulario.
 * Muestra documentos hijos cuando el padre está en Pendiente (entregado: false).
 * Solo debe llamarse cuando form es no null (p. ej. dentro del paso de documentación).
 *
 * @param {Array} documentacion - Array de documentos (padres e hijos) del catálogo
 * @param {Object} form - Instancia del formulario Ant Design (no null)
 * @returns {Object} Objeto con documentación procesada (incluye hijos cuando padre no entregado)
 */
export const useDocumentacionProcesadaConForm = (documentacion = [], form) => {
  // form debe ser no null; solo usar este hook dentro del paso de documentación donde form existe
  const documentacionForm = Form.useWatch('documentacion', form);
  const formValues = useMemo(
    () => ({ documentacion: documentacionForm ?? {} }),
    [documentacionForm]
  );
  return useDocumentacionDinamica(documentacion, formValues);
};

