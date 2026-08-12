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
 * - Campos adicionales (condicionales, solo cuando entregado = false):
 *   - Checkbox para "En trámite" (en_tramite)
 *   - Textarea para observaciones
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
 * 
 * @param {Object} props
 * @param {Object} props.documento - Objeto con datos del documento
 * @param {number} props.documento.id - ID del documento
 * @param {string} props.documento.name - Nombre del documento
 * @param {string} props.documento.description - Descripción del documento
 * @param {boolean} props.documento.required - Si el documento es requerido
 * @param {boolean} props.documento.acceptsPhotocopy - Si acepta fotocopia
 * @param {boolean} props.documento.entregado - Estado de entrega del documento
 * @param {string} [props.documento.observaciones] - Motivo de no entrega (solo cuando entregado=false)
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
    initialObservaciones,
    tituloDocumento,
    esRequerido,
    mostrarIndicadorFotocopia,
    defaultChecked,
  } = useDocumentoItem(documento);

  // Observar el estado de entrega para mostrar/ocultar campos condicionales
  // Si no hay valor en el formulario, usar el valor por defecto del documento
  const entregadoDelForm = Form.useWatch(fieldName, form);
  const entregado = entregadoDelForm !== undefined ? entregadoDelForm : defaultChecked;

  return (
    <Container className="documento-item" vertical gap="md">
      {/* Título y Switch: icono + texto en línea; el asterisco de requerido fluye
          al final del texto (dentro del mismo span), no en una línea propia */}
      <Container className="documento-item-header">
        <Heading level={5} gap="small">
          <FileTextOutlined />
          <span className="documento-item-title">
            {tituloDocumento}
            {esRequerido && (
              <Text className="documento-required">*</Text>
            )}
          </span>
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

      {/* Indicador "Se acepta Fotocopia" y checkbox "En trámite" (solo Pendiente),
          lado a lado en mitades cuando ambos están visibles */}
      {(mostrarIndicadorFotocopia || !entregado) && (
        <Row gutter={[16, 8]} align="middle" className="documento-item__fotocopia-wrap">
          {mostrarIndicadorFotocopia && (
            <Col xs={24} sm={!entregado ? 12 : 24}>
              <Badge
                variant="success"
                icon={<CheckCircleOutlined />}
                text="Se acepta Fotocopia"
                className="documento-item__fotocopia-badge"
              />
            </Col>
          )}
          {!entregado && (
            <Col xs={24} sm={mostrarIndicadorFotocopia ? 12 : 24}>
              <Form.Item
                name={fieldNameEnTramite}
                valuePropName="checked"
                style={{ marginBottom: 0 }}
              >
                <FieldCheckbox disabled={readOnly}>
                  En trámite
                </FieldCheckbox>
              </Form.Item>
            </Col>
          )}
        </Row>
      )}

      {/* Textarea para observaciones (motivo de no entrega) - solo visible cuando switch es FALSE */}
      {!entregado && (
        <Form.Item
          name={fieldNameObservaciones}
          label="Motivo de no entrega"
          initialValue={initialObservaciones}
        >
          <FieldTextarea
            placeholder="Indique por qué no se entregó el documento (ej. en trámite, vencido, no trajo, etc.)"
            disabled={readOnly}
            rows={3}
          />
        </Form.Item>
      )}
    </Container>
  );
};

export default DocumentoItem;

