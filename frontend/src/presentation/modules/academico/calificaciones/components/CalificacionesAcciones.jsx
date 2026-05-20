/**
 * Barra de acciones contextuales (sin subnav global).
 */

import { Button } from 'antd';
import { Link } from 'react-router-dom';
import {
  ArrowLeftOutlined,
  DashboardOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { ActionButton } from '@atoms';
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

/** Configuración / política de notas (header de coordinación y pantallas relacionadas). */
export const AccionConfiguracionNotas = ({ onClick }) => (
  <ActionButton
    permiso={CALIFICACIONES_PERMISOS.politica}
    accion="LISTAR"
    variant="outline"
    icon={<SettingOutlined />}
    onClick={onClick}
  >
    Configuración de notas
  </ActionButton>
);

/** @deprecated Usar AccionConfiguracionNotas */
export const AccionPoliticaInstitucional = AccionConfiguracionNotas;

export const AccionTableroGestion = ({ to }) => (
  <PermisoGuard codigo={CALIFICACIONES_PERMISOS.tablero} accion="LISTAR">
    <Link to={to}>
      <Button icon={<DashboardOutlined />}>Tablero de gestión</Button>
    </Link>
  </PermisoGuard>
);

export default CalificacionesAcciones;
