/**
 * Conector: edición de sesión de reforzamiento (TUT) — provider (id de la URL)
 * + página en modo edit. Ruta TUT-SESIONES-EDITAR
 * (/tutorias/acompanamiento/sesiones/:id/editar).
 */

import { useParams } from 'react-router-dom';
import { SesionReforzamientoFormProvider } from '@application-tutorias/acompanamiento/sesiones/providers/SesionReforzamientoFormProvider';
import SesionReforzamientoFormPage from '@tutorias/acompanamiento/sesiones/pages/SesionReforzamientoFormPage';

const SesionReforzamientoFormEditConnector = () => {
  const { id } = useParams();
  return (
    <SesionReforzamientoFormProvider sesionId={id}>
      <SesionReforzamientoFormPage mode="edit" />
    </SesionReforzamientoFormProvider>
  );
};

export default SesionReforzamientoFormEditConnector;
