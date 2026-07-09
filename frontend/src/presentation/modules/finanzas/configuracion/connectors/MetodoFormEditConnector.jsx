import { ConfigPagosProvider } from '@application-finanzas/providers/ConfigPagosProvider';
import MetodoFormPage from '@finanzas/configuracion/pages/MetodoFormPage.jsx';

const MetodoFormEditConnector = () => (
  <ConfigPagosProvider>
    <MetodoFormPage />
  </ConfigPagosProvider>
);

export default MetodoFormEditConnector;
