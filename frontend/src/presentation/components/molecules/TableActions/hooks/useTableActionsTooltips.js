import { useMemo } from 'react';
import { getDataTableAction } from '@config/icons';

/**
 * Tooltips de ver, editar y eliminar (texto definido por la página vía props).
 */
export function useTableActionsTooltips({
  itemName,
  editTitle,
  editDisabledTitle,
  editDisabled = false,
}) {
  const viewAction = getDataTableAction('view');
  const editAction = getDataTableAction('edit');
  const deleteAction = getDataTableAction('delete');

  const itemLabel = itemName || 'elemento';

  const viewTooltip = `${viewAction.tooltip} ${itemLabel}`;
  const deleteTooltip = `${deleteAction.tooltip} ${itemLabel}`;

  const defaultEditTooltip = `${editAction.tooltip} ${itemLabel}`;

  const editTooltip = useMemo(() => {
    if (editDisabled) {
      return editDisabledTitle ?? editTitle ?? defaultEditTooltip;
    }
    return editTitle ?? defaultEditTooltip;
  }, [editDisabled, editDisabledTitle, editTitle, defaultEditTooltip]);

  return {
    viewAction,
    editAction,
    deleteAction,
    viewTooltip,
    editTooltip,
    deleteTooltip,
  };
}
