/**
 * Conector: ficha de empresa del catálogo de pasantías (TIT) — provider + página.
 * Punto de entrada lazy de la ruta /titulacion/pasantias/empresas/:empresaId.
 */

import { useParams } from 'react-router-dom';
import { PasantiaEmpresaDetailProvider } from '@application-titulacion/pasantias/providers/PasantiaEmpresaDetailProvider';
import PasantiaEmpresaDetail from '@titulacion/pasantias/pages/PasantiaEmpresaDetail';

const PasantiaEmpresaDetailConnector = () => {
  const { empresaId } = useParams();

  return (
    <PasantiaEmpresaDetailProvider empresaId={empresaId}>
      <PasantiaEmpresaDetail />
    </PasantiaEmpresaDetailProvider>
  );
};

export default PasantiaEmpresaDetailConnector;
