import {
  DiscapacidadProvider,
  ApoderadoProvider,
  IdiomaProvider,
  EstadoCivilProvider,
} from '@application-configuracion/complementarios/providers';
import ComplementariosPage from '@configuracion/complementarios/pages/ComplementariosPage';

const ComplementariosConnector = () => (
  <DiscapacidadProvider>
    <ApoderadoProvider>
      <IdiomaProvider>
        <EstadoCivilProvider>
          <ComplementariosPage />
        </EstadoCivilProvider>
      </IdiomaProvider>
    </ApoderadoProvider>
  </DiscapacidadProvider>
);

export default ComplementariosConnector;
