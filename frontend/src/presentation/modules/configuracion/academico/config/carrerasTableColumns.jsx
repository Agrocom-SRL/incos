/**
 * Columnas de la tabla de carreras (tab Académico).
 */

import {
  carreraDetallePath,
  carreraEditarPath,
} from '@application-configuracion/academico/config/paths';
import { TableActions, TableCell } from '@molecules';

export const createCarrerasTableColumns = ({ navigate, listNavState, refetch }) => {
  return [
    {
      title: 'Código',
      dataIndex: 'codigo',
      fixed: 'left',
      ellipsis: true,
      render: (codigo, record) => (
        <TableCell strong textStyle={{ fontFamily: 'monospace', fontSize: '13px' }}>
          {record.colorHex ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 2,
                  backgroundColor: record.colorHex,
                  flexShrink: 0,
                }}
              />
              {codigo}
            </span>
          ) : (
            codigo
          )}
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
          viewPath="/:id"
          onView={(r) => navigate(carreraDetallePath(r.id), { state: listNavState })}
          onEdit={(r) => navigate(carreraEditarPath(r.id), { state: listNavState })}
          useCaseKey="eliminarCarrera"
          refetch={refetch}
          permisos={{
            ver: { codigo: 'configuracion.carrera', accion: 'DETALLE' },
            editar: { codigo: 'configuracion.carrera', accion: 'EDITAR' },
            eliminar: { codigo: 'configuracion.carrera', accion: 'ELIMINAR' },
          }}
        />
      ),
    },
  ];
};
