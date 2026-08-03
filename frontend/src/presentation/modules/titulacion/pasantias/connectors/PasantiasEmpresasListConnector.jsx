/**
 * Conector: catálogo de empresas de pasantía (TIT) — provider + página.
 * Punto de entrada lazy de la ruta /titulacion/pasantias/empresas.
 */

import { PasantiasEmpresasListProvider } from '@application-titulacion/pasantias/providers/PasantiasEmpresasListProvider';
import PasantiasEmpresasList from '@titulacion/pasantias/pages/PasantiasEmpresasList';

const PasantiasEmpresasListConnector = () => (
  <PasantiasEmpresasListProvider>
    <PasantiasEmpresasList />
  </PasantiasEmpresasListProvider>
);

export default PasantiasEmpresasListConnector;
