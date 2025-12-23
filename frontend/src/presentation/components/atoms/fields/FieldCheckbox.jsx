// components/atoms/fields/FieldCheckbox.jsx
/**
 * FieldCheckbox: Átomo para campos de tipo checkbox
 * 
 * Single Responsibility: Renderizar un checkbox básico
 */

import { Checkbox, Tooltip, Space, Typography } from 'antd';
import { InfoCircleOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const FieldCheckbox = ({ 
  label,
  disabled, 
  readOnly,
  checked,
  onChange,
  aceptaFotocopia,
  descripcion,
  ...props 
}) => {
  // En modo readOnly, mostrar el estado como texto con icono
  if (readOnly) {
    const isChecked = checked === true || checked === 1;
    
    if (aceptaFotocopia !== undefined || descripcion) {
      const tooltipContent = descripcion 
        ? `${descripcion}${aceptaFotocopia ? ' (Se acepta fotocopia)' : ' (Solo original, no se acepta fotocopia)'}`
        : (aceptaFotocopia ? 'Se acepta fotocopia' : 'Solo original, no se acepta fotocopia');
      
      return (
        <Space size="small" style={{ color: isChecked ? '#52c41a' : '#8c8c8c' }}>
          {isChecked ? (
            <CheckCircleOutlined style={{ color: '#52c41a' }} />
          ) : (
            <CloseCircleOutlined style={{ color: '#d9d9d9' }} />
          )}
          <Typography.Text style={{ color: 'inherit' }}>
            {label}
          </Typography.Text>
          {tooltipContent && (
            <Tooltip title={tooltipContent}>
              <InfoCircleOutlined style={{ color: '#8c8c8c', cursor: 'help' }} />
            </Tooltip>
          )}
        </Space>
      );
    }
    
    return (
      <Space size="small" style={{ color: isChecked ? '#52c41a' : '#8c8c8c' }}>
        {isChecked ? (
          <CheckCircleOutlined style={{ color: '#52c41a' }} />
        ) : (
          <CloseCircleOutlined style={{ color: '#d9d9d9' }} />
        )}
        <Typography.Text style={{ color: 'inherit' }}>
          {label || 'Sin etiqueta'}
        </Typography.Text>
      </Space>
    );
  }
  
  // Si hay información de documento, mostrar tooltip
  if (aceptaFotocopia !== undefined || descripcion) {
    const tooltipContent = descripcion 
      ? `${descripcion}${aceptaFotocopia ? ' (Se acepta fotocopia)' : ' (Solo original, no se acepta fotocopia)'}`
      : (aceptaFotocopia ? 'Se acepta fotocopia' : 'Solo original, no se acepta fotocopia');
    
    return (
      <Checkbox disabled={disabled} checked={checked} onChange={onChange} {...props}>
        <Space size="small">
          <span>{label}</span>
          {tooltipContent && (
            <Tooltip title={tooltipContent}>
              <InfoCircleOutlined style={{ color: '#8c8c8c', cursor: 'help' }} />
            </Tooltip>
          )}
        </Space>
      </Checkbox>
    );
  }
  
  return (
    <Checkbox disabled={disabled} checked={checked} onChange={onChange} {...props}>
      {label}
    </Checkbox>
  );
};

export default FieldCheckbox;

