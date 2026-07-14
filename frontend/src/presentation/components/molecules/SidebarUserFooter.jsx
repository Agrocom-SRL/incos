// src/presentation/components/molecules/SidebarUserFooter.jsx
import { Flex, Typography } from 'antd';
import { Avatar } from '@atoms';
import { useAuthContext } from '@application-auth';
import { buildInitials } from '@application/utils/formatters';
import RolPill from './RolPill';
import './SidebarUserFooter.css';

const { Text } = Typography;

/**
 * SidebarUserFooter - Identidad del usuario (avatar + nombre + rol) fija
 * debajo del menú de navegación del Sidebar.
 *
 * Single Responsibility: Solo muestra quién es el usuario autenticado y su rol.
 */
const SidebarUserFooter = ({ collapsed = false }) => {
    const { user } = useAuthContext();
    const nombre = user?.vinculo_perfil?.nombre_completo || user?.username || 'Usuario';

    return (
        <Flex
            align="center"
            gap="small"
            className="sidebar-user-footer"
            title={collapsed ? nombre : undefined}
        >
            <Avatar className="sidebar-user-footer__avatar">
                {buildInitials(nombre)}
            </Avatar>
            {!collapsed && (
                <div className="sidebar-user-footer__meta">
                    <Text className="sidebar-user-footer__name" ellipsis={{ tooltip: nombre }}>
                        {nombre}
                    </Text>
                    <RolPill rol={user?.rol} />
                </div>
            )}
        </Flex>
    );
};

export default SidebarUserFooter;
