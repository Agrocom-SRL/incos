import { SeguridadUsuarioPermisosProvider } from '@/application/modules/seguridad/providers';
import UsuarioAccesosPage from '@modules/seguridad/usuarios/pages/UsuarioAccesosPage.jsx';

const UsuarioAccesosConnector = () => (
  <SeguridadUsuarioPermisosProvider>
    <UsuarioAccesosPage />
  </SeguridadUsuarioPermisosProvider>
);

export default UsuarioAccesosConnector;
