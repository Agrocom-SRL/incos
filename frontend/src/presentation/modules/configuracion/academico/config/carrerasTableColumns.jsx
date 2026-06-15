/**
 * Columnas de la tabla de carreras (tab Académico).
 */

import {
  AppstoreOutlined,
  BookOutlined,
  IdcardOutlined,
  ReadOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import {
  carreraDetallePath,
  carreraEditarPath,
} from '@application-configuracion/academico/config/paths';
import IdentidadCelda from '@atoms/IdentidadCelda';
import CarreraAreaDescripcionCell from '@configuracion/academico/components/atoms/CarreraAreaDescripcionCell';
import CarreraTituloDotCell from '@configuracion/academico/components/atoms/CarreraTituloDotCell';
import CarreraMetricasCell from '@configuracion/academico/components/atoms/CarreraMetricasCell';
import { TableActions } from '@molecules';

export const createCarrerasTableColumns = ({ navigate, listNavState, refetch }) => {
  return [
    {
      title: '#',
      key: 'nro',
      width: 56,
      align: 'center',
      render: (_value, _record, index, rowOffset = 0) => rowOffset + index + 1,
    },
    {
      title: 'Carrera',
      dataIndex: 'nombre',
      fixed: 'left',
      ellipsis: true,
      render: (_nombre, record) => (
        <IdentidadCelda
          codigo={record.codigo}
          nombre={(record.nombre || 'Sin nombre').toUpperCase()}
        />
      ),
      sorter: true,
      sortCompare: (a, b) =>
        (a.nombre || '').localeCompare(b.nombre || '', 'es', { sensitivity: 'base' }),
    },
    {
      title: 'Área y descripción',
      key: 'areaDescripcion',
      width: 280,
      ellipsis: false,
      render: (_, record) => (
        <CarreraAreaDescripcionCell
          areaFormacion={record.areaFormacion}
          descripcion={record.descripcion}
        />
      ),
      sorter: true,
      sortCompare: (a, b) =>
        (a.areaFormacion || '').localeCompare(b.areaFormacion || '', 'es', { sensitivity: 'base' }),
    },
    {
      title: 'Título otorgado',
      dataIndex: 'tituloOtorgado',
      width: 220,
      ellipsis: true,
      render: (titulo, record) => (
        <CarreraTituloDotCell tituloOtorgado={titulo} colorHex={record.colorHex} />
      ),
      sorter: true,
      sortCompare: (a, b) =>
        (a.tituloOtorgado || '').localeCompare(b.tituloOtorgado || '', 'es', { sensitivity: 'base' }),
    },
    {
      title: 'Carga académica',
      key: 'resumen',
      width: 160,
      render: (_, record) => (
        <CarreraMetricasCell
          cantidadMaterias={record.cantidadMaterias ?? 0}
          cantidadPeriodos={record.cantidadPeriodos ?? 0}
        />
      ),
      sorter: true,
      sortCompare: (a, b) =>
        (Number(a.cantidadMaterias) || 0) - (Number(b.cantidadMaterias) || 0),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      fixed: 'right',
      width: 140,
      align: 'right',
      render: (_, record) => {
        const nombre = (record.nombre || 'Sin nombre').toUpperCase();
        const itemName = `la carrera ${nombre}`;
        const itemDetails = [
          { label: 'Nombre', value: nombre, icon: <ReadOutlined /> },
          { label: 'Código', value: record.codigo, icon: <IdcardOutlined /> },
          { label: 'Área de formación', value: record.areaFormacion, icon: <AppstoreOutlined /> },
          { label: 'Título otorgado', value: record.tituloOtorgado, icon: <TrophyOutlined /> },
          {
            label: 'Carga académica',
            value:
              record.cantidadMaterias != null || record.cantidadPeriodos != null
                ? `${record.cantidadMaterias ?? 0} materias · ${record.cantidadPeriodos ?? 0} periodos`
                : null,
            icon: <BookOutlined />,
          },
        ].filter((d) => d.value != null && d.value !== '');

        return (
          <TableActions
            record={record}
            navigate={navigate}
            viewPath="/:id"
            onView={(r) => navigate(carreraDetallePath(r.id), { state: listNavState })}
            onEdit={(r) => navigate(carreraEditarPath(r.id), { state: listNavState })}
            useCaseKey="eliminarCarrera"
            refetch={refetch}
            itemName={itemName}
            itemDetails={itemDetails}
            permisos={{
              ver: { codigo: 'configuracion.carrera', accion: 'DETALLE' },
              editar: { codigo: 'configuracion.carrera', accion: 'EDITAR' },
              eliminar: { codigo: 'configuracion.carrera', accion: 'ELIMINAR' },
            }}
          />
        );
      },
    },
  ];
};
