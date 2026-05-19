import { useCallback } from 'react';

/**
 * Handlers de navegación y callbacks de ver / editar.
 */
export function useTableActionsHandlers({
  record,
  navigate,
  editDisabled = false,
  editPath,
  onEdit,
  viewPath,
  viewNavigateState,
  onView,
}) {
  const handleEdit = useCallback(() => {
    if (editDisabled) return;

    if (onEdit) {
      onEdit(record);
    } else if (editPath) {
      navigate(editPath.replace(':id', record.id));
    }
  }, [editDisabled, onEdit, record, editPath, navigate]);

  const handleView = useCallback(() => {
    if (onView) {
      onView(record);
    } else if (viewPath) {
      const path = viewPath.replace(':id', record.id);
      navigate(path, viewNavigateState != null ? { state: viewNavigateState } : undefined);
    }
  }, [onView, record, viewPath, viewNavigateState, navigate]);

  return {
    handleEdit,
    handleView,
  };
}
