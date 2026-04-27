import { Typography } from 'antd';
import { PermisoGuard } from '@/presentation/guards/PermisoGuard.jsx';
import DocentesForm from '@docentes/pages/DocentesForm';

const fallback = (
  <Typography.Text type="danger">No tiene permiso para registrar docentes.</Typography.Text>
);

const DocentesCreateConnector = () => (
  <PermisoGuard codigo="docentes.crear" accion="CREAR" fallback={fallback}>
    <DocentesForm mode="create" />
  </PermisoGuard>
);

export default DocentesCreateConnector;
