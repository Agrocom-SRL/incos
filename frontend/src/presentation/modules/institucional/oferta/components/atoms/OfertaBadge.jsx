import { Tag, Typography } from 'antd';

const { Text } = Typography;

const OfertaBadge = ({ validacion, ofertaActual }) => {
  if (!validacion) return <Text type="secondary">—</Text>;
  const { valido, asignaturas_esperadas: esp, oferta_actual: act } = validacion;
  const label = `${act}/${esp}`;
  if (valido) return <Tag color="success">✓ {label}</Tag>;
  if (ofertaActual > 0) return <Tag color="warning">⚠ {label}</Tag>;
  return <Text type="secondary">—</Text>;
};

export default OfertaBadge;
