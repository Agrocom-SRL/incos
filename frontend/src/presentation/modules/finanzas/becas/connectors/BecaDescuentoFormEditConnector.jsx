import { BecaDescuentoProvider } from '@application-finanzas/becas-descuentos/providers/BecaDescuentoProvider';
import BecaDescuentoFormPage from '@finanzas/becas/pages/BecaDescuentoFormPage.jsx';

const BecaDescuentoFormEditConnector = () => (
  <BecaDescuentoProvider>
    <BecaDescuentoFormPage mode="edit" />
  </BecaDescuentoProvider>
);

export default BecaDescuentoFormEditConnector;
