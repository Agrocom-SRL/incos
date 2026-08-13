/**
 * BecaSelectionSection - Organism para la sección de selección de becas/descuentos
 *
 * Single Responsibility: Mostrar la grilla de becas/descuentos seleccionables
 *
 * Atomic Design: Organism
 * - Sección PLANA dentro del workspace de formulario (`CfgFormWorkspace`):
 *   la tarjeta, el título y la descripción los pone la sección del workspace
 *   en la página — aquí no va ninguna `Card` anidada.
 *
 * @param {Object} becasDescuentosData - Datos de becas y descuentos
 * @param {Array} becasDescuentosData.becasDescuentos - Lista de becas/descuentos
 * @param {boolean} becasDescuentosData.loading - Estado de carga
 * @param {string} becasDescuentosData.error - Mensaje de error
 * @param {Object} becasDescuentosData.selectedBecaDescuento - Beca seleccionada
 * @param {Function} onSelectBeca - Callback cuando se selecciona una beca
 * @param {Function} renderBecaCard - Función para renderizar cada card
 */

import { Form, Alert } from 'antd';
import { DataCards } from '@molecules';
import { allSpacing } from '@theme/tokens';

const BecaSelectionSection = ({ becasDescuentosData, onSelectBeca, renderBecaCard }) => {
  return (
    <>
      {becasDescuentosData.error && (
        <Alert
          title="Error al cargar becas y descuentos"
          description={becasDescuentosData.error}
          type="error"
          showIcon
          style={{ marginBottom: allSpacing.marginLG }}
        />
      )}

      {/* No usar Form aquí: ya estamos dentro del Form del padre; solo Form.Item para no anidar <form> */}
      <Form.Item
        name="becaDescuentoId"
        rules={[
          { required: true, message: 'Por favor seleccione una beca o descuento' }
        ]}
      >
        {/* data-cards--fill: columnas por ancho del contenedor (mínimo por card,
            el espacio sobrante se reparte) — ver data-cards.css */}
        <DataCards
          className="data-cards--fill"
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
    </>
  );
};

export default BecaSelectionSection;
