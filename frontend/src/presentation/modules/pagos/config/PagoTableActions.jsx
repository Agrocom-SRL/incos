/**
 * PagoTableActions - Componente para las acciones de la tabla de pagos
 *
 * Single Responsibility: Renderizar botones de acción con lógica de eliminación
 *
 * Atomic Design: Molecule
 * - Usa TableActions genérico con configuración específica de pagos
 * - Cuando deletePago (del contexto) está disponible: usa deleteFn + itemDetails para el diálogo
 * - Si no: usa useCaseKey (eliminarPagoAporte) y itemName genérico
 */

import { TableActions } from '@molecules';

const PagoTableActions = ({
  record,
  navigate,
  refetch,
  deletePago = null,
  itemName,
  itemDetails = [],
  viewNavigateState = undefined,
  permisos = undefined,
  onEdit = undefined,
}) => {
  const recibo = record.numeroRecibo || record.receipt_number || record.numero_recibo;
  const fallbackItemName = recibo ? `el aporte (recibo ${recibo})` : `el aporte #${record.id}`;

  return (
    <TableActions
      record={record}
      navigate={navigate}
      refetch={refetch}
      useCaseKey={deletePago ? null : 'eliminarPagoAporte'}
      deleteFn={deletePago}
      itemName={itemName ?? fallbackItemName}
      itemDetails={itemDetails?.length ? itemDetails : undefined}
      viewPath="/pagos/:id"
      viewNavigateState={viewNavigateState}
      onEdit={onEdit}
      permisos={permisos}
    />
  );
};

export default PagoTableActions;
