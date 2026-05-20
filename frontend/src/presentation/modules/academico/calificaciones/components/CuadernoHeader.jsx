/**
 * Encabezado del cuaderno (pantalla B).
 */

import { Button, Tooltip } from 'antd';
import { SettingOutlined, BarChartOutlined } from '@ant-design/icons';

const CuadernoHeader = ({ materia, subtitulo, onAjustes, onVistaPrevia }) => (
  <header className="cal-cuaderno-header">
    <div className="cal-cuaderno-header__text">
      <h1 className="cal-cuaderno-header__title">{materia}</h1>
      <p className="cal-cuaderno-header__subtitle">{subtitulo}</p>
    </div>
    <div className="cal-cuaderno-header__actions">
      <Button icon={<BarChartOutlined />} disabled={!onVistaPrevia} onClick={onVistaPrevia}>
        Vista previa de notas
      </Button>
      <Tooltip title="Cuota, evaluaciones finales y asistencia del curso">
        <Button
          icon={<SettingOutlined />}
          disabled={!onAjustes}
          onClick={onAjustes}
          aria-label="Ajustes del curso"
        />
      </Tooltip>
    </div>
  </header>
);

export default CuadernoHeader;
