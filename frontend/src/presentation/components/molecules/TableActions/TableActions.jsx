/**
 * TableActions - Acciones de fila en tablas (ver, editar, eliminar, extras)
 *
 * Atomic Design: Molécula
 * - UI en este archivo; lógica en hooks/; utilidades en utils/
 * - Subcomponente TableActionIcon para cada botón
 */

import TableCell from '../TableCell';
import { useTableActions } from './hooks/useTableActions';
import TableActionIcon from './components/TableActionIcon';

/**
 * @param {Object} props
 * @param {Object} props.record - Registro de la fila
 * @param {Function} props.navigate - Función de navegación
 * @param {Function} [props.refetch] - Recargar datos tras eliminar
 * @param {string} [props.useCaseKey] - Clave del use case de eliminación en el container
 * @param {Function} [props.deleteFn] - Eliminación personalizada (prioridad sobre useCaseKey)
 * @param {string} [props.itemName] - Nombre del ítem para mensajes (ej. 'el pago')
 * @param {Array} [props.itemDetails] - Detalles para el diálogo de confirmación
 * @param {string} [props.viewPath] - Ruta de detalle (ej. '/pagos/:id')
 * @param {Object} [props.viewNavigateState] - Estado opcional para navigate al ver
 * @param {string} [props.editPath] - Ruta de edición (ej. '/pagos/:id/editar')
 * @param {Function} [props.onEdit] - Callback personalizado de edición
 * @param {Function} [props.onView] - Callback personalizado de ver
 * @param {boolean} [props.editDisabled] - Deshabilitar botón editar
 * @param {string} [props.editTitle] - Tooltip editar (define la página)
 * @param {string} [props.editDisabledTitle] - Tooltip editar cuando está deshabilitado
 * @param {Array} [props.extraActions] - Acciones extra { icon, variant, tooltip, onClick, permiso?, accion? }
 * @param {Object} [props.permisos] - { ver, editar, eliminar } con { codigo, accion } o array (OR)
 */
const TableActions = (props) => {
  const { record } = props;

  const {
    actionsDirection,
    actionsSize,
    puedeVer,
    puedeEditar,
    puedeEliminar,
    extraActionsPermitidas,
    hasDeleteFunctionality,
    handleDelete,
    viewAction,
    editAction,
    deleteAction,
    viewTooltip,
    editTooltip,
    deleteTooltip,
    handleView,
    handleEdit,
    viewPath,
    editPath,
    onEdit,
    editDisabled,
    useCaseKey,
    customDeleteFn,
  } = useTableActions(props);

  const showEdit = Boolean(editPath || onEdit);

  return (
    <TableCell
      actions
      align="right"
      orientation={actionsDirection}
      size={actionsSize}
      spaceStyle={{ gap: 4 }}
    >
      {viewPath && puedeVer && (
        <TableActionIcon
          title={viewTooltip}
          icon={<viewAction.icon />}
          variant={viewAction.variant}
          onClick={handleView}
        />
      )}

      {showEdit && puedeEditar && (
        <TableActionIcon
          title={editTooltip}
          icon={<editAction.icon />}
          variant={editAction.variant}
          onClick={handleEdit}
          disabled={editDisabled}
        />
      )}

      {extraActionsPermitidas.map((action, index) => (
        <TableActionIcon
          key={action.key ?? index}
          title={action.tooltip || action.title}
          icon={action.icon}
          variant={action.variant || 'default'}
          onClick={() => action.onClick(record)}
          disabled={action.disabled}
        />
      ))}

      {hasDeleteFunctionality && puedeEliminar && (
        <TableActionIcon
          title={deleteTooltip}
          icon={<deleteAction.icon />}
          variant={deleteAction.variant}
          onClick={handleDelete}
        />
      )}

      {!hasDeleteFunctionality && (useCaseKey || customDeleteFn) && puedeEliminar && (
        <TableActionIcon
          title="Eliminación no disponible"
          icon={<deleteAction.icon />}
          variant={deleteAction.variant}
          disabled
        />
      )}
    </TableCell>
  );
};

export default TableActions;
