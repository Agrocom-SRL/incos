// modules/matricula/nuevo/connectors/RegisterConnector.jsx
/**
 * Conector: Nexo entre la Vista (Page) y la Lógica de Negocio (Provider)
 *
 * Single Responsibility: Solo envuelve la página de registro con su Provider específico
 *
 * Este patrón permite:
 * - Separación clara: Conectores vs Páginas
 * - Carga lazy del Provider solo cuando se necesita
 * - Arquitectura modular: cada módulo gestiona sus propios conectores
 *
 * `StudentProvider` es compartido entre 3-4 dominios y se quedó en `matricula/admision/`
 * (Proceso de admisión); este conector cruza hacia allí para consumirlo, igual patrón
 * que `matricula/registro/` con el buscador de estudiantes.
 */

import { StudentProvider } from '@application-matricula/admision/providers';
import { StudentRegisterProvider } from '@application-matricula/nuevo/providers/StudentRegisterProvider';
import EstudiantesRegister from '@matricula/nuevo/pages/EstudiantesRegister';

const RegisterConnector = () => {
  return (
    <StudentProvider>
      <StudentRegisterProvider>
        <EstudiantesRegister />
      </StudentRegisterProvider>
    </StudentProvider>
  );
};

export default RegisterConnector;

