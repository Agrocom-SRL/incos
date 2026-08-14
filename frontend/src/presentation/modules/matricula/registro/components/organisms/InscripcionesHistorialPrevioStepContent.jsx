/**
 * Paso dedicado: historial de notas (tabla historial_previo).
 * Cabecera de sección estándar (FormWorkspaceSection, sin Card).
 *
 * Las filas salen del contexto de matrícula (todos los periodos anteriores al
 * mínimo seleccionado + los bloqueados por traspaso, §4-C4); sin filas se
 * muestra un estado vacío discreto (sin Alert fijo).
 */

import React from 'react';
import { Empty } from 'antd';
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
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No hay materias de periodos anteriores para registrar. Puede finalizar la inscripción si el resto del formulario está completo."
        />
      )}
    </FormWorkspaceSection>
  );
};

export default InscripcionesHistorialPrevioStepContent;
