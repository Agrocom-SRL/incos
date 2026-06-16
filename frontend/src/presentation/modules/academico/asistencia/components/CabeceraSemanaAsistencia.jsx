/**
 * Flechas ◀ ▶ para cambiar de semana en la planilla (delante del título).
 * Mismo estilo que el pager del Cuaderno (CuadernoBimestrePager): botones circulares,
 * sin rótulo (el rango de la semana se muestra en la cabecera del grupo de la grilla).
 */
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';

const CabeceraSemanaAsistencia = ({
  puedeAnterior,
  puedeSiguiente,
  onAnterior,
  onSiguiente,
}) => (
  <span className="asi-semana-pager" aria-label="Navegación entre semanas">
    <Tooltip title="Semana anterior">
      <Button
        type="default"
        shape="circle"
        size="small"
        icon={<LeftOutlined />}
        disabled={!puedeAnterior}
        aria-label="Semana anterior"
        onClick={onAnterior}
        className="asi-semana-pager__btn"
      />
    </Tooltip>
    <Tooltip title="Semana siguiente">
      <Button
        type="default"
        shape="circle"
        size="small"
        icon={<RightOutlined />}
        disabled={!puedeSiguiente}
        aria-label="Semana siguiente"
        onClick={onSiguiente}
        className="asi-semana-pager__btn"
      />
    </Tooltip>
  </span>
);

export default CabeceraSemanaAsistencia;
