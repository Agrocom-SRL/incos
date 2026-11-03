/**
 * ConfigurationCardContent - Molecule para mostrar el contenido de una card de configuración de aporte
 * 
 * Single Responsibility: Renderizar el contenido visual de una card de configuración de aporte
 * 
 * Atomic Design: Molecule
 * - Combina atoms (Text, Title) para mostrar información de configuración
 * 
 * @param {Object} configuracion - Objeto con información de la configuración
 * @param {number} configuracion.montoBase - Monto base del aporte
 * @param {string} configuracion.nombre - Nombre de la configuración (opcional)
 */

import { Typography } from 'antd';

const { Title, Text } = Typography;

const formatMonto = (monto) => {
  if (!monto && monto !== 0) return 'N/A';
  return `Bs. ${Number(monto).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const ConfigurationCardContent = ({ configuracion }) => {
  return (
    <>
      <div style={{ marginBottom: '12px', textAlign: 'center' }}>
        <Text strong style={{ color: 'var(--color-primary)', fontSize: '32px', fontWeight: 'bold', display: 'block' }}>
          {formatMonto(configuracion.montoBase)}
        </Text>
      </div>
      {configuracion.nombre && (
        <div style={{ marginBottom: '8px' }}>
          <Title level={5} style={{ margin: 0, textAlign: 'center' }}>
            {configuracion.nombre}
          </Title>
        </div>
      )}
    </>
  );
};

export default ConfigurationCardContent;
