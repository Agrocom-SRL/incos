import { CheckOutlined, RightOutlined, StopOutlined } from '@ant-design/icons';
import { ActionButton } from '@atoms';

const OfertaParaleloCardFooter = ({
  cupo,
  ctaLabel,
  puedeInhabilitar = false,
  puedeHabilitar = false,
  mutandoEstado = false,
  onDetalle,
  onInhabilitar,
  onHabilitar,
}) => (
  <div className="opc-footer">
    <span className="opc-cupo">{cupo ?? ''}</span>
    <div className="opc-footer__actions">
      {puedeHabilitar && onHabilitar ? (
        <ActionButton
          permiso="institucional.oferta.paralelo-gestion"
          accion="ACTIVAR"
          variant="primary"
          size="small"
          className="opc-footer__cta opc-footer__cta--habilitar"
          loading={mutandoEstado}
          onClick={onHabilitar}
        >
          Habilitar
          <CheckOutlined aria-hidden />
        </ActionButton>
      ) : null}
      {puedeInhabilitar && onInhabilitar ? (
        <ActionButton
          permiso="institucional.oferta.paralelo-gestion"
          accion="EDITAR"
          variant="error"
          size="small"
          className="opc-footer__cta opc-footer__cta--secondary"
          loading={mutandoEstado}
          onClick={onInhabilitar}
        >
          Inhabilitar
          <StopOutlined aria-hidden />
        </ActionButton>
      ) : null}
      <ActionButton
        permiso="institucional.oferta.paralelo-gestion"
        accion="DETALLE"
        variant="success"
        size="small"
        className="opc-footer__cta"
        onClick={onDetalle}
      >
        {ctaLabel}
        <RightOutlined aria-hidden />
      </ActionButton>
    </div>
  </div>
);

export default OfertaParaleloCardFooter;
