/**
 * DocumentoItem - Componente compuesto para mostrar un documento con su estado de entrega
 * 
 * Single Responsibility: Mostrar información completa de un documento con switch de entrega
 * 
 * Clean Architecture:
 * - Presentation Layer: Componente que solo maneja UI
 * 
 * Atomic Design: Molécula
 * - Usa átomos (Alert, FieldSwitch, FieldCheckbox, FieldTextarea, Container, Heading, Text, Badge) del sistema
 * - Compone múltiples elementos en un solo componente
 * - NO usa etiquetas HTML directas, solo componentes atómicos
 * 
 * SOLID Principles:
 * - Single Responsibility: Solo renderiza UI de un documento
 * - Open/Closed: Extensible mediante props
 * 
 * Estructura:
 * - Título del documento con indicadores (requerido, original, etc.)
 * - Switch para marcar como entregado/pendiente
 * - Alert con descripción del documento
 * - Iconos que indican si solo se aceptan originales
 * - Campos adicionales (condicionales, solo cuando entregado = true):
 *   - Checkbox para "En trámite" (en_tramite)
 *   - Textarea para observaciones
 *   - Checkbox para "Es original" (solo si acceptsPhotocopy = true)
 * 
 * Reactividad:
 * - Usa Form.useWatch para escuchar cambios en el switch de entrega
 * - Muestra/oculta campos adicionales según el estado de entrega
 */

import { Form, Row, Col } from 'antd';
import { FileTextOutlined, CheckCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { Alert, FieldSwitch, FieldCheckbox, FieldTextarea, Container, Heading, Text, Badge } from '@atoms';
import { useDocumentoItem } from './hooks/useDocumentoItem';

/**
 * Componente para mostrar un documento con su estado de entrega
 * 
 * Campos del formulario generados:
 * - documento_{id}: Switch para entregado/pendiente
 * - documento_{id}_en_tramite: Checkbox para indicar si está en trámite
 * - documento_{id}_observaciones: Textarea para observaciones
 * - documento_{id}_es_original: Checkbox para indicar si es original (solo si acceptsPhotocopy = true)
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
    fieldNameEnTramite,
    fieldNameObservaciones,
    fieldNameEsOriginal,
    tituloDocumento,
    esRequerido,
    mostrarIndicadorOriginal,
    mostrarIndicadorFotocopia,
    mostrarCampoEsOriginal,
    defaultChecked,
  } = useDocumentoItem(documento);

  // Observar el estado de entrega para mostrar/ocultar campos condicionales
  // Si no hay valor en el formulario, usar el valor por defecto del documento
  const entregadoDelForm = Form.useWatch(fieldName, form);
  const entregado = entregadoDelForm !== undefined ? entregadoDelForm : defaultChecked;

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
          initialValue={defaultChecked}
        >
          <FieldSwitch
            disabled={readOnly}
            checkedChildren="Entregado"
            unCheckedChildren="Pendiente"
          />
        </Form.Item>
      </Container>

      {/* Alert con descripción */}
      {documento.description && (
        <Alert
          title={null}
          description={documento.description}
          type="info"
          showIcon={true}
          icon={<InfoCircleOutlined />}
        />
      )}

      {/* Fila horizontal: Badge, Es original, En trámite (cada uno span=8) */}
      <Row gutter={[16, 16]}>
        {/* Badge (solo si hay indicador) - span=8 */}
        <Col span={8}>
          {mostrarIndicadorOriginal && (
            <Badge
              variant="error"
              icon={<CheckCircleOutlined />}
              text="Solo Original"
            />
          )}
          {mostrarIndicadorFotocopia && (
            <Badge
              variant="success"
              icon={<CheckCircleOutlined />}
              text="Se acepta fotocopia"
            />
          )}
        </Col>

        {/* Checkbox para es_original (solo si acceptsPhotocopy es true) - span=8, siempre visible si aplica */}
        {mostrarCampoEsOriginal && (
          <Col span={8}>
            <Form.Item
              name={fieldNameEsOriginal}
              valuePropName="checked"
            >
              <FieldCheckbox disabled={readOnly}>
                Es original (no fotocopia)
              </FieldCheckbox>
            </Form.Item>
          </Col>
        )}

        {/* Checkbox para en_tramite - span=8, solo visible cuando switch es FALSE, al final */}
        <Col span={8}>
          {!entregado && (
            <Form.Item
              name={fieldNameEnTramite}
              valuePropName="checked"
            >
              <FieldCheckbox disabled={readOnly}>
                En trámite
              </FieldCheckbox>
            </Form.Item>
          )}
        </Col>
      </Row>

      {/* Textarea para observaciones - solo visible cuando switch es FALSE */}
      {!entregado && (
        <Form.Item
          name={fieldNameObservaciones}
        >
          <FieldTextarea
            placeholder="Observaciones adicionales sobre la entrega del documento..."
            disabled={readOnly}
            rows={3}
          />
        </Form.Item>
      )}
    </Container>
  );
};

export default DocumentoItem;

