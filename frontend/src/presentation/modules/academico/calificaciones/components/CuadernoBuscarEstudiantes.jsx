/**
 * Buscador local de estudiantes en el cuaderno (nombre, código o nro).
 */

import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const CuadernoBuscarEstudiantes = ({
  value,
  onChange,
  total = 0,
  filtrados = 0,
  className = '',
}) => {
  const hayFiltro = Boolean(value?.trim());
  const suffix = hayFiltro ? `${filtrados} de ${total}` : `${total} estudiantes`;

  return (
    <div className={['cal-cuaderno-buscar', className].filter(Boolean).join(' ')}>
      <Input
        allowClear
        prefix={<SearchOutlined className="cal-cuaderno-buscar__icon" aria-hidden />}
        placeholder="Buscar por nombre, código o nro…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="cal-cuaderno-buscar__input"
        aria-label="Buscar estudiante"
      />
      <span className="cal-cuaderno-buscar__contador" aria-live="polite">
        {suffix}
      </span>
    </div>
  );
};

export default CuadernoBuscarEstudiantes;
