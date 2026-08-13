/**
 * BecaCardContent - Molecule para el contenido de una card de beca/descuento
 *
 * Single Responsibility: Renderizar icono + porcentaje + nombre + descripción resumida
 *
 * Atomic Design: Molecule
 * - La descripción va recortada (line-clamp) para que la grilla quede compacta;
 *   el texto completo se muestra en un Popover (título + descripción) al pasar
 *   el mouse sobre la card.
 * - `selected` solo pinta el check de confirmación; el estado visual activo
 *   (fondo primario) lo aplica DataCards vía `data-cards__card--active`.
 * - Estilos en styles/components/organisms/becas-asignar.css (.beca-card*).
 *
 * @param {Object} beca - Información de la beca
 * @param {number} beca.porcentaje - Porcentaje de descuento
 * @param {string} beca.nombre - Nombre de la beca
 * @param {string} beca.descripcion - Descripción (opcional)
 * @param {boolean} selected - Si la beca está seleccionada
 */

import { Popover, Typography } from 'antd';
import { CheckCircleFilled } from '@ant-design/icons';
import { getBecaIcon } from '../utils/becaIcon';

const { Paragraph, Text } = Typography;

const BecaCardContent = ({ beca, selected = false }) => {
  const content = (
    <div className="beca-card">
      <div className="beca-card__top">
        <span className="beca-card__icon">{getBecaIcon(beca)}</span>
        <span className="beca-card__badges">
          {selected ? <CheckCircleFilled className="beca-card__check" /> : null}
          <span className="beca-card__pct">{beca.porcentaje}%</span>
        </span>
      </div>
      <Text className="beca-card__nombre">{beca.nombre}</Text>
      {beca.descripcion ? (
        <Paragraph className="beca-card__desc">{beca.descripcion}</Paragraph>
      ) : null}
    </div>
  );

  if (!beca.descripcion) {
    return content;
  }

  return (
    <Popover
      rootClassName="beca-card-popover"
      placement="top"
      mouseEnterDelay={0.35}
      title={`${beca.nombre} · ${beca.porcentaje}%`}
      content={<Paragraph className="beca-card-popover__desc">{beca.descripcion}</Paragraph>}
    >
      {content}
    </Popover>
  );
};

export default BecaCardContent;
