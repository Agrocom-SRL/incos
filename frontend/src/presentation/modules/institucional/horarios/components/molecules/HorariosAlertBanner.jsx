import { Alert, Flex, Typography } from 'antd';
import { allSpacing } from '@theme/tokens';

const { Text } = Typography;

/**
 * Resumen operativo de pendientes para armar y publicar horarios.
 * @param {string[]} [lineas] — mensajes agregados (dashboard state)
 */
const HorariosAlertBanner = ({ lineas = [] }) => {
    const items = (lineas || []).filter(Boolean);

    if (items.length === 0) return null;

    return (
        <Alert
            type="error"
            showIcon
            title="Pendientes para completar horarios"
            description={
                <Flex vertical gap={allSpacing.marginSM}>
                    <ul className="horarios-alert-banner__list" style={{ margin: 0, paddingLeft: 20 }}>
                        {items.map((linea) => (
                            <li key={linea}>
                                <Text>{linea}</Text>
                            </li>
                        ))}
                    </ul>
                </Flex>
            }
        />
    );
};

export default HorariosAlertBanner;
