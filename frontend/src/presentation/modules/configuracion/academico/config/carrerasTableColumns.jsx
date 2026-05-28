/**
 * Columnas de la tabla de carreras (tab Académico).
 */

import { TableActions, TableCell } from '@molecules';
import { carreraEditarPath } from '@application-configuracion/academico/config/paths';

// Tabla de acciones con RBAC (TableActions) en lugar de IconButtons sueltos.
export const createCarrerasTableColumns = (navigate) => {
  return [
    {
      title: 'Código',
      dataIndex: 'codigo',
      fixed: 'left',
      ellipsis: true,
      render: (codigo) => (
        <TableCell strong textStyle={{ fontFamily: 'monospace', fontSize: '13px' }}>
          {codigo}
        </TableCell>
      ),
      sorter: (a, b) => (a.codigo || '').localeCompare(b.codigo || '', undefined, { numeric: true, sensitivity: 'base' }),
      defaultSortOrder: 'ascend',
    },
    {
      title: 'Nombre',
      dataIndex: 'nombre',
      ellipsis: true,
      render: (nombre) => (
        <TableCell strong fallback="Sin nombre">
          {nombre}
        </TableCell>
      ),
      sorter: (a, b) => (a.nombre || 'Sin nombre').localeCompare(b.nombre || 'Sin nombre'),
    },
    {
      title: 'Área de Formación',
      dataIndex: 'areaFormacion',
      ellipsis: true,
      render: (areaFormacion) => <TableCell>{areaFormacion || '-'}</TableCell>,
      sorter: (a, b) => (a.areaFormacion || '').localeCompare(b.areaFormacion || ''),
    },
    {
      title: 'Título Otorgado',
      dataIndex: 'tituloOtorgado',
      ellipsis: true,
      render: (tituloOtorgado) => <TableCell>{tituloOtorgado || '-'}</TableCell>,
      sorter: (a, b) => (a.tituloOtorgado || '').localeCompare(b.tituloOtorgado || ''),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      fixed: 'right',
      width: 140,
      align: 'right',
      render: (_, record) => (
        <TableActions
          record={record}
          navigate={navigate}
          // TableActions solo muestra \"ver\" si viewPath existe; el handler real lo provee onView
          viewPath="/:id"
          onEdit={(r) => navigate(carreraEditarPath(r.id))}
          onView={(r) => navigate(carreraEditarPath(r.id, { view: true }))}
          // Mostrar icono (y habilitar confirmación) aunque el use case aún no exista en factory.
          // Si no está implementado, TableActions lo muestra deshabilitado.
          useCaseKey="eliminarCarrera"
          permisos={{
            ver: { codigo: 'configuracion.carrera', accion: 'DETALLE' },
            editar: { codigo: 'configuracion.carrera', accion: 'EDITAR' },
            // Eliminar queda oculto hasta que exista deleteFn/useCaseKey real
            eliminar: { codigo: 'configuracion.carrera', accion: 'ELIMINAR' },
          }}
        />
      ),
    },
  ];
};
