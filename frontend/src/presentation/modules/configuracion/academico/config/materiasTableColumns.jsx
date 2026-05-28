/**
 * Columnas de la tabla de materias (tab Académico).
 */

import {
  materiaDetallePath,
  materiaEditarPath,
} from '@application-configuracion/academico/config/paths';
import { TIPO_MATERIA_TAG_COLOR } from '@application-configuracion/academico/config/materiaFormConstants';
import { TableActions, TableCell } from '@molecules';

const getTipoTagColor = (tipo) => TIPO_MATERIA_TAG_COLOR[tipo] || 'default';

export const createMateriasTableColumns = ({ navigate, listNavState, refetch }) => {
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
          onView={(r) => navigate(materiaDetallePath(r.id), { state: listNavState })}
          onEdit={(r) => navigate(materiaEditarPath(r.id), { state: listNavState })}
          useCaseKey="eliminarMateria"
          refetch={refetch}
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
