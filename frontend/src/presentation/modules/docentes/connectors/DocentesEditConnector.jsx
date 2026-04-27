import { Typography } from 'antd';
import { PermisoGuard } from '@/presentation/guards/PermisoGuard.jsx';
import DocentesForm from '@docentes/pages/DocentesForm';

const fallbackDetalle = (
  <Typography.Text type="danger">
    No tiene permiso para ver el detalle del docente (necesario para cargar el formulario de edición).
  </Typography.Text>
);

const fallbackEditar = (
  <Typography.Text type="danger">No tiene permiso para editar docentes.</Typography.Text>
);

const DocentesEditConnector = () => (
  <PermisoGuard codigo="docentes.ver" accion="DETALLE" fallback={fallbackDetalle}>
    <PermisoGuard codigo="docentes.editar" accion="EDITAR" fallback={fallbackEditar}>
      <DocentesForm mode="edit" />
    </PermisoGuard>
  </PermisoGuard>
);

export default DocentesEditConnector;
