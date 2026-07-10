import { SeguridadRolDetailProvider } from '@/application/modules/seguridad/providers';
import RolDetailPage from '@modules/seguridad/roles/pages/RolDetailPage.jsx';

const RolDetailConnector = () => (
  <SeguridadRolDetailProvider>
    <RolDetailPage />
  </SeguridadRolDetailProvider>
);

export default RolDetailConnector;
