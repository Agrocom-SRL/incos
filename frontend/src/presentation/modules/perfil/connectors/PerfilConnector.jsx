import { PerfilPageProvider } from '@/application/modules/perfil/providers';
import PerfilPage from '@modules/perfil/pages/PerfilPage.jsx';

const PerfilConnector = () => (
  <PerfilPageProvider>
    <PerfilPage />
  </PerfilPageProvider>
);

export default PerfilConnector;
