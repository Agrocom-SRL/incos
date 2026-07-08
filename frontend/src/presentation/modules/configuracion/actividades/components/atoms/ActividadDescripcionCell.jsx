/**
 * Ícono real (dot circular) + descripción truncada (2 líneas), columna "Descripción"
 * del listado de Actividades. Mismo patrón que `CarreraAreaDescripcionCell`
 * (Configuración → Académico): reemplaza la columna "Icono" separada — el ícono
 * mapeado desde el string kebab-case (`actividadIconMap.js`) se muestra como dot
 * a la izquierda, cubriendo visualmente las 2 líneas de texto truncado.
 */
import { createElement } from 'react';
import { Flex } from 'antd';
import { TruncatedTextCell } from '@atoms';
import { getActividadIconComponent } from '@configuracion/actividades/config/actividadIconMap';

/** Ícono de la actividad (createElement evita crear componentes en render). */
const renderActividadIcono = (icono) =>
  createElement(getActividadIconComponent(icono), {
    className: 'cfg-actividad-desc__dot-icon',
    'aria-hidden': true,
  });

const ActividadDescripcionCell = ({ icono, descripcion }) => (
  <Flex align="center" className="cfg-actividad-desc">
    <span className="cfg-actividad-desc__dot">{renderActividadIcono(icono)}</span>
    <div className="cfg-actividad-desc__texto-wrap">
      <TruncatedTextCell text={descripcion} />
    </div>
  </Flex>
);

export default ActividadDescripcionCell;
