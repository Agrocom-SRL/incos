/**
 * Conector: detalle de docente (Provider + página).
 */

import { useParams } from 'react-router-dom';
import { DocentesDetailProvider } from '@application-docentes/providers';
import DocentesDetail from '@docentes/pages/DocentesDetail';

const DocentesDetailConnector = () => {
  const { id } = useParams();
  return (
    <DocentesDetailProvider docenteId={id}>
      <DocentesDetail />
    </DocentesDetailProvider>
  );
};

export default DocentesDetailConnector;
