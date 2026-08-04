import { BecaDescuentoProvider } from '@application-finanzas/becas-descuentos/providers/BecaDescuentoProvider';
import BecaDescuentoFormPage from '@finanzas/becas/pages/BecaDescuentoFormPage.jsx';

const BecaDescuentoFormCreateConnector = () => (
  <BecaDescuentoProvider>
    <BecaDescuentoFormPage mode="create" />
  </BecaDescuentoProvider>
);

export default BecaDescuentoFormCreateConnector;
