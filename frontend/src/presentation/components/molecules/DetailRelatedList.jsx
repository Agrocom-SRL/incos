/**
 * Molécula: lista de registros RELACIONADOS dentro de una ficha de detalle
 * (`DetailInfoCard`), p. ej. "Cuentas de este banco" o "Bancos que usan este
 * método". Cada fila es un registro propio con su propia ficha (ícono +
 * nombre + link), no un par atributo/valor de la entidad actual — por eso no
 * se modela con `DetailField` (ver auditoría UI: usar `DetailField` para
 * listas de relacionados confunde el estado vacío con un valor de campo).
 *
 * Vacío: `Empty` con `description` de dominio (texto real, no un `DetailField`
 * con el mensaje como `value`).
 */

import { Empty, Flex, Typography } from 'antd';
import { allSpacing } from '@theme/tokens';

const { Link, Text } = Typography;

/**
 * @param {Object} props
 * @param {Array<{ key: string|number, icon?: ReactNode, label: ReactNode, caption?: ReactNode, onClick?: Function }>} props.items
 * @param {string} props.emptyText - Mensaje de estado vacío (dominio, en español).
 */
const DetailRelatedList = ({ items = [], emptyText = 'Sin registros relacionados' }) => {
  if (!items.length) {
    return <Empty description={emptyText} image={Empty.PRESENTED_IMAGE_SIMPLE} />;
  }

  return (
    <Flex vertical gap={allSpacing.marginXS} className="sd-related-list">
      {items.map((item) => (
        <Flex
          key={item.key}
          align="center"
          gap={allSpacing.marginSM}
          className="sd-related-list__item"
        >
          {item.icon ? <span className="sd-related-list__icon">{item.icon}</span> : null}
          {item.onClick ? <Link onClick={item.onClick}>{item.label}</Link> : <Text>{item.label}</Text>}
          {item.caption ? <Text className="sd-related-list__caption">{item.caption}</Text> : null}
        </Flex>
      ))}
    </Flex>
  );
};

export default DetailRelatedList;
