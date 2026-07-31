/**
 * Conector: ficha-hub de trámite de pasantía (TUT) — provider + página.
 * Punto de entrada lazy de la ruta /tutorias/pasantias/:id.
 */

import { useParams } from 'react-router-dom';
import { PasantiaDetailProvider } from '@application-titulacion/pasantias/providers/PasantiaDetailProvider';
import PasantiaDetail from '@titulacion/pasantias/pages/PasantiaDetail';

const PasantiaDetailConnector = () => {
  const { id } = useParams();

  return (
    <PasantiaDetailProvider pasantiaId={id}>
      <PasantiaDetail />
    </PasantiaDetailProvider>
  );
};

export default PasantiaDetailConnector;
