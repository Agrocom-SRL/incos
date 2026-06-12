/**
 * Átomo: campo de selección de actividad maestra con botón de búsqueda (lanza un
 * modal). Compatible con Form.Item (recibe `value` = id de la actividad). Muestra
 * el nombre + icono de la actividad elegida; no es un Select común.
 */

import { createElement } from 'react';
import { Button, Input, Space } from 'antd';
import { SearchOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { getActivityIconComponent } from '@config/icons';

const CronogramaActividadSelectorField = ({
  value,
  displayName,
  iconName,
  placeholder = 'Busca una actividad del catálogo…',
  disabled = false,
  onSearch,
  onClear,
}) => {
  const tieneValor = value != null && value !== '';

  // prefix/suffix SIEMPRE presentes (aunque vacíos) para no cambiar la estructura
  // del Input al seleccionar/limpiar (evita el warning de pérdida de foco de antd).
  const prefixNode = (
    <span className="crono-actividad-selector__prefix" aria-hidden>
      {tieneValor ? createElement(getActivityIconComponent(iconName)) : null}
    </span>
  );

  const suffixNode = (
    <span className="crono-actividad-selector__suffix">
      {tieneValor ? (
        <CloseCircleOutlined
          className="crono-actividad-selector__clear"
          onClick={
            disabled
              ? undefined
              : (e) => {
                  e.stopPropagation();
                  onClear?.();
                }
          }
          aria-label="Quitar actividad"
        />
      ) : null}
    </span>
  );

  return (
    <Space.Compact block>
      <Input
        readOnly
        value={tieneValor ? displayName || `Actividad #${value}` : ''}
        placeholder={placeholder}
        disabled={disabled}
        prefix={prefixNode}
        suffix={suffixNode}
        onClick={disabled ? undefined : onSearch}
      />
      <Button type="primary" icon={<SearchOutlined />} onClick={onSearch} disabled={disabled}>
        Buscar
      </Button>
    </Space.Compact>
  );
};

export default CronogramaActividadSelectorField;
