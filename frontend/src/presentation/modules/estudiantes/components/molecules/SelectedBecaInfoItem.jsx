/**
 * SelectedBecaInfoItem - Molecule para mostrar un item de información de beca seleccionada
 * 
 * Single Responsibility: Mostrar un campo de información de la beca seleccionada con icono
 * 
 * Atomic Design: Molecule
 * - Combina atoms (Text, iconos) para crear un item de información
 * 
 * @param {ReactNode} icon - Icono a mostrar
 * @param {string} label - Etiqueta del campo
 * @param {string|number} value - Valor del campo
 * @param {boolean} isFullWidth - Si debe ocupar todo el ancho (para descripción)
 * @param {string} valueColor - Color del valor (opcional)
 * @param {number} valueFontSize - Tamaño de fuente del valor (opcional)
 */

import { Typography } from 'antd';

const { Text } = Typography;

const SelectedBecaInfoItem = ({ 
  icon, 
  label, 
  value, 
  isFullWidth = false,
  valueColor,
  valueFontSize = '16px'
}) => {
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: isFullWidth ? 'flex-start' : 'center', 
      gap: '12px',
      padding: '16px',
      backgroundColor: 'var(--color-fill-tertiary, #f5f5f5)',
      borderRadius: '8px',
      border: '1px solid var(--color-border-secondary, #e8e8e8)'
    }}>
      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        backgroundColor: 'var(--color-info, #196b45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>
          {label}
        </Text>
        <Text 
          strong={!isFullWidth} 
          style={{ 
            fontSize: valueFontSize, 
            display: 'block',
            ...(valueColor && { color: valueColor })
          }}
        >
          {value || 'N/A'}
        </Text>
      </div>
    </div>
  );
};

export default SelectedBecaInfoItem;
