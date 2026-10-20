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

import { useMemo } from 'react';
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

  const {
    documentacion: docs,
    documentosRequeridos,
    documentosOpcionales,
    cantidadDocumentos,
    cantidadRequeridos,
    cantidadOpcionales,
  } = documentacionProcesadaResult;

  // useDocumentacionDinamica devuelve objetos/arrays nuevos en cada render: se estabiliza por
  // valor (cantidades + ids de documentos) para no recrear el contexto del provider.
  const docIdsKey = docs?.map((d) => d.id).sort().join(',') || '';

  return useMemo(() => ({
    documentacion: docs,
    documentosRequeridos,
    documentosOpcionales,
    cantidadDocumentos,
    cantidadRequeridos,
    cantidadOpcionales,
    // eslint-disable-next-line react-hooks/exhaustive-deps -- estabiliza por valor: los arrays cambian de referencia en cada render
  }), [docIdsKey, cantidadDocumentos, cantidadRequeridos, cantidadOpcionales]);
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

