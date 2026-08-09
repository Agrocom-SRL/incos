import { BecaDescuentoProvider } from '@application-finanzas/becas-descuentos/providers/BecaDescuentoProvider';
import BecaDescuentoDetailPage from '@finanzas/becas/pages/BecaDescuentoDetailPage.jsx';

const BecaDescuentoDetailConnector = () => (
  <BecaDescuentoProvider>
    <BecaDescuentoDetailPage />
  </BecaDescuentoProvider>
);

export default BecaDescuentoDetailConnector;
