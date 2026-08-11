/**
 * Conector: registrar acta de defensa de un proyecto de grado (TIT) —
 * provider + página. Punto de entrada lazy de la ruta
 * /titulacion/proyectos-grado/:id/acta-defensa.
 */

import { useParams } from 'react-router-dom';
import { RegistrarActaDefensaProvider } from '@application-titulacion/proyectos-grado/providers/RegistrarActaDefensaProvider';
import RegistrarActaDefensaPage from '@titulacion/proyectos-grado/pages/RegistrarActaDefensaPage';

const RegistrarActaDefensaConnector = () => {
  const { id } = useParams();

  return (
    <RegistrarActaDefensaProvider proyectoId={id}>
      <RegistrarActaDefensaPage />
    </RegistrarActaDefensaProvider>
  );
};

export default RegistrarActaDefensaConnector;
