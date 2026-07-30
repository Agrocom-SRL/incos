/**
 * Conector: alta de empresa del catálogo de pasantías (TUT) — provider +
 * página en modo create. Punto de entrada lazy de la ruta
 * /tutorias/pasantias/empresas/registrar.
 */

import { PasantiaEmpresaFormProvider } from '@application-tutorias/pasantias/providers/PasantiaEmpresaFormProvider';
import PasantiaEmpresaFormPage from '@tutorias/pasantias/pages/PasantiaEmpresaFormPage';

const PasantiaEmpresaFormCreateConnector = () => (
  <PasantiaEmpresaFormProvider>
    <PasantiaEmpresaFormPage mode="create" />
  </PasantiaEmpresaFormProvider>
);

export default PasantiaEmpresaFormCreateConnector;
