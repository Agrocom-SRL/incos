import OfertaParaleloInfoIcon from '../atoms/OfertaParaleloInfoIcon';

const VALUE_VARIANT_CLASS = {
  default: '',
  ok: 'opc-info-value--ok',
  warn: 'opc-info-value--warn',
  pend: 'opc-info-value--pend',
};

const OfertaParaleloCardInfoRow = ({ icon, label, value, iconVariant, valueVariant = 'default' }) => (
  <div className="opc-info-row">
    <OfertaParaleloInfoIcon icon={icon} variant={iconVariant} />
    <div className="opc-info-item">
      <span className="opc-info-label">{label}</span>
      <span className={`opc-info-value ${VALUE_VARIANT_CLASS[valueVariant] ?? ''}`.trim()}>{value}</span>
    </div>
  </div>
);

export default OfertaParaleloCardInfoRow;
