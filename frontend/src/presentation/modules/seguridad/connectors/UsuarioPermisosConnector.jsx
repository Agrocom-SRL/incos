import { SeguridadUsuarioPermisosProvider } from '@/application/modules/seguridad/providers';
import UsuarioPermisosPage from '@modules/seguridad/pages/UsuarioPermisosPage.jsx';

const UsuarioPermisosConnector = () => (
  <SeguridadUsuarioPermisosProvider>
    <UsuarioPermisosPage />
  </SeguridadUsuarioPermisosProvider>
);

export default UsuarioPermisosConnector;
