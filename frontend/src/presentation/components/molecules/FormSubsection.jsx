/**
 * FormSubsection: Molécula para renderizar sub-secciones de formulario
 * 
 * Single Responsibility: Renderizar una sub-sección de formulario con divider/título y campos agrupados
 * 
 * Atomic Design: Molécula
 * - Usa átomos (Text) y componentes nativos de Ant Design (Row, Col, Divider)
 * - Usa moléculas (FormField) para renderizar campos
 * - Soporta renderizado condicional basado en valores del formulario
 * 
 * Uso:
 * - Agrupar campos relacionados dentro de una sección principal
 * - Mostrar divider con título para identificar la sub-sección
 * - Renderizar campos de forma condicional
 */

import { Row, Col, Form, Divider } from 'antd';
import { Text } from '@atoms';
import { FormField } from '@molecules';

const FormSubsection = ({
  subsectionTitle,
  fields = [],
  form,
  resolveOptions = () => [],
  minAge = null,
  readOnly = false,
  conditional = false,
  dependsOn = null,
  showIf = null,
}) => {
  // Observar todos los campos del formulario para hacer reactivo el componente
  const allFormValues = Form.useWatch([], form);

  // Si la sub-sección es condicional, verificar si debe mostrarse
  if (conditional) {
    if (dependsOn) {
      const dependsOnValue = allFormValues?.[dependsOn];

      // Si tiene showIf, evaluar la condición
      if (showIf) {
        const shouldShow = showIf(dependsOnValue);
        if (!shouldShow) return null;
      } else {
        // Por defecto, mostrar si el valor es truthy
        if (!dependsOnValue) return null;
      }
    } else {
      // Si es condicional pero no tiene dependsOn, no mostrar
      return null;
    }
  }

  // Asegurar que fields siempre sea un array
  const safeFields = Array.isArray(fields) ? fields : [];

  // Si no hay campos, no renderizar nada
  if (safeFields.length === 0) {
    return null;
  }

  return (
    <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24} className="form-subsection">
      <Divider titlePlacement="left">
        <Text strong>{subsectionTitle}</Text>
      </Divider>
      <Row gutter={[24, 16]} className="form-subsection-fields">
        {safeFields.map((field) => {
          const span = field.span || 24;
          return (
            <Col
              key={field.name}
              xs={24}
              sm={24}
              md={24}
              lg={span >= 8 ? 12 : span}
              xl={span}
              xxl={span}
            >
              <FormField
                field={field}
                form={form}
                resolveOptions={resolveOptions}
                minAge={minAge}
                readOnly={readOnly}
              />
            </Col>
          );
        })}
      </Row>
    </Col>
  );
};

export default FormSubsection;

