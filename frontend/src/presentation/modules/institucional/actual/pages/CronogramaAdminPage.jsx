import { useMemo, useState } from 'react';
import { Flex } from 'antd';
import { ArrowLeftOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import { ActionButton, StatusPill } from '@atoms';
import { TableListView } from '@organisms';
import { getActivityIconComponent } from '@config/icons';
import { useCronogramaAdminState } from '@application-institucional/actual';
import {
  getActividadTipoLabel,
  getActividadTipoPillClass,
  getActividadEstadoLabel,
  getActividadEstadoPillClass,
} from '@application-institucional/actual/config/actividadPill.js';
import { formatFechaCorta } from '@application-institucional/actual/utils/bimestresTimeline.js';
import '@institucional/actual/styles/cronograma.css';

const PERMISO = 'institucional.gestion.cronograma';

const CronogramaAdminPage = () => {
  const s = useCronogramaAdminState();
  const [searchText, setSearchText] = useState('');

  const data = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return s.actividades;
    return s.actividades.filter((a) =>
      [a.nombre, a.periodoNombre, getActividadTipoLabel(a.tipo)]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    );
  }, [s.actividades, searchText]);

  const columns = useMemo(
    () => [
      {
        title: 'Etapa',
        dataIndex: 'periodoNombre',
        key: 'periodo',
        render: (t) => <StatusPill label={t} className="cronograma-pill cronograma-pill--otro" />,
      },
      {
        title: 'Actividad',
        dataIndex: 'nombre',
        key: 'nombre',
        render: (t, r) => {
          const Icon = getActivityIconComponent(r.icono);
          return (
            <Flex align="center" gap="small">
              <Icon />
              <span>{t}</span>
            </Flex>
          );
        },
      },
      {
        title: 'Tipo',
        dataIndex: 'tipo',
        key: 'tipo',
        render: (tipo) => (
          <StatusPill label={getActividadTipoLabel(tipo)} className={getActividadTipoPillClass(tipo)} />
        ),
      },
      {
        title: 'Inicio',
        dataIndex: 'fechaInicio',
        key: 'inicio',
        render: (v) => formatFechaCorta(v),
      },
      {
        title: 'Fin',
        dataIndex: 'fechaFin',
        key: 'fin',
        render: (v) => (v ? formatFechaCorta(v) : 'Todo el día'),
      },
      {
        title: 'Estado',
        dataIndex: 'estado',
        key: 'estado',
        render: (e) => (
          <StatusPill label={getActividadEstadoLabel(e)} className={getActividadEstadoPillClass(e)} />
        ),
      },
      {
        title: 'Acciones',
        key: 'acciones',
        width: 180,
        render: (_, record) => (
          <Flex gap="small" wrap>
            <ActionButton
              permiso={PERMISO}
              accion="EDITAR"
              variant="warning"
              size="small"
              icon={<EditOutlined />}
              onClick={() => s.goToEditar(record)}
            >
              Editar
            </ActionButton>
            <ActionButton
              permiso={PERMISO}
              accion="ELIMINAR"
              variant="danger"
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => s.eliminarActividad(record)}
            >
              Eliminar
            </ActionButton>
          </Flex>
        ),
      },
    ],
    [s],
  );

  return (
    <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
      <PageHeaderArea>
        <PageHeader
          title={s.pageTitle}
          breadcrumbItems={s.breadcrumbItems}
          actions={
            <ActionButton
              permiso={PERMISO}
              accion="LISTAR"
              variant="back"
              icon={<ArrowLeftOutlined />}
              onClick={s.goToPanel}
            >
              Volver
            </ActionButton>
          }
        />
      </PageHeaderArea>

      <TableListView
        title={s.gestion ? `Actividades — ${s.gestion.nombre}` : 'Actividades del cronograma'}
        headerActions={
          <ActionButton
            permiso={PERMISO}
            accion="CREAR"
            variant="primary"
            icon={<PlusOutlined />}
            onClick={s.goToNueva}
          >
            Nueva actividad
          </ActionButton>
        }
        data={data}
        loading={s.loading}
        error={s.error}
        columns={columns}
        rowKey={(record) => record.id}
        searchText={searchText}
        onSearchChange={(e) => setSearchText(e.target.value)}
        searchPlaceholder="Buscar por actividad, etapa o tipo…"
        loadingTip="Cargando cronograma…"
        pagination={{ pageSize: 10, showTotal: (total) => `Total: ${total} actividades` }}
      />
    </Flex>
  );
};

export default CronogramaAdminPage;
