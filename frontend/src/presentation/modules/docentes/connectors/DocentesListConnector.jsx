/**
 * Conector: lista de docentes + providers.
 */

import { DocentesProvider, DocentesListProvider } from '@application-docentes/providers';
import DocentesList from '@docentes/pages/DocentesList';

const DocentesListConnector = () => (
  <DocentesProvider>
    <DocentesListProvider>
      <DocentesList />
    </DocentesListProvider>
  </DocentesProvider>
);

export default DocentesListConnector;
