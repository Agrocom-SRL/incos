/**
 * Columnas de la tabla de materias (tab Académico).
 */

import { TableActions, TableCell } from '@molecules';
import { materiaEditarPath } from '@application-configuracion/academico/config/paths';

const getTipoTagColor = (tipo) => {
  const tipoMap = {
    TEORICA: 'blue',
    PRACTICA: 'success',
    TEORICA_PRACTICA: 'info',
  };
  return tipoMap[tipo] || 'default';
};

export const createMateriasTableColumns = (navigate) => {
  return [
    {
      title: 'Sigla',
      dataIndex: 'sigla',
      fixed: 'left',
      ellipsis: true,
      render: (sigla) => (
        <TableCell strong textStyle={{ fontFamily: 'monospace', fontSize: '13px' }}>
          {sigla}
        </TableCell>
      ),
      sorter: (a, b) => (a.sigla || '').localeCompare(b.sigla || '', undefined, { numeric: true, sensitivity: 'base' }),
      defaultSortOrder: 'ascend',
    },
    {
      title: 'Nombre',
      dataIndex: 'nombre',
      ellipsis: true,
      render: (nombre, record) => (
        <TableCell
          strong
          fallback="Sin nombre"
          tag={record.tipo}
          tagColor={getTipoTagColor(record.tipo)}
          orientation="vertical"
        >
          {nombre}
        </TableCell>
      ),
      sorter: (a, b) => (a.nombre || 'Sin nombre').localeCompare(b.nombre || 'Sin nombre'),
    },
    {
      title: 'Clasificación',
      dataIndex: 'clasificacion',
      ellipsis: true,
      render: (clasificacion) => <TableCell>{clasificacion || '-'}</TableCell>,
      sorter: (a, b) => (a.clasificacion || '').localeCompare(b.clasificacion || ''),
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
          viewPath="/:id"
          onEdit={(r) => navigate(materiaEditarPath(r.id))}
          onView={(r) => navigate(materiaEditarPath(r.id, { view: true }))}
          useCaseKey="eliminarMateria"
          permisos={{
            ver: { codigo: 'configuracion.materia', accion: 'DETALLE' },
            editar: { codigo: 'configuracion.materia', accion: 'EDITAR' },
            eliminar: { codigo: 'configuracion.materia', accion: 'ELIMINAR' },
          }}
        />
      ),
    },
  ];
};
