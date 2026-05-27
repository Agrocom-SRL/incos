import { UnderConstruction } from '@components/pages';

export const conveniosRoutes = [
  {
    path: '/configuracion/convenios',
    element: <UnderConstruction />,
    key: 'CFG-CONVENIOS',
    permiso: 'configuracion.convenios',
    accion: 'LISTAR',
    menu: {
      label: 'Empresas y Convenios',
      module: 'CFG',
      parent: 'CFG',
      order: 4,
    },
  },
];

export default conveniosRoutes;
