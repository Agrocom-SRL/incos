/**
 * Conector: detalle de una licencia estudiantil (ACA-ASI-LIC-DET).
 * Monta LicenciaDetalleProvider (carga + decisión) y la página de detalle.
 */

import { useParams } from 'react-router-dom';
import { LicenciaDetalleProvider } from '@application-academico/asistencia/providers/LicenciaDetalleProvider.jsx';
import LicenciaDetailPage from '../pages/LicenciaDetailPage.jsx';

const LicenciaDetailConnector = () => {
  const { id } = useParams();
  return (
    <LicenciaDetalleProvider licenciaId={id}>
      <LicenciaDetailPage />
    </LicenciaDetalleProvider>
  );
};

export default LicenciaDetailConnector;
