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
 * @param {Function} onSave - Callback cuando se guarda la asignación
 * @param {Function} onCancel - Callback cuando se cancela
 * @param {boolean} disabled - Si los botones están deshabilitados
 */

import { Row, Col, Space } from 'antd';
import { GiftOutlined, PercentageOutlined, FileTextOutlined, SaveOutlined } from '@ant-design/icons';
import { Card, Button } from '@atoms';
import { SelectedBecaInfoItem } from '../molecules';

const SelectedBecaSection = ({
  selectedBecaDescuento,
  onSave,
  onCancel,
  disabled = false
}) => {
  if (!selectedBecaDescuento) return null;

  return (
    <Card
      title="Beca/Descuento Seleccionada"
      style={{ marginTop: '24px', marginBottom: '24px' }}
      headerColor="primary"
    >
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
            label="Porcentaje de Descuento"
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
      </Row>

      {/* Botones de acción - Solo se muestran cuando hay una beca seleccionada */}
      <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--color-border-secondary, #e8e8e8)' }}>
        <Space size="large">
          <Button
            variant="primary"
            onClick={onSave}
            icon={<SaveOutlined />}
            disabled={disabled}
          >
            Asignar Beca
          </Button>
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
