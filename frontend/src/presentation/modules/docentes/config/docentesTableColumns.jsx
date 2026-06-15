/**
 * Columnas del listado de docentes (patrón CFG carreras / materias).
 */

import {
  ApartmentOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  IdcardOutlined,
  MailOutlined,
  PhoneOutlined,
  ReadOutlined,
  ScheduleOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { ofertaPaths } from '@application-institucional/oferta/config/paths';
import IdentidadCelda from '@atoms/IdentidadCelda';
import { TableActions } from '@molecules';
import DocenteReferenciaCell from '@docentes/components/atoms/DocenteReferenciaCell';
import DocenteCargaHorariaCell from '@docentes/components/atoms/DocenteCargaHorariaCell';
import DocenteCargaCell from '@docentes/components/atoms/DocenteCargaCell';

const getNombreCompleto = (record) =>
  record.nombreCompleto ||
  [record.apellidoPaterno, record.apellidoMaterno, record.nombres].filter(Boolean).join(' ') ||
  'Sin nombre';

const getCiCompleto = (record) =>
  record.ciCompleto ||
  (record.expedicion ? `${record.ci || ''} ${record.expedicion}`.trim() : String(record.ci || ''));

export const createDocentesTableColumns = ({ navigate, listNavState, refetch, deleteDocente }) => {
  const returnListPath = listNavState?.returnListPath || '/docentes/listar';

  return [
    {
      title: '#',
      key: 'nro',
      width: 56,
      align: 'center',
      render: (_value, _record, index, rowOffset = 0) => rowOffset + index + 1,
    },
    {
      title: 'Docente',
      dataIndex: 'nombreCompleto',
      fixed: 'left',
      ellipsis: true,
      render: (_nombre, record) => {
        const ci = getCiCompleto(record);
        return (
          <IdentidadCelda
            codigo={ci ? `${ci}` : null}
            nombre={getNombreCompleto(record).toUpperCase()}
          />
        );
      },
      sorter: true,
      sortCompare: (a, b) =>
        getNombreCompleto(a).localeCompare(getNombreCompleto(b), 'es', { sensitivity: 'base' }),
    },
    {
      title: 'Referencia',
      key: 'referencia',
      width: 220,
      render: (_, record) => (
        <DocenteReferenciaCell
          genero={record.genero}
          celular={record.celular}
          telefono={record.telefono}
          emailPersonal={record.emailPersonal}
        />
      ),
      sorter: true,
      sortCompare: (a, b) => {
        const textA = [a.genero, a.celular, a.telefono, a.emailPersonal].filter(Boolean).join(' ');
        const textB = [b.genero, b.celular, b.telefono, b.emailPersonal].filter(Boolean).join(' ');
        return textA.localeCompare(textB, 'es', { sensitivity: 'base' });
      },
    },
    {
      title: 'Carga horaria',
      key: 'cargaHoraria',
      width: 180,
      render: (_, record) => (
        <DocenteCargaHorariaCell
          colorHex={record.colorHex}
          maxHorasSemana={record.maxHorasSemana}
          maxHorasMes={record.maxHorasMes}
        />
      ),
      sorter: true,
      sortCompare: (a, b) =>
        (Number(a.maxHorasSemana) || 0) - (Number(b.maxHorasSemana) || 0),
    },
    {
      title: 'Carga asignada',
      key: 'cargaAsignada',
      width: 160,
      render: (_, record) => {
        const stats = record.teachingStats || {};
        const totalMaterias = Number(stats.totalMaterias) || 0;
        const totalParalelos = Number(stats.totalParalelos) || 0;
        const hasAsignaciones = Boolean(stats.hasAsignaciones) && (Number(stats.totalAsignaciones) || 0) > 0;

        return (
          <DocenteCargaCell
            totalMaterias={totalMaterias}
            totalParalelos={totalParalelos}
            hasAsignaciones={hasAsignaciones}
          />
        );
      },
      sorter: true,
      sortCompare: (a, b) =>
        (Number(a?.teachingStats?.totalMaterias) || 0) - (Number(b?.teachingStats?.totalMaterias) || 0),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      width: 180,
      align: 'right',
      render: (_, record) => {
        const nombreCompleto = getNombreCompleto(record);
        const ciCompleto = getCiCompleto(record);
        const itemName = `el docente ${nombreCompleto}`;
        const itemDetails = [
          { label: 'Nombre', value: nombreCompleto, icon: <UserOutlined /> },
          { label: 'CI', value: ciCompleto, icon: <IdcardOutlined /> },
          { label: 'Correo', value: record.emailPersonal, icon: <MailOutlined /> },
          { label: 'Celular', value: record.celular || record.telefono, icon: <PhoneOutlined /> },
          {
            label: 'Límite semanal',
            value: record.maxHorasSemana != null ? `${record.maxHorasSemana} h/semana` : null,
            icon: <ClockCircleOutlined />,
          },
          {
            label: 'Límite mensual',
            value: record.maxHorasMes != null ? `${record.maxHorasMes} h/mes` : null,
            icon: <CalendarOutlined />,
          },
          {
            label: 'Carga asignada',
            value:
              record.teachingStats?.hasAsignaciones
                ? `${record.teachingStats.totalMaterias ?? 0} materias · ${record.teachingStats.totalParalelos ?? 0} paralelos`
                : null,
            icon: <ReadOutlined />,
          },
        ].filter((d) => d.value != null && d.value !== '' && d.value !== '—');

        return (
          <TableActions
            record={record}
            navigate={navigate}
            refetch={refetch}
            deleteFn={deleteDocente || undefined}
            itemName={itemName}
            itemDetails={itemDetails}
            viewPath="/docentes/:id"
            viewNavigateState={listNavState}
            onEdit={() =>
              navigate(`/docentes/${record.id}/editar`, {
                state: listNavState,
              })
            }
            extraActions={[
              {
                key: 'asignaciones',
                icon: <ScheduleOutlined />,
                variant: 'alternative',
                tooltip: 'Ver asignaciones',
                permiso: 'docentes.ver',
                accion: 'LISTAR',
                onClick: () =>
                  navigate(ofertaPaths.docenteAsignaciones(record.id), {
                    state: {
                      ...listNavState,
                      menuSidebarKey: 'INST-OFERTA-ACADEMICA',
                    },
                  }),
              },
              {
                key: 'oferta',
                icon: <ApartmentOutlined />,
                variant: 'default',
                tooltip: 'Oferta y asignación docente',
                permiso: 'institucional.oferta',
                accion: 'LISTAR',
                onClick: () =>
                  navigate('/institucional/oferta', {
                    state: { ...listNavState, returnListPath },
                  }),
              },
            ]}
            permisos={{
              ver: { codigo: 'docentes.ver', accion: 'DETALLE' },
              editar: { codigo: 'docentes.editar', accion: 'EDITAR' },
              eliminar: { codigo: 'docentes.editar', accion: 'ELIMINAR' },
            }}
          />
        );
      },
    },
  ];
};
