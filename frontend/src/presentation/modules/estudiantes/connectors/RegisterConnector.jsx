// modules/estudiantes/connectors/RegisterConnector.jsx
/**
 * Conector: Nexo entre la Vista (Page) y la Lógica de Negocio (Provider)
 * 
 * Single Responsibility: Solo envuelve la página de registro con su Provider específico
 * 
 * Este patrón permite:
 * - Separación clara: Conectores vs Páginas
 * - Carga lazy del Provider solo cuando se necesita
 * - Arquitectura modular: cada módulo gestiona sus propios conectores
 */

import { StudentProvider, StudentRegisterProvider } from '@application-estudiantes/providers';
import EstudiantesRegister from '@estudiantes/pages/EstudiantesRegister';

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

