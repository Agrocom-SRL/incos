// src/presentation/components/molecules/NavigationMenu.jsx
/**
 * NavigationMenu - Componente molecular del menú de navegación
 * 
 * Single Responsibility: Solo renderiza el menú de navegación
 * 
 * Clean Architecture:
 * - Presentation Layer: Componente molecular de UI
 * - Usa: Hook de aplicación (useNavigationContext) para acceder al contexto de navegación
 * 
 * Dependency Inversion: Depende de abstracción (contexto) no de implementación
 */
import { Menu } from 'antd';
import { useNavigationContext } from '@application-navigation';

const NavigationMenu = ({
    collapsed = false
}) => {
    // Obtener el estado y funciones del contexto de navegación
    const {
        selectedKeys,
        openKeys,
        menuItemsWithIcons,
        handleMenuClick,
        handleOpenChange,
    } = useNavigationContext();

    return (
        <Menu
            mode="inline"
            selectedKeys={selectedKeys}
            openKeys={openKeys}
            className="navigation-menu"
            items={menuItemsWithIcons}
            onClick={handleMenuClick}
            onOpenChange={handleOpenChange}
            inlineCollapsed={collapsed}
        />
    );
};

export default NavigationMenu;