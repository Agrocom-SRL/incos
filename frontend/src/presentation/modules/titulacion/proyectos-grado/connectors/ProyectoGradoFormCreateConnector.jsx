/**
 * Conector: alta de proyecto de grado (TUT) — provider + página en modo create.
 * Punto de entrada lazy de la ruta /tutorias/titulacion/registrar.
 */

import { ProyectoGradoFormProvider } from '@application-titulacion/proyectos-grado/providers/ProyectoGradoFormProvider';
import ProyectoGradoFormPage from '@titulacion/proyectos-grado/pages/ProyectoGradoFormPage';

const ProyectoGradoFormCreateConnector = () => (
  <ProyectoGradoFormProvider>
    <ProyectoGradoFormPage mode="create" />
  </ProyectoGradoFormProvider>
);

export default ProyectoGradoFormCreateConnector;
