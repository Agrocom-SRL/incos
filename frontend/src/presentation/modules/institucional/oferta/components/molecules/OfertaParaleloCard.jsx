import { BankOutlined, CalendarOutlined, UserOutlined } from '@ant-design/icons';
import OfertaParaleloCardBand from './OfertaParaleloCardBand';
import OfertaParaleloCardFooter from './OfertaParaleloCardFooter';
import OfertaParaleloCardInfoRow from './OfertaParaleloCardInfoRow';

const ROW_ICONS = {
  aula: <BankOutlined />,
  docente: <UserOutlined />,
  horario: <CalendarOutlined />,
};

const OfertaParaleloCard = ({ model, onNavigateDetalle }) => (
  <article className={model.cardClassName}>
    <OfertaParaleloCardBand
      band={model.band}
      estado={model.estado}
      estadoPillClass={model.estadoPillClass}
      dots={model.dots}
    />
    <div className="opc-body">
      <OfertaParaleloCardInfoRow icon={ROW_ICONS.aula} {...model.rows.aula} />
      <OfertaParaleloCardInfoRow icon={ROW_ICONS.docente} {...model.rows.docente} />
      <OfertaParaleloCardInfoRow icon={ROW_ICONS.horario} {...model.rows.horario} />
      <OfertaParaleloCardFooter
        cupo={model.cupo}
        ctaLabel={model.ctaLabel}
        onDetalle={() => onNavigateDetalle?.(model.id)}
      />
    </div>
  </article>
);

export default OfertaParaleloCard;
