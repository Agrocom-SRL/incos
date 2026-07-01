import { SeguridadUsuariosListProvider } from '@/application/modules/seguridad/providers';
import UsuariosListPage from '@modules/seguridad/usuarios/pages/UsuariosListPage.jsx';

const UsuariosListConnector = () => (
  <SeguridadUsuariosListProvider>
    <UsuariosListPage />
  </SeguridadUsuariosListProvider>
);

export default UsuariosListConnector;
