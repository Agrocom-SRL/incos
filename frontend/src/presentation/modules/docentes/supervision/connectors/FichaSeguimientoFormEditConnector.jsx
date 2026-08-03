/**
 * Conector: editar ficha de seguimiento (DOC) — provider (id de la URL) +
 * página en modo edit. Ruta DOC-SUPERVISION-EDITAR
 * (/docentes/supervision/:id/editar).
 */

import { useParams } from 'react-router-dom';
import { FichaSeguimientoFormProvider } from '@application-docentes/supervision/providers/FichaSeguimientoFormProvider';
import FichaSeguimientoFormPage from '@docentes/supervision/pages/FichaSeguimientoFormPage';

const FichaSeguimientoFormEditConnector = () => {
  const { id } = useParams();
  return (
    <FichaSeguimientoFormProvider fichaId={id}>
      <FichaSeguimientoFormPage mode="edit" />
    </FichaSeguimientoFormProvider>
  );
};

export default FichaSeguimientoFormEditConnector;
