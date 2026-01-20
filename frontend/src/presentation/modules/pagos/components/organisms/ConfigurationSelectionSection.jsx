/**
 * ConfigurationSelectionSection - Organism para la sección de selección de configuración de aporte
 * 
 * Single Responsibility: Mostrar el formulario de selección de configuración de aporte (monto)
 * 
 * Atomic Design: Organism
 * - Combina molecules (DataCards) y atoms (Card, Form, Alert)
 * 
 * @param {Object} configuracionAportesData - Datos de configuraciones de aportes
 * @param {Array} configuracionAportesData.configuracionAportes - Lista de configuraciones de aportes
 * @param {boolean} configuracionAportesData.loading - Estado de carga
 * @param {string} configuracionAportesData.error - Mensaje de error
 * @param {Object} configuracionAportesData.selectedConfiguracion - Configuración seleccionada
 * @param {Function} onSelectConfiguracion - Callback cuando se selecciona una configuración
 * @param {Function} renderConfiguracionCard - Función para renderizar cada card
 * @param {Object} form - Instancia del formulario de Ant Design
 * @param {Function} onFinish - Callback cuando se envía el formulario
 */

import { Form, Alert } from 'antd';
import { Card } from '@atoms';
import { DataCards } from '@molecules';

const ConfigurationSelectionSection = ({
  configuracionAportesData,
  onSelectConfiguracion,
  renderConfiguracionCard,
  form,
  onFinish
}) => {
  return (
    <Card
      title="Seleccionar Configuración de Aporte"
      style={{ marginTop: '24px', marginBottom: '24px' }}
      headerColor="primary"
    >
      {configuracionAportesData.error && (
        <Alert
          title="Error al cargar configuraciones de aportes"
          description={configuracionAportesData.error}
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
          name="configuracionAporteId"
          rules={[
            { required: true, message: 'Por favor seleccione una configuración de aporte' }
          ]}
        >
          <DataCards
            data={configuracionAportesData.configuracionAportes || []}
            loading={configuracionAportesData.loading}
            emptyMessage="No hay configuraciones de aportes disponibles"
            renderItem={renderConfiguracionCard}
            onSelect={onSelectConfiguracion}
            selectedItem={configuracionAportesData.selectedConfiguracion}
            isSelected={(item) => {
              return configuracionAportesData.selectedConfiguracion?.id === item.id;
            }}
            loadingText="Cargando configuraciones de aportes..."
          />
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ConfigurationSelectionSection;
