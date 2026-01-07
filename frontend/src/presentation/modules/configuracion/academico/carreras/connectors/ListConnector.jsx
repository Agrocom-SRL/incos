// modules/configuracion/academico/carreras/connectors/ListConnector.jsx
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

import { CarreraProvider } from '@application-configuracion/academico/carreras/providers';
import CarrerasList from '@configuracion/academico/carreras/pages/CarrerasList';

const ListConnector = () => {
  return (
    <CarreraProvider>
      <CarrerasList />
    </CarreraProvider>
  );
};

export default ListConnector;

