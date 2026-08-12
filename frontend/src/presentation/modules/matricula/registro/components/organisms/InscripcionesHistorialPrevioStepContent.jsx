/**
 * Paso dedicado: historial de notas (tabla historial_previo).
 */

import React from 'react';
import { Alert } from 'antd';
import { Card } from '@atoms';
import HistorialPrevioNotasSection from './HistorialPrevioNotasSection';

const InscripcionesHistorialPrevioStepContent = ({
  section,
  historialPrevioData,
}) => {
  return (
    <Card
      title={section?.title ?? 'Historial de notas'}
      variant="outlined"
      shadow={false}
      headerColor="primary"
      className="form-section step-historial-previo-section"
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
    </Card>
  );
};

export default InscripcionesHistorialPrevioStepContent;
