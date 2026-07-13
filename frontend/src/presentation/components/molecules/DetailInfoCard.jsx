/**
 * Molécula: sección de ficha con cabecera e icono (patrón sd-card).
 */

import { Flex } from 'antd';

const DetailInfoCard = ({ title, icon, extra, children, cols = 2, headVariant, className }) => (
  <section className={`sd-card${className ? ` ${className}` : ''}`}>
    <Flex
      className={`sd-card__head${headVariant ? ` sd-card__head--${headVariant}` : ''}`}
      justify="space-between"
      align="center"
      wrap="wrap"
      gap={8}
    >
      <span className="sd-card__title">
        {icon ? <span className="sd-card__title-icon">{icon}</span> : null}
        {title}
      </span>
      {extra ? <div className="sd-card__extra">{extra}</div> : null}
    </Flex>
    <div className={`sd-card__body sd-card__body--cols-${cols}`}>{children}</div>
  </section>
);

export default DetailInfoCard;
