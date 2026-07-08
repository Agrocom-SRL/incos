import { ActividadProvider } from '@application-configuracion/actividades/providers';
import ActividadesList from '@configuracion/actividades/pages/ActividadesList';

const ActividadesListConnector = () => (
  <ActividadProvider>
    <ActividadesList />
  </ActividadProvider>
);

export default ActividadesListConnector;
