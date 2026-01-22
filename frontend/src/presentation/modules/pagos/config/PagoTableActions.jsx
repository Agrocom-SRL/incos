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

import TableActions from '@molecules/TableActions';

const PagoTableActions = ({
  record,
  navigate,
  refetch,
  deletePago = null,
  itemName,
  itemDetails = [],
}) => {
  const fallbackItemName = `el pago #${record.numeroRecibo || record.receipt_number || record.id}`;

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
      editPath={null}
      onEdit={() => {
        // TODO: Implementar edición de pago
        console.log('Editar pago:', record.id);
      }}
    />
  );
};

export default PagoTableActions;
