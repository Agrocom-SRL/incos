/**
 * Organismo: COBERTURA DEL CATÁLOGO DE DESCUENTOS.
 *
 * Lista TODOS los tramos del catálogo de becas/descuentos (25/50/75/100…),
 * incluso los que NO se usan en la gestión, como dato estadístico: cuántos tipos
 * de beca existen por tramo, cuáles están en uso y qué peso tienen sobre el total
 * con beca. Los tramos sin uso se marcan con un tag "Sin uso".
 *
 * Comparte la paleta categórica del donut (`becasTramoColors`, por tokens) para
 * que el swatch de cada tramo coincida con el gráfico. No hace fetch.
 */

import { Card, Empty, Tag, Tooltip, Typography, theme } from 'antd';
import { getTramoColor } from '@finanzas/reportes/config/becasTramoColors';

const { Text } = Typography;

const formatPorcentaje = (value) => {
  const n = Number(value);
  const safe = Number.isFinite(n) ? n : 0;
  return Math.round(safe).toLocaleString('es-BO', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

const BecasCatalogoCobertura = ({ catalogo = [], resumen = null }) => {
  const { token } = theme.useToken();
  const tramos = Array.isArray(catalogo) ? catalogo : [];
  const data = resumen || {};

  const extra =
    tramos.length > 0 ? (
      <Tag color="green">
        {data.tramosUsados || 0}/{data.tramosTotales || tramos.length} en uso
      </Tag>
    ) : null;

  return (
    <Card variant="outlined" title="Catálogo de descuentos" extra={extra}>
      {tramos.length > 0 ? (
        <>
          <Text type="secondary" className="becas-catalogo__intro">
            {data.totalTipos || 0} tipos de beca en {data.tramosTotales || tramos.length} tramos.
            Se muestran todos, se usen o no.
          </Text>
          <ul className="becas-catalogo__lista">
            {tramos.map((tramo, index) => {
              const color = getTramoColor(token, tramo.porcentaje, index);
              const pct = Number(tramo.porcentajeDelTotalConBeca) || 0;
              return (
                <li
                  key={tramo.porcentaje ?? index}
                  className={`becas-catalogo__item${tramo.usado ? '' : ' becas-catalogo__item--inactivo'}`}
                >
                  <div className="becas-catalogo__head">
                    <span className="becas-catalogo__swatch" style={{ background: color }} />
                    <span className="becas-catalogo__label">
                      <Text strong>{tramo.etiqueta}</Text>
                    </span>
                    <Tooltip title="Tipos de beca con este porcentaje en el catálogo">
                      <Tag variant="filled" className="becas-catalogo__tipos">
                        {tramo.tipos} {tramo.tipos === 1 ? 'tipo' : 'tipos'}
                      </Tag>
                    </Tooltip>
                    <span className="becas-catalogo__valor">
                      {tramo.usado ? (
                        <Text type="secondary">
                          {tramo.beneficiados}{' '}
                          {tramo.beneficiados === 1 ? 'beneficiado' : 'beneficiados'} ·{' '}
                          {formatPorcentaje(pct)}%
                        </Text>
                      ) : (
                        <Tag color="default">Sin uso</Tag>
                      )}
                    </span>
                  </div>
                  <span className="becas-catalogo__bar" aria-hidden="true">
                    <span
                      className="becas-catalogo__bar-fill"
                      style={{ width: `${Math.min(100, pct)}%`, background: color }}
                    />
                  </span>
                </li>
              );
            })}
          </ul>
        </>
      ) : (
        <Empty description="Sin catálogo de becas configurado" />
      )}
    </Card>
  );
};

export default BecasCatalogoCobertura;
