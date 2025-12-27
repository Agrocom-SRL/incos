/**
 * Provider: NavigationProvider
 * 
 * Single Responsibility: Solo maneja el estado compartido de navegación
 * Open/Closed: Abierto para extensión, cerrado para modificación
 * 
 * Clean Architecture:
 * - Application Layer: Provider que gestiona estado compartido de navegación
 * - Usa: Hook useNavigationMenu para la lógica de navegación
 * - Proporciona: Contexto de navegación a toda la aplicación
 */

import { useNavigationMenu } from '@application-navigation/hooks';
import { NavigationContext } from '@application-navigation/context/NavigationContext';

/**
 * Provider que envuelve la aplicación con el contexto de navegación
 * 
 * @param {Object} props - Props del provider
 * @param {React.ReactNode} props.children - Componentes hijos que tendrán acceso al contexto
 * @param {string} props.defaultSelectedKey - Key del item seleccionado por defecto
 * @param {function} props.onMenuClick - Callback opcional que se ejecuta al hacer click
 */
export const NavigationProvider = ({ 
    children, 
    defaultSelectedKey = 'DASH', 
    onMenuClick 
}) => {
    // Usar el hook de navegación para obtener toda la lógica y estado
    const navigationState = useNavigationMenu(defaultSelectedKey, onMenuClick);

    return (
        <NavigationContext.Provider value={navigationState}>
            {children}
        </NavigationContext.Provider>
    );
};

