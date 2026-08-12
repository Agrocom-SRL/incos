/**
 * InscripcionesCarreraStepContent - Contenido completo del paso "Seleccionar carrera" (step 1)
 *
 * Responsabilidad del módulo inscripciones: Card + fila de dos alertas + selección de carrera.
 * El WizardForm genérico solo invoca renderSectionContent; no conoce esta UI.
 *
 * @param {Object} form - Instancia del formulario
 * @param {Object} section - Config de la sección (title, fields enriquecidos)
 * @param {Array} carreras - Lista de carreras
 * @param {boolean} carrerasLoading
 * @param {string} carrerasError
 * @param {Object} selectedStudent - Estudiante seleccionado (tipoAdmision, careerId)
 * @param {Function} onCarreraChange
 */

import React from 'react';
import { Row, Col, Alert } from 'antd';
import { Card } from '@atoms';
import InscripcionesCarreraSelectionSection from './InscripcionesCarreraSelectionSection';

const InscripcionesCarreraStepContent = ({
  form,
  section,
  carreras = [],
  carrerasLoading = false,
  carrerasError = null,
  selectedStudent = null,
  onCarreraChange,
  readOnly = false,
}) => {
  const esAntiguo = selectedStudent?.tipoAdmision === 'ANTIGUO';
  const estudianteField = section?.fields?.find((f) => f.name === 'estudianteSeleccionado');
  // En modo edición (readOnly) no se puede cambiar estudiante ni carrera
  const disabledCareerIds = readOnly && carreras.length
    ? carreras.map((c) => c.id)
    : esAntiguo && selectedStudent?.careerId
      ? carreras
          .map((c) => c.id)
          .filter(
            (id) => id !== selectedStudent.careerId && id !== Number(selectedStudent.careerId)
          )
      : null;

  // Fijar valor de carrera en el form cuando es estudiante antiguo (para submit)
  React.useEffect(() => {
    if (form && esAntiguo && selectedStudent?.careerId != null) {
      form.setFieldsValue({ carrera: selectedStudent.careerId });
    }
  }, [form, esAntiguo, selectedStudent?.careerId]);

  return (
    <Card
      title={section?.title}
      variant="outlined"
      shadow={false}
      headerColor="primary"
      className="form-section"
    >
      <Row gutter={[24, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={12}>
          {estudianteField && !estudianteField.hidden && (
            <Alert
              title={estudianteField.message}
              description={estudianteField.description}
              type={estudianteField.alertType || 'success'}
              showIcon
              style={{ borderRadius: 8 }}
            />
          )}
        </Col>
        <Col xs={24} md={12}>
          {readOnly ? (
            <Alert
              title="Modo edición"
              description="El estudiante y la carrera no se modifican aquí. Puede cambiar periodo, materias y paralelo en los siguientes pasos."
              type="info"
              showIcon
              style={{ borderRadius: 8 }}
            />
          ) : esAntiguo ? (
            <Alert
              title="Estudiante antiguo"
              description="La carrera ya está asignada según sus datos académicos y no puede modificarse."
              type="info"
              showIcon
              style={{ borderRadius: 8 }}
            />
          ) : (
            <Alert
              title="Estudiante nuevo"
              description="Seleccione la carrera en la que inscribirá al estudiante. Se usará la gestión académica vigente."
              type="info"
              showIcon
              style={{ borderRadius: 8 }}
            />
          )}
        </Col>
      </Row>
      <InscripcionesCarreraSelectionSection
        form={form}
        carreras={carreras}
        loading={carrerasLoading}
        error={carrerasError}
        onCarreraChange={onCarreraChange ?? (() => {})}
        embedded
        disabledCareerIds={disabledCareerIds}
        initialCareerId={selectedStudent?.careerId ?? undefined}
      />
    </Card>
  );
};

export default InscripcionesCarreraStepContent;
