/**
 * Paso dedicado: historial de notas (tabla historial_previo).
 * Cabecera de sección estándar (FormWorkspaceSection, sin Card).
 */

import React from 'react';
import { Alert } from 'antd';
import { FormWorkspaceSection } from '@organisms';
import HistorialPrevioNotasSection from './HistorialPrevioNotasSection';

const InscripcionesHistorialPrevioStepContent = ({
  section,
  historialPrevioData,
}) => {
  return (
    <FormWorkspaceSection
      title={section?.title ?? 'Historial de notas'}
      description={section?.description}
      fields={[]}
    >
      {historialPrevioData?.hasRows ? (
        <HistorialPrevioNotasSection
          rows={historialPrevioData.rows}
          loading={historialPrevioData.materiasLoading}
          onGradeChange={historialPrevioData.setGrade}
          onStatusChange={historialPrevioData.setStatus}
          invalidGradeKeys={historialPrevioData.invalidGradeKeys}
        />
      ) : (
        <Alert
          type="info"
          showIcon
          title="Sin materias en el historial de notas"
          description="No hay materias de periodos anteriores pendientes para los periodos seleccionados. Puede finalizar la inscripción si el resto del formulario está completo."
        />
      )}
    </FormWorkspaceSection>
  );
};

export default InscripcionesHistorialPrevioStepContent;
