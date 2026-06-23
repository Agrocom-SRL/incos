/**
 * Átomo: CompromisoAlertTag — badge de estado del compromiso de pago de un aporte.
 *
 * Fuente única de presentación del semáforo del compromiso. Lo consumen la columna
 * "Compromiso" del listado, la card de detalle y cualquier vista que muestre el
 * estado del compromiso (no duplicar la lógica de colores en cada sitio).
 *
 * La traducción contrato → color/label/ícono vive en `compromisoAlerta.js` (sin JSX).
 * Color por `color` semántico de AntD (success/warning/error/default) → mapea al token
 * del theme (ConfigProvider). Sin `#hex` sueltos (regla incos-ui-system §1/§2).
 */

import { Tag, Typography } from 'antd';
import { ClockCircleOutlined, WarningOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { resolverCompromisoEstado } from './compromisoAlerta';

const ICONOS = {
  cumplido: <CheckCircleOutlined />,
  vencida: <ExclamationCircleOutlined />,
  proxima: <WarningOutlined />,
  aldia: <ClockCircleOutlined />,
};

/**
 * Tag del estado del compromiso. Sin compromiso renderiza el placeholder '—'.
 *
 * @param {Object} props
 * @param {Object|null} props.compromiso - Compromiso del contrato (o null).
 * @param {boolean} [props.icon=true] - Mostrar el ícono de estado.
 * @param {React.CSSProperties} [props.style]
 */
const CompromisoAlertTag = ({ compromiso, icon = true, style }) => {
  if (!compromiso) {
    return <Typography.Text type="secondary">—</Typography.Text>;
  }

  const { color, label, icon: iconKey } = resolverCompromisoEstado(compromiso);

  return (
    <Tag color={color} icon={icon ? ICONOS[iconKey] : undefined} style={{ margin: 0, ...style }}>
      {label}
    </Tag>
  );
};

export default CompromisoAlertTag;
