/**
 * Hook: useMessage
 * 
 * Single Responsibility: Proporcionar una función para mostrar mensajes usando Ant Design
 * 
 * Clean Architecture:
 * - Application Layer: Hook genérico compartido para manejo de mensajes/notificaciones
 * - Abstrae la implementación de Ant Design message API
 * - Puede ser usado por cualquier módulo de la aplicación
 * 
 * SOLID Principles:
 * - Single Responsibility: Solo maneja la lógica de mostrar mensajes
 * - Dependency Inversion: Depende de la abstracción de Ant Design (App.useApp)
 * - Open/Closed: Extensible para agregar nuevos tipos de mensajes sin modificar código existente
 * 
 * Ubicación: application/utils/hooks/ (utilidad compartida entre módulos)
 * 
 * Uso:
 * ```javascript
 * import { useMessage } from '@application/utils';
 * 
 * const MyComponent = () => {
 *   const showMessage = useMessage();
 *   showMessage('success', 'Operación exitosa');
 *   showMessage('error', 'Error al procesar');
 * };
 * ```
 */

import { useMemo } from 'react';
import { App } from 'antd';

/**
 * Hook para mostrar mensajes usando Ant Design
 * 
 * @returns {Function} Función showMessage(type, content) donde:
 *   - type: 'success' | 'error' | 'warning' | 'info'
 *   - content: string - Mensaje a mostrar
 */
export const useMessage = () => {
  const { message } = App.useApp();

  const showMessage = useMemo(() => {
    return (type, content) => {
      switch (type) {
        case 'success':
          message.success(content);
          break;
        case 'error':
          message.error(content);
          break;
        case 'warning':
          message.warning(content);
          break;
        case 'info':
          message.info(content);
          break;
        default:
          message.info(content);
      }
    };
  }, [message]);

  return showMessage;
};

