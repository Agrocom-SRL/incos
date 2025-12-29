// modules/estudiantes/connectors/ListConnector.jsx
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

import { StudentProvider } from '@application-estudiantes';
import EstudiantesList from '@estudiantes/pages/List/List';

const ListConnector = () => {
  return (
    <StudentProvider>
      <EstudiantesList />
    </StudentProvider>
  );
};

export default ListConnector;

