/**
 * TableActions - Componente genérico reutilizable para acciones de tabla
 * 
 * Single Responsibility: Renderizar botones de acción con lógica de eliminación
 * 
 * Atomic Design: Molecule
 * - Combina IconButtons con lógica de eliminación genérica
 * - Reutilizable en todas las tablas del sistema
 */

import { IconButton } from '@atoms';
import { TableCell } from '@molecules';
import { Tooltip, Grid } from 'antd';
import { getDataTableAction } from '@config/icons';
import { useDeleteItem } from '@application/utils/useDeleteItem';
import { useContainer } from '@container';

/**
 * Componente genérico de acciones para tablas
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.record - Registro de la fila
 * @param {Function} props.navigate - Función de navegación
 * @param {Function} props.refetch - Función para recargar datos
 * @param {string} props.useCaseKey - Clave del use case en el container (ej: 'eliminarPagoAporte')
 * @param {Function} props.deleteFn - Función personalizada de eliminación (opcional, tiene prioridad sobre useCaseKey)
 * @param {string} props.itemName - Nombre del elemento para el mensaje (ej: 'el pago')
 * @param {Array} props.itemDetails - Detalles del elemento para mostrar en el diálogo (opcional)
 * @param {string} props.viewPath - Ruta para ver detalle (ej: '/pagos/:id')
 * @param {string} props.editPath - Ruta para editar (opcional, ej: '/pagos/:id/editar')
 * @param {Function} props.onEdit - Función personalizada para editar (opcional)
 * @param {Function} props.onView - Función personalizada para ver (opcional)
 * @param {boolean} props.editDisabled - Si el botón de editar debe estar deshabilitado (opcional)
 * @param {Object} props.extraActions - Acciones adicionales (opcional)
 */
const TableActions = ({
  record,
  navigate,
  refetch,
  useCaseKey,
  deleteFn: customDeleteFn,
  itemName,
  itemDetails,
  viewPath,
  editPath,
  onEdit,
  onView,
  editDisabled = false,
  extraActions = [],
}) => {
  const screens = Grid.useBreakpoint();
  const isSmall = !screens.lg;
  const actionsDirection = isSmall ? 'vertical' : 'horizontal';
  const actionsSize = isSmall ? 'small' : 'middle';

  const container = useContainer();
  const viewAction = getDataTableAction('view');
  const editAction = getDataTableAction('edit');
  const deleteAction = getDataTableAction('delete');

  // Obtener el use case de eliminación si está disponible
  let eliminarUseCase = null;
  if (useCaseKey && !customDeleteFn) {
    try {
      eliminarUseCase = container.resolve(useCaseKey);
    } catch (error) {
      console.warn(`Use case ${useCaseKey} no encontrado en el container`);
    }
  }

  // Función de eliminación: prioriza customDeleteFn, luego use case, luego error
  const deleteFn = customDeleteFn
    ? customDeleteFn
    : eliminarUseCase
      ? (id) => eliminarUseCase.ejecutar(id)
      : null;

  // Determinar si hay funcionalidad de eliminación disponible
  const hasDeleteFunctionality = !!deleteFn;

  // Hook para manejar la eliminación (solo si hay función disponible)
  const { deleteItem } = useDeleteItem({
    deleteFn: deleteFn || (async () => ({ success: false, error: 'Funcionalidad no disponible' })),
    itemName: itemName || `el elemento #${record.id}`,
    itemDetails: itemDetails,
    onSuccess: () => {
      // Recargar la lista después de eliminar
      // Si deleteFn viene del contexto, el estado ya se actualizó automáticamente
      // pero aún así llamamos refetch para asegurar sincronización
      if (refetch) {
        refetch();
      }
    },
  });

  const handleEdit = () => {
    // Si el botón está deshabilitado, no hacer nada
    if (editDisabled) {
      console.log('[TableActions] Botón de editar deshabilitado, no se ejecuta handleEdit');
      return;
    }
    
    if (onEdit) {
      onEdit(record);
    } else if (editPath) {
      navigate(editPath.replace(':id', record.id));
    } else {
      console.log('Editar:', record.id);
    }
  };

  const handleView = () => {
    if (onView) {
      onView(record);
    } else if (viewPath) {
      navigate(viewPath.replace(':id', record.id));
    }
  };

  const handleDelete = () => {
    if (hasDeleteFunctionality) {
      deleteItem(record.id);
    } else {
      console.warn('Funcionalidad de eliminación no disponible');
    }
  };

  return (
    <TableCell actions align="right" orientation={actionsDirection} size={actionsSize}>
      {viewPath && (
        <Tooltip title={`${viewAction.tooltip} ${itemName || 'elemento'}`}>
          <IconButton
            icon={<viewAction.icon />}
            variant={viewAction.variant}
            onClick={handleView}
          />
        </Tooltip>
      )}
      {(editPath || onEdit) && (
        <Tooltip title={editDisabled 
          ? `No se puede editar este tipo de inscripción` 
          : `${editAction.tooltip} ${itemName || 'elemento'}`}>
          <IconButton
            icon={<editAction.icon />}
            variant={editAction.variant}
            onClick={handleEdit}
            disabled={editDisabled}
            onMouseEnter={() => {
              if (editDisabled) {
                console.log('[TableActions] Botón de editar deshabilitado. editDisabled:', editDisabled);
              }
            }}
          />
        </Tooltip>
      )}
      {extraActions.map((action, index) => (
        <Tooltip key={index} title={action.tooltip || action.title}>
          <IconButton
            icon={action.icon}
            variant={action.variant || 'default'}
            onClick={() => action.onClick(record)}
          />
        </Tooltip>
      ))}
      {hasDeleteFunctionality && (
        <Tooltip title={`${deleteAction.tooltip} ${itemName || 'elemento'}`}>
          <IconButton
            icon={<deleteAction.icon />}
            variant={deleteAction.variant}
            onClick={handleDelete}
          />
        </Tooltip>
      )}
      {!hasDeleteFunctionality && (useCaseKey || customDeleteFn) && (
        <Tooltip title="Eliminación no disponible">
          <IconButton
            icon={<deleteAction.icon />}
            variant={deleteAction.variant}
            disabled
          />
        </Tooltip>
      )}
    </TableCell>
  );
};

export default TableActions;
