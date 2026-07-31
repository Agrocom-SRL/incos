/**
 * Conector: alta de proyecto de grado (TUT) — provider + página en modo create.
 * Punto de entrada lazy de la ruta /tutorias/titulacion/registrar.
 */

import { ProyectoGradoFormProvider } from '@application-tutorias/titulacion/providers/ProyectoGradoFormProvider';
import ProyectoGradoFormPage from '@tutorias/titulacion/pages/ProyectoGradoFormPage';

const ProyectoGradoFormCreateConnector = () => (
  <ProyectoGradoFormProvider>
    <ProyectoGradoFormPage mode="create" />
  </ProyectoGradoFormProvider>
);

export default ProyectoGradoFormCreateConnector;
