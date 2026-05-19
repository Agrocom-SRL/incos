import { useCallback, useMemo } from 'react';
import { useContainer } from '@container';
import { useDeleteItem } from '@application/utils/useDeleteItem';

/**
 * Resuelve la función de eliminación (custom o use case) y expone deleteItem.
 */
export function useTableActionsDelete({
  record,
  useCaseKey,
  deleteFn: customDeleteFn,
  itemName,
  itemDetails,
  refetch,
}) {
  const container = useContainer();

  const deleteFn = useMemo(() => {
    if (customDeleteFn) return customDeleteFn;

    if (!useCaseKey) return null;

    try {
      const eliminarUseCase = container.resolve(useCaseKey);
      return (id) => eliminarUseCase.ejecutar(id);
    } catch (error) {
      console.warn(`Use case ${useCaseKey} no encontrado en el container`);
      return null;
    }
  }, [customDeleteFn, useCaseKey, container]);

  const hasDeleteFunctionality = Boolean(deleteFn);

  const { deleteItem } = useDeleteItem({
    deleteFn:
      deleteFn ||
      (async () => ({ success: false, error: 'Funcionalidad no disponible' })),
    itemName: itemName || `el elemento #${record.id}`,
    itemDetails,
    onSuccess: () => {
      if (refetch) refetch();
    },
  });

  const handleDelete = useCallback(() => {
    if (hasDeleteFunctionality) {
      deleteItem(record.id);
    } else {
      console.warn('Funcionalidad de eliminación no disponible');
    }
  }, [hasDeleteFunctionality, deleteItem, record.id]);

  return {
    deleteFn,
    hasDeleteFunctionality,
    handleDelete,
  };
}
