import { UnderConstruction } from '@components/pages';
import { Navigate } from 'react-router-dom';

const ACTIVIDADES_BASE = '/configuracion/actividades';

export const actividadesRoutes = [
  {
    path: '/configuracion/historial-actividades',
    element: <Navigate to={ACTIVIDADES_BASE} replace />,
    key: 'CFG-HISTORIAL-ACTIVIDADES-LEGACY',
    permiso: 'configuracion.historial-actividades',
    accion: 'LISTAR',
    menu: null,
  },
  {
    path: ACTIVIDADES_BASE,
    element: <UnderConstruction />,
    key: 'CFG-ACTIVIDADES',
    permiso: 'configuracion.historial-actividades',
    accion: 'LISTAR',
    menu: {
      label: 'Historial de Actividades',
      module: 'CFG',
      parent: 'CFG',
      order: 5,
    },
  },
];

export default actividadesRoutes;
