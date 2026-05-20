/**
 * Barra de acciones contextuales (sin subnav global).
 */

import { Button } from 'antd';
import { Link } from 'react-router-dom';
import {
  ArrowLeftOutlined,
  DashboardOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { PermisoGuard } from '@presentation/guards/PermisoGuard.jsx';
import { CALIFICACIONES_PERMISOS } from '@application-academico/calificaciones/utils/calificacionesPermisos.js';

const CalificacionesAcciones = ({ children, className = '' }) => (
  <div className={['cal-acciones', className].filter(Boolean).join(' ')}>{children}</div>
);

export const AccionVolverCoordinacion = ({ to }) => (
  <PermisoGuard codigo={CALIFICACIONES_PERMISOS.coordinacion} accion="LISTAR">
    <Link to={to}>
      <Button type="text" icon={<ArrowLeftOutlined />}>
        Volver a coordinación
      </Button>
    </Link>
  </PermisoGuard>
);

/** @deprecated Usar AccionVolverCoordinacion */
export const AccionVolverDocentes = AccionVolverCoordinacion;

export const AccionPoliticaInstitucional = ({ to }) => (
  <PermisoGuard codigo={CALIFICACIONES_PERMISOS.politica} accion="LISTAR">
    <Link to={to}>
      <Button icon={<FileTextOutlined />}>Política institucional</Button>
    </Link>
  </PermisoGuard>
);

export const AccionTableroGestion = ({ to }) => (
  <PermisoGuard codigo={CALIFICACIONES_PERMISOS.tablero} accion="LISTAR">
    <Link to={to}>
      <Button icon={<DashboardOutlined />}>Tablero de gestión</Button>
    </Link>
  </PermisoGuard>
);

export default CalificacionesAcciones;
