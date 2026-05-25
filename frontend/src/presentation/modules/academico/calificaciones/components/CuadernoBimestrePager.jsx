/**
 * Flechas ◀ ▶ para cambiar de bimestre en el Cuaderno (URL como fuente de verdad).
 */

import { Button, Tooltip } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import {
  bimestreConsolidadoPath,
  cuadernoBimestrePath,
} from '@application-academico/calificaciones/utils/calificacionesPaths.js';

const TOOLTIP_SIGUIENTE_BLOQUEADO =
  'El bimestre siguiente aún no está habilitado en el calendario académico.';

const CuadernoBimestrePager = ({ asignacionId, bimestreActivo, bimestreVigente }) => {
  const navigate = useNavigate();
  const n = Number(bimestreActivo) || 1;
  const vigente = Number(bimestreVigente) || 1;

  const puedeAnterior = n > 1;
  const puedeSiguiente = n < 4 && n < vigente;

  const irA = (destino) => {
    if (!asignacionId || destino < 1 || destino > 4) return;
    if (destino < vigente) {
      navigate(bimestreConsolidadoPath(asignacionId, destino));
      return;
    }
    navigate(cuadernoBimestrePath(asignacionId, destino));
  };

  const btnSiguiente = (
    <Button
      type="default"
      shape="circle"
      size="small"
      icon={<RightOutlined />}
      disabled={!puedeSiguiente}
      aria-label="Bimestre siguiente"
      onClick={() => irA(n + 1)}
      className="cal-cuaderno-bimestre-pager__btn"
    />
  );

  return (
    <span className="cal-cuaderno-bimestre-pager" aria-label="Navegación entre bimestres">
      <Button
        type="default"
        shape="circle"
        size="small"
        icon={<LeftOutlined />}
        disabled={!puedeAnterior}
        aria-label="Bimestre anterior"
        onClick={() => irA(n - 1)}
        className="cal-cuaderno-bimestre-pager__btn"
      />
      {!puedeSiguiente && n < 4 ? (
        <Tooltip title={TOOLTIP_SIGUIENTE_BLOQUEADO}>{btnSiguiente}</Tooltip>
      ) : (
        btnSiguiente
      )}
    </span>
  );
};

export default CuadernoBimestrePager;
