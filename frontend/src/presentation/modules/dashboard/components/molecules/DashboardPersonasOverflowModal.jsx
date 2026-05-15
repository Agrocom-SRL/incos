import { Modal, Button, Avatar, Empty, Typography } from 'antd';
import { dashboardAvatarUrl } from '../../utils/dashboardAvatarUrl';

const { Text } = Typography;

/**
 * Molécula: modal listado extra de personas (+N) del dashboard.
 */
const DashboardPersonasOverflowModal = ({
    open,
    title,
    items = [],
    listPath,
    onClose,
    onNavigateList,
}) => {
    const handleNavigateList = () => {
        if (onNavigateList && listPath) {
            onNavigateList(listPath);
        }
    };

    return (
        <Modal
            title={title}
            open={open}
            onCancel={onClose}
            footer={[
                <Button key="close" onClick={onClose}>
                    Cerrar
                </Button>,
                <Button
                    key="all"
                    type="primary"
                    onClick={handleNavigateList}
                    disabled={!listPath || !onNavigateList}
                >
                    Ver listado completo
                </Button>,
            ]}
            destroyOnHidden
        >
            {items.length === 0 ? (
                <Empty description="No hay personas para mostrar" />
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {items.map((item, index) => (
                        <div
                            key={item.id || item.name || index}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                padding: '12px 0',
                                borderBottom:
                                    index < items.length - 1
                                        ? '1px solid #f0f0f0'
                                        : 'none',
                            }}
                        >
                            <Avatar
                                src={dashboardAvatarUrl(item.avatarSeed)}
                                size={40}
                            />

                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <Text strong>{item.name}</Text>

                                {item.description && (
                                    <Text type="secondary">
                                        {item.description}
                                    </Text>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Modal>
    );
};

export default DashboardPersonasOverflowModal;