import { useTableActionsLayout } from './useTableActionsLayout';
import { useTableActionsPermissions } from './useTableActionsPermissions';
import { useTableActionsDelete } from './useTableActionsDelete';
import { useTableActionsTooltips } from './useTableActionsTooltips';
import { useTableActionsHandlers } from './useTableActionsHandlers';

/**
 * Compone layout, permisos, eliminación, tooltips y handlers de TableActions.
 */
export function useTableActions(props) {
  const {
    record,
    navigate,
    refetch,
    useCaseKey,
    deleteFn: customDeleteFn,
    itemName,
    itemDetails,
    viewPath,
    viewNavigateState,
    editPath,
    onEdit,
    onView,
    editDisabled = false,
    editTitle,
    editDisabledTitle,
    extraActions = [],
    permisos,
  } = props;

  const layout = useTableActionsLayout();
  const permissions = useTableActionsPermissions({ permisos, extraActions });
  const deleteState = useTableActionsDelete({
    record,
    useCaseKey,
    deleteFn: customDeleteFn,
    itemName,
    itemDetails,
    refetch,
  });
  const tooltips = useTableActionsTooltips({
    itemName,
    editTitle,
    editDisabledTitle,
    editDisabled,
  });
  const handlers = useTableActionsHandlers({
    record,
    navigate,
    editDisabled,
    editPath,
    onEdit,
    viewPath,
    viewNavigateState,
    onView,
  });

  return {
    ...layout,
    ...permissions,
    ...deleteState,
    ...tooltips,
    ...handlers,
    viewPath,
    editPath,
    onEdit,
    onView,
    editDisabled,
    useCaseKey,
    customDeleteFn,
  };
}
