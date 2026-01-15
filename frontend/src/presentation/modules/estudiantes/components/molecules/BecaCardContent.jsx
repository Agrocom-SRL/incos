/**
 * BecaCardContent - Molecule para mostrar el contenido de una card de beca/descuento
 * 
 * Single Responsibility: Renderizar el contenido visual de una card de beca
 * 
 * Atomic Design: Molecule
 * - Combina atoms (Text, Title) para mostrar información de beca
 * 
 * @param {Object} beca - Objeto con información de la beca
 * @param {number} beca.porcentaje - Porcentaje de descuento
 * @param {string} beca.nombre - Nombre de la beca
 * @param {string} beca.descripcion - Descripción de la beca (opcional)
 */

import { Typography } from 'antd';

const { Title, Text } = Typography;

const BecaCardContent = ({ beca }) => {
  return (
    <>
      <div style={{ marginBottom: '12px', textAlign: 'center' }}>
        <Text strong type="primary" style={{ fontSize: '32px', fontWeight: 'bold', display: 'block' }}>
          {beca.porcentaje}%
        </Text>
      </div>
      <div style={{ marginBottom: '8px' }}>
        <Title level={5} style={{ margin: 0, textAlign: 'center' }}>
          {beca.nombre}
        </Title>
      </div>
      {beca.descripcion && (
        <div style={{ marginTop: '8px' }}>
          <Text type="secondary" style={{ fontSize: '12px', display: 'block', textAlign: 'center' }}>
            {beca.descripcion}
          </Text>
        </div>
      )}
    </>
  );
};

export default BecaCardContent;
