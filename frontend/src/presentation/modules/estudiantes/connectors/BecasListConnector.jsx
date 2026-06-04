/**
 * Conector: lista de becas asignadas (sin provider global pesado).
 */

import { BecasListProvider } from '@application-estudiantes/providers';
import BecasList from '@estudiantes/pages/BecasList';

const BecasListConnector = () => (
  <BecasListProvider>
    <BecasList />
  </BecasListProvider>
);

export default BecasListConnector;
