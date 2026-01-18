/**
 * PaymentMethodSelectionSection - Organism para la sección de selección de método de pago
 * 
 * Single Responsibility: Mostrar el formulario de selección de método de pago
 * 
 * Atomic Design: Organism
 * - Combina molecules (DataCards) y atoms (Card, Form, Alert)
 * 
 * @param {Object} metodosPagoData - Datos de métodos de pago
 * @param {Array} metodosPagoData.metodosPago - Lista de métodos de pago
 * @param {boolean} metodosPagoData.loading - Estado de carga
 * @param {string} metodosPagoData.error - Mensaje de error
 * @param {Object} metodosPagoData.selectedMetodoPago - Método de pago seleccionado
 * @param {Function} onSelectMetodoPago - Callback cuando se selecciona un método de pago
 * @param {Function} renderMetodoPagoCard - Función para renderizar cada card
 * @param {Object} form - Instancia del formulario de Ant Design
 * @param {Function} onFinish - Callback cuando se envía el formulario
 */

import { Form, Alert } from 'antd';
import { Card } from '@atoms';
import { DataCards } from '@molecules';

const PaymentMethodSelectionSection = ({
  metodosPagoData,
  onSelectMetodoPago,
  renderMetodoPagoCard,
  form,
  onFinish
}) => {
  return (
    <Card
      title="Seleccionar Método de Pago"
      style={{ marginTop: '24px', marginBottom: '24px' }}
      headerColor="primary"
    >
      {metodosPagoData.error && (
        <Alert
          message="Error al cargar métodos de pago"
          description={metodosPagoData.error}
          type="error"
          showIcon
          style={{ marginBottom: '24px' }}
        />
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
      >
        <Form.Item
          name="metodoPagoId"
          rules={[
            { required: true, message: 'Por favor seleccione un método de pago' }
          ]}
        >
          <DataCards
            data={metodosPagoData.metodosPago || []}
            loading={metodosPagoData.loading}
            emptyMessage="No hay métodos de pago disponibles"
            renderItem={renderMetodoPagoCard}
            onSelect={onSelectMetodoPago}
            selectedItem={metodosPagoData.selectedMetodoPago}
            isSelected={(item) => {
              return metodosPagoData.selectedMetodoPago?.id === item.id;
            }}
            loadingText="Cargando métodos de pago..."
          />
        </Form.Item>
      </Form>
    </Card>
  );
};

export default PaymentMethodSelectionSection;
