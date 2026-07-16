/**
 * DocumentacionStepContent - Contenido del paso Documentación con lógica padre-hijo dinámica
 *
 * Solo se renderiza dentro del Form del wizard (form nunca es null).
 * Observa el campo documentacion del formulario para mostrar documentos hijos
 * cuando un padre se marca como Pendiente (entregado: false).
 */

import { useMemo } from 'react';
import { FormSection } from '@molecules';
import { useDocumentacionProcesadaConForm } from '@application-estudiantes/hooks';
import { createCamposDocumentacionDinamicos } from '@estudiantes/config';

const TIPO_TRASPASO = 'TRASPASO';

function buildDocumentacionParaStepRaw(documentacionRaw, documentacionTraspasoRaw, tipoAdmisionForSteps) {
  const inscripcion = documentacionRaw || [];
  const traspaso = documentacionTraspasoRaw || [];

  if (tipoAdmisionForSteps === TIPO_TRASPASO) {
    const idsTraspaso = new Set(traspaso.map((d) => d.id));
    const comunesInscripcion = inscripcion.filter(
      (d) => (d.documentoPadreId == null || d.documento_padre_id == null) && !idsTraspaso.has(d.id)
    );
    return [...traspaso, ...comunesInscripcion];
  }

  return inscripcion.filter(
    (d) => String(d.tipoDocumento || d.tipo_documento || '').toUpperCase() !== TIPO_TRASPASO
  );
}

const DocumentacionStepContent = ({
  form,
  documentacionRaw = [],
  documentacionTraspasoRaw = [],
  tipoAdmisionForSteps = 'NUEVO',
  section = {},
  resolveOptions = () => [],
  minAge = null,
}) => {
  const documentacionParaStepRaw = useMemo(
    () => buildDocumentacionParaStepRaw(documentacionRaw, documentacionTraspasoRaw, tipoAdmisionForSteps),
    [documentacionRaw, documentacionTraspasoRaw, tipoAdmisionForSteps]
  );

  const { documentacion: documentacionProcesada } = useDocumentacionProcesadaConForm(documentacionParaStepRaw, form);

  const camposCompletos = useMemo(() => {
    const camposDocumentacion = createCamposDocumentacionDinamicos(documentacionProcesada);
    const subseccionObservaciones = {
      type: 'subsection',
      subsectionTitle: 'Observaciones del estudiante',
      conditional: false,
      fields: [
        {
          name: 'observaciones',
          label: 'Observaciones',
          type: 'textarea',
          required: false,
          span: 24,
          placeholder: 'Ingrese observaciones adicionales sobre el estudiante (opcional)',
          maxLength: 1000,
          rows: 4,
        },
      ],
    };
    return [...camposDocumentacion, subseccionObservaciones];
  }, [documentacionProcesada]);

  return (
    <FormSection
      title={section?.title ?? 'DOCUMENTACIÓN REQUERIDA'}
      fields={camposCompletos}
      form={form}
      resolveOptions={resolveOptions}
      minAge={minAge}
      readOnly={false}
    />
  );
};

export default DocumentacionStepContent;
