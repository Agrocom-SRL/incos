import { DiscapacidadProvider } from '@application-configuracion/complementarios/providers';
import ComplementariosPage from '@configuracion/complementarios/pages/ComplementariosPage';

const ComplementariosConnector = () => (
  <DiscapacidadProvider>
    <ComplementariosPage />
  </DiscapacidadProvider>
);

export default ComplementariosConnector;
