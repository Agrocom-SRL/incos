/**
 * SelectedBecaSection - Organism para la sección de beca/descuento seleccionada
 * 
 * Single Responsibility: Mostrar información de la beca seleccionada y botones de acción
 * 
 * Atomic Design: Organism
 * - Combina molecules (SelectedBecaInfoItem) y atoms (Card, Row, Col, Button, Space)
 * 
 * @param {Object} selectedBecaDescuento - Beca/descuento seleccionada
 * @param {string} selectedBecaDescuento.nombre - Nombre de la beca
 * @param {number} selectedBecaDescuento.porcentaje - Porcentaje de descuento
 * @param {string} selectedBecaDescuento.descripcion - Descripción (opcional)
 * @param {Object} form - Instancia del formulario de Ant Design
 * @param {Function} onFinish - Callback cuando se envía el formulario (se dispara con form.submit())
 * @param {Function} onCancel - Callback cuando se cancela
 * @param {boolean} disabled - Si los botones están deshabilitados
 */

import { Row, Col, Space, Form, Input } from 'antd';
import {
  GiftOutlined,
  PercentageOutlined,
  FileTextOutlined,
  SaveOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  BankOutlined
} from '@ant-design/icons';
import { Card, Button, ActionButton } from '@atoms';
import { SelectedBecaInfoItem } from '../molecules';

const { TextArea } = Input;

// Helper para formatear fecha
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-BO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
};

// Helper para formatear estado
const formatEstado = (estado) => {
  if (!estado) return 'N/A';
  const estados = {
    'PENDIENTE': 'Pendiente',
    'ACTIVA': 'Activa',
    'FINALIZADA': 'Finalizada',
    'RECHAZADA': 'Rechazada'
  };
  return estados[estado] || estado;
};

const SelectedBecaSection = ({
  selectedBecaDescuento,
  form,
  onFinish,
  onCancel,
  disabled = false,
  isEditMode = false,
}) => {
  if (!selectedBecaDescuento) return null;

  // Obtener valores del formulario para mostrar información adicional
  const formValues = form?.getFieldsValue() || {};

  return (
    <Card
      title="Beca o descuento seleccionado"
      style={{ marginTop: '24px', marginBottom: '24px' }}
      headerColor="primary"
    >
      {/* Información de la beca seleccionada */}
      <Row gutter={[24, 16]}>
        <Col xs={24} sm={12}>
          <SelectedBecaInfoItem
            icon={<GiftOutlined style={{ fontSize: '24px', color: '#fff' }} />}
            label="Nombre"
            value={selectedBecaDescuento.nombre}
          />
        </Col>
        <Col xs={24} sm={12}>
          <SelectedBecaInfoItem
            icon={<PercentageOutlined style={{ fontSize: '24px', color: '#fff' }} />}
            label="Porcentaje de descuento"
            value={`${selectedBecaDescuento.porcentaje || 'N/A'}%`}
            valueColor="var(--color-primary-hover, #196b45)"
            valueFontSize="20px"
          />
        </Col>
        {selectedBecaDescuento.descripcion && (
          <Col xs={24}>
            <SelectedBecaInfoItem
              icon={<FileTextOutlined style={{ fontSize: '24px', color: '#fff' }} />}
              label="Descripción"
              value={selectedBecaDescuento.descripcion}
              isFullWidth={true}
              valueFontSize="14px"
            />
          </Col>
        )}
        {/* Información automática de la asignación */}
        <Col xs={24} sm={12}>
          <SelectedBecaInfoItem
            icon={<CalendarOutlined style={{ fontSize: '24px', color: '#fff' }} />}
            label="Fecha de solicitud"
            value={formatDate(new Date().toISOString())}
          />
        </Col>
        <Col xs={24} sm={12}>
          <SelectedBecaInfoItem
            icon={<CheckCircleOutlined style={{ fontSize: '24px', color: '#fff' }} />}
            label="Estado"
            value={formatEstado('PENDIENTE')}
          />
        </Col>
      </Row>

      {/* Formulario para completar la asignación */}
      <div style={{
        marginTop: '24px',
        paddingTop: '24px',
        borderTop: '1px solid var(--color-border-secondary, #e8e8e8)'
      }}>
        {/* No usar Form aquí: ya estamos dentro del Form del padre; solo Form.Item para no anidar <form> */}
        <Form.Item
          name="observaciones"
          label="Motivo / Observaciones"
          tooltip={{
            title: 'Ingrese el motivo de la solicitud de beca (ej: madre soltera, escasos recursos, etc.)',
            placement: 'top',
            styles: {
              root: {
                maxWidth: '350px',
              },
              container: {
                fontSize: '16px',
                lineHeight: '1.5',
                padding: '12px 16px',
              },
            },
          }}
          rules={[
            { required: true, message: 'Por favor ingrese el motivo de la solicitud' }
          ]}
        >
          <TextArea
            rows={4}
            placeholder="Ingrese el motivo de la solicitud de beca..."
            maxLength={500}
            showCount
          />
        </Form.Item>
      </div>

      {/* Botones de acción - Solo se muestran cuando hay una beca seleccionada */}
      <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--color-border-secondary, #e8e8e8)' }}>
        <Space size="large">
          <ActionButton
            permiso="matricula.beca.asignar"
            accion={isEditMode ? 'EDITAR' : 'CREAR'}
            variant="primary"
            onClick={() => form?.submit()}
            icon={<SaveOutlined />}
            disabled={disabled}
          >
            {isEditMode ? 'Guardar cambios' : 'Asignar beca'}
          </ActionButton>
          <Button
            variant="default"
            onClick={onCancel}
          >
            Cancelar
          </Button>
        </Space>
      </div>
    </Card>
  );
};

export default SelectedBecaSection;
