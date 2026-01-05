/**
 * DocumentoItem - Componente compuesto para mostrar un documento con su estado de entrega
 * 
 * Single Responsibility: Mostrar información completa de un documento con switch de entrega
 * 
 * Clean Architecture:
 * - Presentation Layer: Componente que solo maneja UI
 * 
 * Atomic Design: Molécula
 * - Usa átomos (Alert, FieldSwitch, Container, Heading, Text, Badge) del sistema
 * - Compone múltiples elementos en un solo componente
 * - NO usa etiquetas HTML directas, solo componentes atómicos
 * 
 * SOLID Principles:
 * - Single Responsibility: Solo renderiza UI de un documento
 * - Open/Closed: Extensible mediante props
 * 
 * Estructura:
 * - Título del documento con indicadores (requerido, original, etc.)
 * - Switch/Checkbox para marcar como entregado
 * - Alert con descripción del documento
 * - Iconos que indican si solo se aceptan originales
 */

import { Form } from 'antd';
import { FileTextOutlined, CheckCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { Alert, FieldSwitch, Container, Heading, Text, Badge } from '@atoms';
import { useDocumentoItem } from './hooks/useDocumentoItem';

/**
 * Componente para mostrar un documento con su estado de entrega
 * 
 * @param {Object} props
 * @param {Object} props.documento - Objeto con datos del documento
 * @param {number} props.documento.id - ID del documento
 * @param {string} props.documento.name - Nombre del documento
 * @param {string} props.documento.description - Descripción del documento
 * @param {boolean} props.documento.required - Si el documento es requerido
 * @param {boolean} props.documento.esOriginal - Si debe ser original
 * @param {boolean} props.documento.acceptsPhotocopy - Si acepta fotocopia
 * @param {boolean} props.documento.entregado - Estado de entrega del documento
 * @param {Object} props.form - Instancia del formulario de Ant Design
 * @param {boolean} props.readOnly - Si el componente está en modo solo lectura
 */
const DocumentoItem = ({
  documento,
  form,
  readOnly = false,
}) => {
  // Hook que procesa toda la lógica del documento
  const {
    fieldName,
    tituloDocumento,
    esRequerido,
    mostrarIndicadorOriginal,
    mostrarIndicadorFotocopia,
    defaultChecked,
  } = useDocumentoItem(documento);

  return (
    <Container className="documento-item" vertical gap="md">
      {/* Título y Switch */}
      <Container className="documento-item-header">
        <Heading level={5} gap="small">
          <FileTextOutlined />
          {tituloDocumento}
          {esRequerido && (
            <Text className="documento-required">*</Text>
          )}
        </Heading>

        <Form.Item
          name={fieldName}
          valuePropName="checked"
          className="documento-item-switch"
        >
          <FieldSwitch
            disabled={readOnly}
            checkedChildren="Entregado"
            unCheckedChildren="Pendiente"
            defaultChecked={defaultChecked}
          />
        </Form.Item>
      </Container>

      {/* Alert con descripción */}
      {documento.description && (
        <Alert
          message={null}
          description={documento.description}
          type="info"
          showIcon={true}
          icon={<InfoCircleOutlined />}
        />
      )}

      {/* Indicadores usando Badge */}
      {(mostrarIndicadorOriginal || mostrarIndicadorFotocopia) && (
        <Container>
          {mostrarIndicadorOriginal && (
            <Badge
              variant="error"
              icon={<CheckCircleOutlined />}
              text="Solo se acepta original"
            />
          )}
          {mostrarIndicadorFotocopia && (
            <Badge
              variant="success"
              icon={<CheckCircleOutlined />}
              text="Se acepta fotocopia"
            />
          )}
        </Container>
      )}
    </Container>
  );
};

export default DocumentoItem;

