import { RightOutlined } from '@ant-design/icons';
import { ActionButton } from '@atoms';

const OfertaParaleloCardFooter = ({ cupo, ctaLabel, onDetalle }) => (
  <div className="opc-footer">
    <span className="opc-cupo">{cupo ?? ''}</span>
    <ActionButton
      permiso="institucional.oferta.paralelo-gestion"
      accion="DETALLE"
      variant="success"
      className="opc-footer__cta"
      onClick={onDetalle}
    >
      {ctaLabel}
      <RightOutlined aria-hidden />
    </ActionButton>
  </div>
);

export default OfertaParaleloCardFooter;
