import { SeguridadUsuarioDetailProvider } from '@/application/modules/seguridad/providers';
import UsuarioDetailPage from '@modules/seguridad/pages/UsuarioDetailPage.jsx';

const UsuarioDetailConnector = () => (
  <SeguridadUsuarioDetailProvider>
    <UsuarioDetailPage />
  </SeguridadUsuarioDetailProvider>
);

export default UsuarioDetailConnector;
