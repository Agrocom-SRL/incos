/**
 * Conector: edición de una cuota desde la lista (cabecera :id de pago_aporte).
 */

import { useParams } from 'react-router-dom';
import { PagosProvider, PagosDetailProvider } from '@application-pagos/providers';
import PagosEditarCuota from '../pages/PagosEditarCuota';

const PagosEditarCuotaConnector = () => {
  const { id } = useParams();
  const pagoId = id ? parseInt(id, 10) : null;

  return (
    <PagosProvider>
      <PagosDetailProvider pagoId={pagoId}>
        <PagosEditarCuota />
      </PagosDetailProvider>
    </PagosProvider>
  );
};

export default PagosEditarCuotaConnector;
