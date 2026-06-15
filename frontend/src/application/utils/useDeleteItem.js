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
 * - Feedback vía notification (App.useApp), alineado a EvaluacionDrawer / calificaciones
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
  const { notification, modal } = App.useApp();

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
            notification.success({
              title: 'Eliminación correcta',
              description: `${name} fue eliminado.`,
            });
            if (onSuccess) {
              onSuccess(result, id);
            }
          } else {
            const errorMsg = result.error || `Error al eliminar ${name}`;
            notification.error({
              title: 'Error al eliminar',
              description: errorMsg,
            });
            if (onError) {
              onError(result, id);
            }
          }
        } catch (error) {
          console.error('Error al eliminar:', error);
          notification.error({
            title: 'Error al eliminar',
            description: error.message || `No se pudo eliminar ${name}.`,
          });
          if (onError) {
            onError(error, id);
          }
        } finally {
          setLoading(false);
        }
      },
    });

    return confirmed;
  }, [deleteFn, itemName, itemDetails, onSuccess, onError, notification, modal]);

  return { deleteItem, loading };
};

export default useDeleteItem;
