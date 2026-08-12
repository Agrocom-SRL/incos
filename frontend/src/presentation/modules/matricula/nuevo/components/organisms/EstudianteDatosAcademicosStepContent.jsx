/**
 * EstudianteDatosAcademicosStepContent - Contenido del paso "Datos académicos iniciales" (step 0, sección datosAcademicosIniciales)
 *
 * Gestión (si ANTIGUO/TRANSITABILIDAD/TRASPASO) + Carrera, dentro de la sección plana del wizard.
 * La carrera reutiliza el picker visual tokenizado de CFG → Recursos (ParaleloCarreraPicker).
 *
 * @param {Object} form - Instancia del formulario
 * @param {Object} section - Config de la sección (title, description, fields)
 * @param {Array} carreras
 * @param {Array} gestiones
 * @param {boolean} carrerasLoading
 * @param {boolean} gestionesLoading
 * @param {string} carrerasError
 * @param {string} gestionesError
 */

import { Form, Row, Col } from 'antd';
import ParaleloCarreraPicker from '@configuracion/recursos/components/organisms/ParaleloCarreraPicker';
import EstudianteFormSection from './EstudianteFormSection';
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
    <EstudianteFormSection title={section?.title} description={section?.description} fields={[]}>
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
            <Form.Item
              name="carreraId"
              label="Carrera"
              rules={[{ required: true, message: 'Por favor seleccione una carrera' }]}
              className="form-field form-field--vertical"
            >
              <ParaleloCarreraPicker
                carreras={carreras}
                loading={carrerasLoading}
                error={carrerasError}
              />
            </Form.Item>
          </Col>
        )}
      </Row>
    </EstudianteFormSection>
  );
};

export default EstudianteDatosAcademicosStepContent;
