import { SeguridadUsuarioDetailProvider } from '@/application/modules/seguridad/providers';
import UsuarioDetailPage from '@modules/seguridad/usuarios/pages/UsuarioDetailPage.jsx';

const UsuarioDetailConnector = ({ initialTab = 'info' }) => (
  <SeguridadUsuarioDetailProvider>
    <UsuarioDetailPage initialTab={initialTab} />
  </SeguridadUsuarioDetailProvider>
);

export default UsuarioDetailConnector;
