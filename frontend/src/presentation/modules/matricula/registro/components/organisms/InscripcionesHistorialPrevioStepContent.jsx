/**
 * Paso dedicado: historial de notas (tabla historial_previo).
 * Cabecera de sección estándar (FormWorkspaceSection, sin Card).
 *
 * Las filas salen del contexto de matrícula: las materias que el estudiante NO
 * cursa esta gestión en los periodos hasta el más alto que sí cursa, más los
 * bloqueados por traspaso (§4-C4, alcance por materia). Sin filas se muestra un
 * estado vacío discreto (sin Alert fijo).
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
          description="No hay materias pendientes de registrar: el estudiante cursa todas las asignaturas de los periodos seleccionados. Continúe con el paso siguiente."
        />
      )}
    </FormWorkspaceSection>
  );
};

export default InscripcionesHistorialPrevioStepContent;
