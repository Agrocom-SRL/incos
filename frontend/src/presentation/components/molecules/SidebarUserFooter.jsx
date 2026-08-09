// src/presentation/components/molecules/SidebarUserFooter.jsx
import { Flex, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '@atoms';
import { useAuthContext } from '@application-auth';
import { buildInitials } from '@application/utils/formatters';
import RolPill from './RolPill';
import './SidebarUserFooter.css';

const { Text } = Typography;

/**
 * SidebarUserFooter - Identidad del usuario (avatar + nombre + rol) fija
 * debajo del menú de navegación del Sidebar. Clic → "Mi perfil" (mismo
 * destino que el cuadro de identidad de HeaderRight, /perfil).
 *
 * Single Responsibility: Solo muestra quién es el usuario autenticado y su rol.
 */
const SidebarUserFooter = ({ collapsed = false }) => {
    const { user } = useAuthContext();
    const navigate = useNavigate();
    const nombre = user?.vinculo_perfil?.nombre_completo || user?.username || 'Usuario';

    const irAPerfil = () => navigate('/perfil');

    return (
        <Flex
            align="center"
            gap="small"
            className="sidebar-user-footer"
            title={collapsed ? nombre : 'Ir a mi perfil'}
            role="button"
            tabIndex={0}
            aria-label="Ir a mi perfil"
            onClick={irAPerfil}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    irAPerfil();
                }
            }}
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
