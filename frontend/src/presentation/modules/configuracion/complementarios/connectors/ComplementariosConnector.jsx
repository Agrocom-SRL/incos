import {
  DiscapacidadProvider,
  ApoderadoProvider,
  IdiomaProvider,
} from '@application-configuracion/complementarios/providers';
import ComplementariosPage from '@configuracion/complementarios/pages/ComplementariosPage';

const ComplementariosConnector = () => (
  <DiscapacidadProvider>
    <ApoderadoProvider>
      <IdiomaProvider>
        <ComplementariosPage />
      </IdiomaProvider>
    </ApoderadoProvider>
  </DiscapacidadProvider>
);

export default ComplementariosConnector;
