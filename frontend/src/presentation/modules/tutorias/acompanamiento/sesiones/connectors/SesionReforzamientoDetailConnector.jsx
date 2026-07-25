/**
 * Conector: ficha de sesión de reforzamiento (TUT) — provider (id de la URL)
 * + página. Punto de entrada lazy de la ruta TUT-SESIONES-DETALLE
 * (/tutorias/acompanamiento/sesiones/:id).
 */

import { useParams } from 'react-router-dom';
import { SesionReforzamientoDetailProvider } from '@application-tutorias/acompanamiento/sesiones/providers/SesionReforzamientoDetailProvider';
import SesionReforzamientoDetail from '@tutorias/acompanamiento/sesiones/pages/SesionReforzamientoDetail';

const SesionReforzamientoDetailConnector = () => {
  const { id } = useParams();
  return (
    <SesionReforzamientoDetailProvider sesionId={id}>
      <SesionReforzamientoDetail />
    </SesionReforzamientoDetailProvider>
  );
};

export default SesionReforzamientoDetailConnector;
