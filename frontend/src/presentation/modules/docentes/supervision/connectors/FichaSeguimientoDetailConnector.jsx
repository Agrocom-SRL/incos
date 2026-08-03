/**
 * Conector: ficha de seguimiento (DOC) — provider (id de la URL) + página.
 * Ruta DOC-SUPERVISION-DETALLE (/docentes/supervision/:id).
 */

import { useParams } from 'react-router-dom';
import { FichaSeguimientoDetailProvider } from '@application-docentes/supervision/providers/FichaSeguimientoDetailProvider';
import FichaSeguimientoDetail from '@docentes/supervision/pages/FichaSeguimientoDetail';

const FichaSeguimientoDetailConnector = () => {
  const { id } = useParams();
  return (
    <FichaSeguimientoDetailProvider fichaId={id}>
      <FichaSeguimientoDetail />
    </FichaSeguimientoDetailProvider>
  );
};

export default FichaSeguimientoDetailConnector;
