import { ConfigPagosProvider } from '@application-finanzas/providers/ConfigPagosProvider';
import BancoFormPage from '@finanzas/configuracion/pages/BancoFormPage.jsx';

const BancoFormEditConnector = () => (
  <ConfigPagosProvider>
    <BancoFormPage mode="edit" />
  </ConfigPagosProvider>
);

export default BancoFormEditConnector;
