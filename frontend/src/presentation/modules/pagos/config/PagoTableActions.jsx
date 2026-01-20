/**
 * PagoTableActions - Componente para las acciones de la tabla de pagos
 * 
 * Single Responsibility: Renderizar botones de acción con lógica de eliminación
 * 
 * Atomic Design: Molecule
 * - Usa TableActions genérico con configuración específica de pagos
 */

import TableActions from '@molecules/TableActions';

const PagoTableActions = ({ record, navigate, refetch }) => {
  return (
    <TableActions
      record={record}
      navigate={navigate}
      refetch={refetch}
      useCaseKey="eliminarPagoAporte"
      itemName={`el pago #${record.numeroRecibo || record.id}`}
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
