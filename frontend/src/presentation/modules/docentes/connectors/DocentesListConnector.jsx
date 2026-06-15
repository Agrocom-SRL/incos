/**
 * Conector: lista de docentes + providers.
 */

import { DocentesListProvider } from '@application-docentes/providers';
import DocentesList from '@docentes/pages/DocentesList';

const DocentesListConnector = () => (
  <DocentesListProvider>
    <DocentesList />
  </DocentesListProvider>
);

export default DocentesListConnector;
