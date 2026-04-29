import { SeguridadRolPermisosProvider } from '@/application/modules/seguridad/providers';
import RolPermisosPage from '@modules/seguridad/pages/RolPermisosPage.jsx';

const RolPermisosConnector = () => (
  <SeguridadRolPermisosProvider>
    <RolPermisosPage />
  </SeguridadRolPermisosProvider>
);

export default RolPermisosConnector;
