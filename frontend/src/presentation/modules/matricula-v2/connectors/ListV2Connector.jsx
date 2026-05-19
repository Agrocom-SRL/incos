/**
 * Conector: listado de matrículas v2 (UI rediseñada, datos del API existente).
 */
import { InscripcionesProvider } from '@application-inscripciones/providers';
import MatriculaListV2 from '../pages/MatriculaListV2';

const ListV2Connector = () => (
  <InscripcionesProvider>
    <MatriculaListV2 />
  </InscripcionesProvider>
);

export default ListV2Connector;
