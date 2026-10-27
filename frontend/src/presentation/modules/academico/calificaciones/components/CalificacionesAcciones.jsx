/**
 * Barra de acciones contextuales (sin subnav global).
 */

import { useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined, SettingOutlined } from '@ant-design/icons';
import { ActionButton } from '@atoms';
import { PermisoGuard } from '@presentation/guards/PermisoGuard.jsx';
import { CALIFICACIONES_PERMISOS } from '@application-academico/calificaciones/utils/calificacionesPermisos.js';

const CalificacionesAcciones = ({ children, className = '' }) => (
  <div className={['cal-acciones', className].filter(Boolean).join(' ')}>{children}</div>
);

export const AccionVolverCoordinacion = ({ to }) => {
  const navigate = useNavigate();
  return (
    <PermisoGuard codigo={CALIFICACIONES_PERMISOS.coordinacion} accion="LISTAR">
      <ActionButton
        permiso={CALIFICACIONES_PERMISOS.coordinacion}
        accion="LISTAR"
        variant="back"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(to)}
      >
        Volver a coordinación
      </ActionButton>
    </PermisoGuard>
  );
};

/** Configuración / política de notas (header de coordinación y pantallas relacionadas). */
export const AccionConfiguracionNotas = ({ onClick }) => (
  <ActionButton
    permiso={CALIFICACIONES_PERMISOS.politica}
    accion="LISTAR"
    variant="primary"
    icon={<SettingOutlined />}
    onClick={onClick}
  >
    Configuración de notas
  </ActionButton>
);

export default CalificacionesAcciones;
