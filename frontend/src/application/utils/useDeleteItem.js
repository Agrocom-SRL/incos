/**
 * Hook: useDeleteItem
 * 
 * Single Responsibility: Gestionar la lógica de eliminación de elementos
 * 
 * Clean Architecture:
 * - Application Layer: Hook reutilizable para eliminación
 * 
 * Funcionalidades:
 * - Maneja el estado de loading durante la eliminación
 * - Muestra modal de confirmación
 * - Ejecuta la función de eliminación
 * - Maneja errores y muestra mensajes
 * - Los mensajes success/error se cierran al cambiar el foco (pestaña, ventana o clic fuera)
 */

import { useState, useCallback } from 'react';
import { App } from 'antd';
import { showDeleteConfirm } from '@molecules/DeleteConfirmModal';

const MESSAGE_KEY_DELETE_FEEDBACK = 'useDeleteItem-feedback';

/**
 * Muestra un mensaje (success o error) que se cierra al cambiar el foco (visibilitychange o blur).
 * @param {Object} messageApi - message de App.useApp()
 * @param {'success'|'error'} type
 * @param {string} content
 * @param {number} duration - segundos
 */
function showMessageWithFocusClose(messageApi, type, content, duration) {
  const key = MESSAGE_KEY_DELETE_FEEDBACK;
  const destroy = () => {
    messageApi.destroy(key);
    window.removeEventListener('visibilitychange', onFocusChange);
    window.removeEventListener('blur', onFocusChange);
  };
  const onFocusChange = () => {
    destroy();
  };
  window.addEventListener('visibilitychange', onFocusChange);
  window.addEventListener('blur', onFocusChange);
  const api = type === 'success' ? messageApi.success : messageApi.error;
  api({ content, key, duration });
  setTimeout(destroy, duration * 1000);
}

/**
 * Hook reutilizable para eliminar elementos
 * 
 * @param {Object} options - Opciones del hook
 * @param {Function} options.deleteFn - Función que ejecuta la eliminación (debe retornar Promise)
 * @param {string} options.itemName - Nombre del elemento para el mensaje (opcional)
 * @param {Array} options.itemDetails - Detalles del elemento para mostrar en el diálogo (opcional)
 * @param {Function} options.onSuccess - Callback al eliminar exitosamente (opcional)
 * @param {Function} options.onError - Callback al fallar (opcional)
 * @param {number} [options.errorMessageDuration=8] - Duración en segundos del mensaje de error (para dar tiempo a leer)
 * @returns {Object} { deleteItem, loading }
 */
export const useDeleteItem = ({
  deleteFn,
  itemName = 'este elemento',
  itemDetails,
  onSuccess,
  onError,
  errorMessageDuration = 6,
}) => {
  const [loading, setLoading] = useState(false);
  const { message, modal } = App.useApp();

  const deleteItem = useCallback(async (id, customItemName = null, customItemDetails = null) => {
    if (!deleteFn) {
      console.warn('Función de eliminación no disponible');
      return false;
    }

    const name = customItemName || itemName;
    const details = customItemDetails || itemDetails;
    
    const confirmed = await showDeleteConfirm({
      modal,
      itemName: name,
      itemDetails: details,
      onConfirm: async () => {
        setLoading(true);
        try {
          const result = await deleteFn(id);
          
          if (result.success) {
            showMessageWithFocusClose(message, 'success', `${name} eliminado correctamente`, 3);
            if (onSuccess) {
              onSuccess(result, id);
            }
          } else {
            showMessageWithFocusClose(message, 'error', result.error || `Error al eliminar ${name}`, errorMessageDuration);
            if (onError) {
              onError(result, id);
            }
          }
        } catch (error) {
          console.error('Error al eliminar:', error);
          showMessageWithFocusClose(message, 'error', `Error al eliminar ${name}: ${error.message || 'Error desconocido'}`, errorMessageDuration);
          if (onError) {
            onError(error, id);
          }
        } finally {
          setLoading(false);
        }
      },
    });

    return confirmed;
  }, [deleteFn, itemName, itemDetails, onSuccess, onError, message, errorMessageDuration]);

  return { deleteItem, loading };
};

export default useDeleteItem;
