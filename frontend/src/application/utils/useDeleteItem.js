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
 */

import { useState, useCallback } from 'react';
import { App } from 'antd';
import { showDeleteConfirm } from '@molecules/DeleteConfirmModal';

/**
 * Hook reutilizable para eliminar elementos
 * 
 * @param {Object} options - Opciones del hook
 * @param {Function} options.deleteFn - Función que ejecuta la eliminación (debe retornar Promise)
 * @param {string} options.itemName - Nombre del elemento para el mensaje (opcional)
 * @param {Array} options.itemDetails - Detalles del elemento para mostrar en el diálogo (opcional)
 * @param {Function} options.onSuccess - Callback al eliminar exitosamente (opcional)
 * @param {Function} options.onError - Callback al fallar (opcional)
 * @returns {Object} { deleteItem, loading }
 */
export const useDeleteItem = ({
  deleteFn,
  itemName = 'este elemento',
  itemDetails,
  onSuccess,
  onError,
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
            message.success(`${name} eliminado correctamente`);
            if (onSuccess) {
              onSuccess(result, id);
            }
          } else {
            message.error(result.error || `Error al eliminar ${name}`);
            if (onError) {
              onError(result, id);
            }
          }
        } catch (error) {
          console.error('Error al eliminar:', error);
          message.error(`Error al eliminar ${name}: ${error.message || 'Error desconocido'}`);
          if (onError) {
            onError(error, id);
          }
        } finally {
          setLoading(false);
        }
      },
    });

    return confirmed;
  }, [deleteFn, itemName, itemDetails, onSuccess, onError, message]);

  return { deleteItem, loading };
};

export default useDeleteItem;
