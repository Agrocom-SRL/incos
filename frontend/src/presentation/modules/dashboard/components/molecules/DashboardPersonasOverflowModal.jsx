import { Modal, Button, List, Avatar } from 'antd';
import { dashboardAvatarUrl } from '../../utils/dashboardAvatarUrl';

/**
 * Molécula: modal listado extra de personas (+N) del dashboard.
 */
const DashboardPersonasOverflowModal = ({
    open,
    title,
    items,
    listPath,
    onClose,
    onNavigateList,
}) => {
    return (
        <Modal
            title={title}
            open={open}
            onCancel={onClose}
            footer={[
                <Button key="close" onClick={onClose}>
                    Cerrar
                </Button>,
                <Button key="all" type="primary" onClick={() => onNavigateList(listPath)}>
                    Ver listado completo
                </Button>,
            ]}
            destroyOnHidden
        >
            <List
                dataSource={items}
                renderItem={(item) => (
                    <List.Item>
                        <List.Item.Meta
                            avatar={<Avatar src={dashboardAvatarUrl(item.avatarSeed)} size={40} />}
                            title={item.name}
                            description={item.description || undefined}
                        />
                    </List.Item>
                )}
            />
        </Modal>
    );
};

export default DashboardPersonasOverflowModal;
