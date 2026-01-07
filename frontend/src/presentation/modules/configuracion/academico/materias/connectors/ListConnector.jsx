// modules/configuracion/academico/materias/connectors/ListConnector.jsx
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

import { MateriaProvider } from '@application-configuracion/academico/materias/providers';
import MateriasList from '@configuracion/academico/materias/pages/MateriasList';

const ListConnector = () => {
  return (
    <MateriaProvider>
      <MateriasList />
    </MateriaProvider>
  );
};

export default ListConnector;

