/**
 * Conector: ficha de pago de aporte (Finanzas) — provider + página.
 * Punto de entrada lazy de la ruta FIN-PAG-DETALLE (/finanzas/pagos/:id).
 * El id se obtiene de `useParams` (mismo patrón que `DocentesDetailConnector`).
 */

import { useParams } from 'react-router-dom';
import { PagosDetailProvider } from '@application-finanzas/providers/PagosDetailProvider';
import PagosDetail from '@finanzas/pagos/pages/PagosDetail';

const PagosDetailConnector = () => {
  const { id } = useParams();
  return (
    <PagosDetailProvider pagoId={id}>
      <PagosDetail />
    </PagosDetailProvider>
  );
};

export default PagosDetailConnector;
