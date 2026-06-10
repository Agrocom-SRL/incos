import { useMemo, useState } from 'react';
import { Flex, Tag, Typography } from 'antd';
import { ArrowLeftOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import { ActionButton } from '@atoms';
import { TableListView } from '@organisms';
import { useCronogramaAdminState } from '@application-institucional/actual';
import { tipoMeta } from '@application-institucional/actual/utils/cronogramaGestion.js';
import { formatFechaCorta } from '@application-institucional/actual/utils/bimestresTimeline.js';
import { CronogramaActividadModal } from '@institucional/actual/components/organisms';

const { Text } = Typography;

const ESTADO_TAG = {
  pasada: { color: 'default', label: 'Pasada' },
  vigente: { color: 'processing', label: 'Vigente' },
  futura: { color: 'green', label: 'Futura' },
};

const PERMISO = 'institucional.gestion.cronograma';

const CronogramaAdminPage = () => {
  const s = useCronogramaAdminState();
  const [searchText, setSearchText] = useState('');

  const data = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return s.actividades;
    return s.actividades.filter((a) =>
      [a.nombre, a.periodoNombre, tipoMeta(a.tipo).label]
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
        render: (t) => <Tag>{t}</Tag>,
      },
      {
        title: 'Actividad',
        dataIndex: 'nombre',
        key: 'nombre',
        render: (t, r) => (
          <Flex align="center" gap="small" wrap>
            <Text>{t}</Text>
            {r.tipo ? <Tag color={tipoMeta(r.tipo).color}>{tipoMeta(r.tipo).label}</Tag> : null}
          </Flex>
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
        render: (v) => (v ? formatFechaCorta(v) : '—'),
      },
      {
        title: 'Estado',
        dataIndex: 'estado',
        key: 'estado',
        render: (e) => {
          const meta = ESTADO_TAG[e] ?? ESTADO_TAG.futura;
          return <Tag color={meta.color}>{meta.label}</Tag>;
        },
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
              onClick={() => s.abrirEditar(record)}
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
            onClick={s.abrirCrear}
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

      <CronogramaActividadModal
        open={s.modalOpen}
        saving={s.saving}
        editing={s.editing}
        periodos={s.periodos}
        catalogo={s.catalogo}
        onCancel={s.cerrarModal}
        onSubmit={s.submit}
      />
    </Flex>
  );
};

export default CronogramaAdminPage;
