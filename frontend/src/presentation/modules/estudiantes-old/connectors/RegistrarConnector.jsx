// modules/estudiantes-old/connectors/RegistrarConnector.jsx
/**
 * Conector: Nexo entre la Vista (Page) y la Lógica de Negocio (Provider)
 * 
 * Single Responsibility: Solo envuelve la página con su Provider específico
 * 
 * Este patrón permite:
 * - Separación clara: Conectores vs Páginas
 * - Carga lazy del Provider solo cuando se necesita
 * - Arquitectura modular: cada módulo gestiona sus propios conectores
 */

import { StudentProvider } from '@application-estudiantes-old/providers';
import Registrar from '@estudiantes-old/pages/Registrar/Registrar';

const RegistrarConnector = () => {
  return (
    <StudentProvider>
      <Registrar />
    </StudentProvider>
  );
};

export default RegistrarConnector;
