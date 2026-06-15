/**
 * Columnas — tab Paralelos maestro (CFG Académico).
 */

import { ReadOutlined, TagOutlined } from '@ant-design/icons';
import {
  paraleloDetallePath,
  paraleloEditarPath,
} from '@application-configuracion/academico/config/paths';
import { sanitizeDocenteColorHex } from '@docentes/components/atoms/DocenteColorBar';
import IdentidadCelda from '@atoms/IdentidadCelda';
import { TableActions } from '@molecules';
import ParaleloPeriodoCell from '@configuracion/academico/components/atoms/ParaleloPeriodoCell';

export const createParalelosTableColumns = ({ navigate, listNavState, refetch }) => [
  {
    title: '#',
    key: 'nro',
    width: 56,
    align: 'center',
    render: (_v, _r, index, rowOffset = 0) => rowOffset + index + 1,
  },
  {
    title: 'Paralelo',
    dataIndex: 'nombre',
    width: 200,
    ellipsis: true,
    render: (nombre, record) => (
      <IdentidadCelda
        codigo={record.turno}
        nombre={(nombre || 'Sin nombre').toUpperCase()}
      />
    ),
    sorter: true,
    sortCompare: (a, b) =>
      (a.nombre || '').localeCompare(b.nombre || '', 'es', { sensitivity: 'base' }),
  },
  {
    title: 'Carrera',
    key: 'carrera',
    width: 240,
    fixed: 'left',
    ellipsis: true,
    render: (_, record) => (
      <IdentidadCelda
        codigo={record.carreraCodigo}
        nombre={(record.carreraNombre || 'Sin carrera').toUpperCase()}
        accentColor={sanitizeDocenteColorHex(record.carreraColorHex) || undefined}
      />
    ),
    sorter: true,
    sortCompare: (a, b) =>
      (a.carreraNombre || '').localeCompare(b.carreraNombre || '', 'es', { sensitivity: 'base' }),
  },
  {
    title: 'Periodo',
    key: 'periodo',
    width: 360,
    ellipsis: false,
    render: (_, record) => <ParaleloPeriodoCell record={record} />,
    sorter: true,
    sortCompare: (a, b) =>
      (Number(a.periodoNumero) || 0) - (Number(b.periodoNumero) || 0),
  },
  {
    title: 'Acciones',
    key: 'acciones',
    fixed: 'right',
    width: 140,
    align: 'right',
    render: (_, record) => {
      const nombre = (record.nombre || 'Sin nombre').toUpperCase();
      const itemDetails = [
        { label: 'Nombre', value: nombre, icon: <ReadOutlined /> },
        { label: 'Turno', value: record.turno, icon: <TagOutlined /> },
        { label: 'Carrera', value: record.carreraNombre || record.carreraCodigo },
      ].filter((d) => d.value);

      return (
        <TableActions
          record={record}
          navigate={navigate}
          onView={(r) => navigate(paraleloDetallePath(r.id), { state: listNavState })}
          onEdit={(r) => navigate(paraleloEditarPath(r.id), { state: listNavState })}
          useCaseKey="eliminarParalelo"
          refetch={refetch}
          itemName={`el paralelo ${nombre}`}
          itemDetails={itemDetails}
          permisos={{
            ver: { codigo: 'configuracion.paralelo', accion: 'DETALLE' },
            editar: { codigo: 'configuracion.paralelo', accion: 'EDITAR' },
            eliminar: { codigo: 'configuracion.paralelo', accion: 'ELIMINAR' },
          }}
        />
      );
    },
  },
];
