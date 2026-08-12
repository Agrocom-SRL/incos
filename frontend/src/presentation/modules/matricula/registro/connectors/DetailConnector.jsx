// modules/matricula/registro/connectors/DetailConnector.jsx
/**
 * Conector: Nexo entre la Vista (Page) y la Lógica de Negocio (Provider)
 * 
 * Single Responsibility: Solo envuelve la página de detalle con su Provider específico
 * 
 * Este patrón permite:
 * - Separación clara: Conectores vs Páginas
 * - Carga lazy del Provider solo cuando se necesita
 * - Arquitectura modular: cada módulo gestiona sus propios conectores
 * - Obtiene el inscripcionId del parámetro de ruta :id y lo pasa al Provider
 */

import { useParams } from 'react-router-dom';
import { InscripcionesProvider, InscripcionDetailProvider } from '@application-matricula/registro/providers';
import InscripcionesDetail from '@matricula/registro/pages/InscripcionesDetail';

const DetailConnector = () => {
  const { id } = useParams();
  const inscripcionId = id;

  return (
    <InscripcionesProvider>
      <InscripcionDetailProvider inscripcionId={inscripcionId}>
        <InscripcionesDetail />
      </InscripcionDetailProvider>
    </InscripcionesProvider>
  );
};

export default DetailConnector;
