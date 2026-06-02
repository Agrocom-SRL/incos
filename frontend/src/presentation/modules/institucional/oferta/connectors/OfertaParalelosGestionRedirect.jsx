import { Navigate, useParams } from 'react-router-dom';
import { ofertaPaths } from '@application-institucional/oferta';

/** Redirige la ruta legacy de paralelos al resumen por tabs (?plan=). */
const OfertaParalelosGestionRedirect = () => {
  const { gestionId, gestionPlanId } = useParams();
  return (
    <Navigate
      to={ofertaPaths.gestionPlanesConPlan(gestionId, gestionPlanId)}
      replace
    />
  );
};

export default OfertaParalelosGestionRedirect;
