/**
 * Navegación entre bimestres en la vista consolidada (histórico → consolidado; vigente → cuaderno).
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

const BimestreConsolidadoBimestrePager = ({ asignacionId, bimestreActivo, bimestreVigente }) => {
  const navigate = useNavigate();
  const n = Number(bimestreActivo) || 1;
  const vigente = Number(bimestreVigente) || 1;

  const puedeAnterior = n > 1;
  const puedeSiguiente = n < 4 && n < vigente;

  const pathPara = (destino) => {
    if (destino < vigente) {
      return bimestreConsolidadoPath(asignacionId, destino);
    }
    return cuadernoBimestrePath(asignacionId, destino);
  };

  const irA = (destino) => {
    if (!asignacionId || destino < 1 || destino > 4) return;
    if (destino < vigente) {
      navigate(bimestreConsolidadoPath(asignacionId, destino));
      return;
    }
    if (destino === vigente) {
      navigate(cuadernoBimestrePath(asignacionId, destino));
    }
  };

  const btnSiguiente = (
    <Button
      type="default"
      shape="circle"
      size="small"
      icon={<RightOutlined />}
      disabled={!puedeSiguiente}
      aria-label={
        n + 1 === vigente ? 'Ir al cuaderno del bimestre vigente' : 'Bimestre siguiente'
      }
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
        onClick={() => navigate(pathPara(n - 1))}
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

export default BimestreConsolidadoBimestrePager;
