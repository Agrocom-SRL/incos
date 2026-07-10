import { ConfigPagosProvider } from '@application-finanzas/providers/ConfigPagosProvider';
import CuentaFormPage from '@finanzas/configuracion/pages/CuentaFormPage.jsx';

const CuentaFormEditConnector = () => (
  <ConfigPagosProvider>
    <CuentaFormPage mode="edit" />
  </ConfigPagosProvider>
);

export default CuentaFormEditConnector;
