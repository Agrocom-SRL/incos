import { ConfigPagosProvider } from '@application-finanzas/providers/ConfigPagosProvider';
import CuentaFormPage from '@finanzas/configuracion/pages/CuentaFormPage.jsx';

const CuentaFormCreateConnector = () => (
  <ConfigPagosProvider>
    <CuentaFormPage mode="create" />
  </ConfigPagosProvider>
);

export default CuentaFormCreateConnector;
