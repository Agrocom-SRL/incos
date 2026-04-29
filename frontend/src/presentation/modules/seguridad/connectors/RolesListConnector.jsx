import { SeguridadRolesListProvider } from '@/application/modules/seguridad/providers';
import RolesListPage from '@modules/seguridad/pages/RolesListPage.jsx';

const RolesListConnector = () => (
  <SeguridadRolesListProvider>
    <RolesListPage />
  </SeguridadRolesListProvider>
);

export default RolesListConnector;
