import { ConfigPagosProvider } from '@application-finanzas/providers/ConfigPagosProvider';
import BancoFormPage from '@finanzas/configuracion/pages/BancoFormPage.jsx';

const BancoFormCreateConnector = () => (
  <ConfigPagosProvider>
    <BancoFormPage mode="create" />
  </ConfigPagosProvider>
);

export default BancoFormCreateConnector;
