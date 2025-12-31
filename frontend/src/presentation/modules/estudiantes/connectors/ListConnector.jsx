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

import { StudentProvider, StudentListProvider } from '@application-estudiantes/providers';
import EstudiantesList from '@estudiantes/pages/EstudiantesList';

const ListConnector = () => {
  return (
    <StudentProvider>
      <StudentListProvider>
        <EstudiantesList />
      </StudentListProvider>
    </StudentProvider>
  );
};

export default ListConnector;

