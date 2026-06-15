import { BankOutlined, CalendarOutlined, UserOutlined } from '@ant-design/icons';
import OfertaParaleloCardBand from './OfertaParaleloCardBand';
import OfertaParaleloCardFooter from './OfertaParaleloCardFooter';
import OfertaParaleloCardInfoRow from './OfertaParaleloCardInfoRow';

const ROW_ICONS = {
  aula: <BankOutlined />,
  docente: <UserOutlined />,
  horario: <CalendarOutlined />,
};

const OfertaParaleloCard = ({
  model,
  inhabilitandoParaleloId = null,
  onNavigateDetalle,
  onInhabilitarParalelo,
  onHabilitarParalelo,
}) => (
  <article className={model.cardClassName}>
    <OfertaParaleloCardBand
      band={model.band}
      estado={model.estado}
      estadoPillClass={model.estadoPillClass}
      dots={model.dots}
    />
    <div className="opc-body">
      <div className="opc-body__main">
        <OfertaParaleloCardInfoRow icon={ROW_ICONS.aula} {...model.rows.aula} />
        <OfertaParaleloCardInfoRow icon={ROW_ICONS.docente} {...model.rows.docente} />
        <OfertaParaleloCardInfoRow icon={ROW_ICONS.horario} {...model.rows.horario} />
      </div>
      <OfertaParaleloCardFooter
        cupo={model.cupo}
        ctaLabel={model.ctaLabel}
        puedeInhabilitar={model.puedeInhabilitar}
        puedeHabilitar={model.puedeHabilitar}
        mutandoEstado={inhabilitandoParaleloId === model.id}
        onDetalle={() => onNavigateDetalle?.(model.id)}
        onInhabilitar={
          model.puedeInhabilitar && onInhabilitarParalelo
            ? () =>
                onInhabilitarParalelo(model.id, model.gestionPlanId, model.paraleloNombre)
            : undefined
        }
        onHabilitar={
          model.puedeHabilitar && onHabilitarParalelo
            ? () =>
                onHabilitarParalelo(model.id, model.gestionPlanId, model.paraleloNombre)
            : undefined
        }
      />
    </div>
  </article>
);

export default OfertaParaleloCard;
