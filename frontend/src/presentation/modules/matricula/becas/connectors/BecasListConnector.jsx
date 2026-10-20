/**
 * Conector: lista de becas asignadas (sin provider global pesado).
 */

import { BecasListProvider } from '@application-matricula/becas/providers/BecasListProvider';
import BecasList from '@matricula/becas/pages/BecasList';

const BecasListConnector = () => (
  <BecasListProvider>
    <BecasList />
  </BecasListProvider>
);

export default BecasListConnector;
