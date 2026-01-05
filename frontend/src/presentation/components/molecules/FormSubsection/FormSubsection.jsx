/**
 * FormSubsection: Molécula para renderizar sub-secciones de formulario
 * 
 * Single Responsibility: Renderizar una sub-sección de formulario con divider/título y campos agrupados
 * 
 * Clean Architecture:
 * - Presentation Layer: Componente que solo maneja UI
 * - Toda la lógica está en hooks especializados
 * 
 * Atomic Design: Molécula
 * - Usa átomos (Text) y componentes nativos de Ant Design (Row, Col, Divider)
 * - Usa moléculas (FormField) para renderizar campos
 * - Usa hooks personalizados para separar lógica de presentación
 * 
 * SOLID Principles:
 * - Single Responsibility: Solo renderiza UI, la lógica está en hooks
 * - Open/Closed: Extensible agregando nuevos tipos de campos sin modificar código existente
 * - Dependency Inversion: Depende de hooks (abstracciones)
 * - DRY: Reutiliza utilidades de FormSection para evitar duplicación
 * 
 * Uso:
 * - Agrupar campos relacionados dentro de una sección principal
 * - Mostrar divider con título para identificar la sub-sección
 * - Renderizar campos de forma condicional
 */

import { Row, Col, Divider, Space } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { Text, IconButton } from '@atoms';
import { FormField } from '@molecules';
import { useFormSubsection } from './hooks/useFormSubsection';

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
  showDeleteButton = false,
  onDelete = null,
}) => {
  // Hook que compone toda la lógica de la subsección
  const {
    fields: safeFields,
    shouldShow,
    getColumns,
    hasFields,
  } = useFormSubsection({
    fields,
    form,
    conditional,
    dependsOn,
    showIf,
  });

  // Si no debe mostrarse o no hay campos, no renderizar nada
  if (!shouldShow || !hasFields) {
    return null;
  }

  return (
    <Col xs={24} sm={24} md={24} lg={24} xl={24} xxl={24} className="form-subsection">
      <Divider titlePlacement="left">
        <Space>
          <Text strong>{subsectionTitle}</Text>
          {showDeleteButton && onDelete && (
            <IconButton
              icon={<DeleteOutlined />}
              variant="error"
              onClick={onDelete}
              disabled={readOnly}
            />
          )}
        </Space>
      </Divider>
      <Row gutter={[24, 16]} className="form-subsection-fields">
        {safeFields.map((field) => {
          // Obtener configuración de columnas (usando helper del hook)
          const columns = getColumns(field);

          return (
            <Col
              key={field.name}
              {...columns}
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

