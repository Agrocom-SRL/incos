/**
 * Columnas de la tabla de materias (tab Académico).
 */

import {
  AppstoreOutlined,
  FontSizeOutlined,
  ReadOutlined,
  TagOutlined,
} from '@ant-design/icons';
import {
  materiaDetallePath,
  materiaEditarPath,
} from '@application-configuracion/academico/config/paths';
import {
  getMateriaClasificacionPillClass,
  getMateriaTipoLabel,
  getMateriaTipoPillClass,
} from '@application-configuracion/academico/config/materiaTipoPill';
import IdentidadCelda from '@atoms/IdentidadCelda';
import StatusPill from '@atoms/StatusPill';
import { TableActions } from '@molecules';

export const createMateriasTableColumns = ({ navigate, listNavState, refetch }) => {
  return [
    {
      title: '#',
      key: 'nro',
      width: 56,
      align: 'center',
      render: (_value, _record, index, rowOffset = 0) => rowOffset + index + 1,
    },
    {
      title: 'Materia',
      dataIndex: 'nombre',
      ellipsis: true,
      render: (_nombre, record) => (
        <IdentidadCelda
          codigo={record.sigla}
          nombre={(record.nombre || 'Sin nombre').toUpperCase()}
        />
      ),
      sorter: true,
      sortCompare: (a, b) =>
        (a.nombre || '').localeCompare(b.nombre || '', 'es', { sensitivity: 'base' }),
    },
    {
      title: 'Tipo',
      dataIndex: 'tipo',
      width: 160,
      render: (tipo) => (
        <StatusPill label={getMateriaTipoLabel(tipo)} className={getMateriaTipoPillClass(tipo)} />
      ),
      sorter: true,
      sortCompare: (a, b) =>
        getMateriaTipoLabel(a.tipo).localeCompare(getMateriaTipoLabel(b.tipo), 'es'),
    },
    {
      title: 'Clasificación',
      dataIndex: 'clasificacion',
      ellipsis: true,
      render: (clasificacion) => (
        <StatusPill
          label={clasificacion || '—'}
          className={getMateriaClasificacionPillClass()}
        />
      ),
      sorter: true,
      sortCompare: (a, b) =>
        (a.clasificacion || '').localeCompare(b.clasificacion || '', 'es', { sensitivity: 'base' }),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      width: 140,
      align: 'right',
      render: (_, record) => {
        const nombre = (record.nombre || 'Sin nombre').toUpperCase();
        const sigla = record.sigla ? record.sigla.toUpperCase() : null;
        const itemName = sigla ? `la materia ${sigla} — ${nombre}` : `la materia ${nombre}`;
        const itemDetails = [
          { label: 'Nombre', value: nombre, icon: <ReadOutlined /> },
          { label: 'Sigla', value: sigla, icon: <FontSizeOutlined /> },
          { label: 'Tipo', value: getMateriaTipoLabel(record.tipo), icon: <TagOutlined /> },
          { label: 'Clasificación', value: record.clasificacion, icon: <AppstoreOutlined /> },
        ].filter((d) => d.value != null && d.value !== '' && d.value !== '—');

        return (
          <TableActions
            record={record}
            navigate={navigate}
            viewPath="/:id"
            onView={(r) => navigate(materiaDetallePath(r.id), { state: listNavState })}
            onEdit={(r) => navigate(materiaEditarPath(r.id), { state: listNavState })}
            useCaseKey="eliminarMateria"
            refetch={refetch}
            itemName={itemName}
            itemDetails={itemDetails}
            permisos={{
              ver: { codigo: 'configuracion.materia', accion: 'DETALLE' },
              editar: { codigo: 'configuracion.materia', accion: 'EDITAR' },
              eliminar: { codigo: 'configuracion.materia', accion: 'ELIMINAR' },
            }}
          />
        );
      },
    },
  ];
};
