/**
 * BecaSelectionSection - Organism para la sección de selección de becas/descuentos
 * 
 * Single Responsibility: Mostrar el formulario de selección de becas/descuentos
 * 
 * Atomic Design: Organism
 * - Combina molecules (DataCards) y atoms (Card, Form, Alert)
 * 
 * @param {Object} becasDescuentosData - Datos de becas y descuentos
 * @param {Array} becasDescuentosData.becasDescuentos - Lista de becas/descuentos
 * @param {boolean} becasDescuentosData.loading - Estado de carga
 * @param {string} becasDescuentosData.error - Mensaje de error
 * @param {Object} becasDescuentosData.selectedBecaDescuento - Beca seleccionada
 * @param {Function} onSelectBeca - Callback cuando se selecciona una beca
 * @param {Function} renderBecaCard - Función para renderizar cada card
 * @param {Object} form - Instancia del formulario de Ant Design
 * @param {Function} onFinish - Callback cuando se envía el formulario
 * @param {string} studentId - ID del estudiante
 */

import { Form, Alert } from 'antd';
import { Card } from '@atoms';
import { DataCards } from '@molecules';

const BecaSelectionSection = ({
  becasDescuentosData,
  onSelectBeca,
  renderBecaCard,
  form,
  onFinish,
  studentId
}) => {
  return (
    <Card
      title="Seleccionar Beca o Descuento"
      style={{ marginTop: '24px', marginBottom: '24px' }}
      headerColor="primary"
    >
      {becasDescuentosData.error && (
        <Alert
          message="Error al cargar becas y descuentos"
          description={becasDescuentosData.error}
          type="error"
          showIcon
          style={{ marginBottom: '24px' }}
        />
      )}

      {/* No usar Form aquí: ya estamos dentro del Form del padre; solo Form.Item para no anidar <form> */}
      <Form.Item
        name="becaDescuentoId"
        rules={[
          { required: true, message: 'Por favor seleccione una beca o descuento' }
        ]}
      >
        <DataCards
          data={becasDescuentosData.becasDescuentos || []}
          loading={becasDescuentosData.loading}
          emptyMessage="No hay becas o descuentos disponibles"
          renderItem={renderBecaCard}
          onSelect={onSelectBeca}
          selectedItem={becasDescuentosData.selectedBecaDescuento}
          isSelected={(item) => {
            return becasDescuentosData.selectedBecaDescuento?.id === item.id;
          }}
          loadingText="Cargando becas y descuentos..."
        />
      </Form.Item>
    </Card>
  );
};

export default BecaSelectionSection;
