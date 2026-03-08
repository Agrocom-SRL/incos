/**
 * EstudianteDatosAcademicosStepContent - Contenido del paso "Datos académicos iniciales" (step 0, sección datosAcademicosIniciales)
 *
 * Responsabilidad del módulo estudiantes: Card con Gestión (si ANTIGUO) + Carrera.
 * El WizardForm genérico solo invoca renderSectionContent.
 *
 * @param {Object} form - Instancia del formulario
 * @param {Object} section - Config de la sección (title, fields)
 * @param {Array} carreras
 * @param {Array} gestiones
 * @param {boolean} carrerasLoading
 * @param {boolean} gestionesLoading
 * @param {string} carrerasError
 * @param {string} gestionesError
 */

import { Form, Card, Row, Col } from 'antd';
import CarreraSelectionSection from './CarreraSelectionSection';
import GestionSelectionSection from './GestionSelectionSection';

const EstudianteDatosAcademicosStepContent = ({
  form,
  section,
  carreras = [],
  gestiones = [],
  carrerasLoading = false,
  gestionesLoading = false,
  carrerasError = null,
  gestionesError = null,
}) => {
  const tipoAdmision = Form.useWatch('tipoAdmision', form);
  const requiereGestion =
    tipoAdmision === 'ANTIGUO' ||
    tipoAdmision === 'TRANSITABILIDAD' ||
    tipoAdmision === 'TRASPASO';
  const carreraField = section?.fields?.find((f) => f.name === 'carreraId');

  return (
    <Card
      title={
        <span style={{ fontSize: '18px', fontWeight: 600 }}>
          {section?.title}
        </span>
      }
      style={{
        marginTop: 24,
        marginBottom: 24,
        borderRadius: 12,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}
    >
      <Row gutter={24}>
        {requiereGestion && (
          <Col xs={24} sm={24} md={8} lg={8}>
            <GestionSelectionSection
              form={form}
              gestiones={gestiones}
              loading={gestionesLoading}
              error={gestionesError}
              tipoAdmision={tipoAdmision}
            />
          </Col>
        )}
        {carreraField && (
          <Col xs={24} sm={24} md={requiereGestion ? 16 : 24} lg={requiereGestion ? 16 : 24}>
            <CarreraSelectionSection
              form={form}
              carreras={carreras}
              loading={carrerasLoading}
              error={carrerasError}
              onCarreraChange={() => {}}
              embedded
              compact={!!requiereGestion}
            />
          </Col>
        )}
      </Row>
    </Card>
  );
};

export default EstudianteDatosAcademicosStepContent;
