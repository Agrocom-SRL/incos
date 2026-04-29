import { SeguridadUsuarioCreateProvider } from '@/application/modules/seguridad/providers';
import UsuarioCreatePage from '@modules/seguridad/pages/UsuarioCreatePage.jsx';

const UsuarioCreateConnector = () => (
  <SeguridadUsuarioCreateProvider>
    <UsuarioCreatePage />
  </SeguridadUsuarioCreateProvider>
);

export default UsuarioCreateConnector;
