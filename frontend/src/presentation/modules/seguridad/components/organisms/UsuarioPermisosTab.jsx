import { useMemo } from 'react';
import { Alert, Table, Tabs, Tag, Typography } from 'antd';
import {
  CheckCircleOutlined,
  DeleteOutlined,
  KeyOutlined,
  LockOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useSeguridadUsuarioPermisosPageContext } from '@/application/modules/seguridad/hooks';
import { DetailInfoCard } from '@molecules';
import { Button } from '@atoms';
import AgregarOverrideModal from '@modules/seguridad/components/modals/AgregarOverrideModal.jsx';

function tipoOverrideEtiqueta(t) {
  if (t === 'GRANT') return 'Otorgado';
  if (t === 'REVOKE') return 'Revocado';
  return t || '—';
}

const ACCION_TAG_COLOR = {
  LISTAR: 'blue',
  DETALLE: 'cyan',
  CREAR: 'cyan',
  EDITAR: 'orange',
  ELIMINAR: 'red',
  ACTIVAR: 'gold',
  APROBAR: 'purple',
  EXPORTAR: 'geekblue',
  GENERAR_PDF: 'volcano',
};

function celdaPermisoNombreCodigo(_, r) {
  const nombre = r.nombre?.trim();
  const codigo = r.codigo;
  const titulo = nombre || codigo || '—';
  return (
    <div>
      <div className="usuario-permisos__permiso-nombre">{titulo}</div>
      {nombre && codigo ? (
        <div className="usuario-permisos__permiso-codigo">{codigo}</div>
      ) : null}
    </div>
  );
}

const tagAccion = (a) => <Tag color={ACCION_TAG_COLOR[a] || 'default'}>{a}</Tag>;

export default function UsuarioPermisosTab() {
  const {
    loading,
    payloadUsuario,
    rolRows,
    overrides,
    efectivos,
    permisoOptions,
    puedeEditar,
    esAdminSistema,
    overrideOpen,
    savingOverride,
    setOverrideOpen,
    onAddOverride,
    removeOverride,
  } = useSeguridadUsuarioPermisosPageContext();

  const tabItems = useMemo(
    () => [
      {
        key: 'rol',
        label: (
          <span className="sd-tab-label">
            <LockOutlined /> Permisos del rol
          </span>
        ),
        children: (
          <div className="sd-tab-body usuario-permisos__tab-gutter">
            {esAdminSistema ? (
              <Alert
                type="info"
                showIcon
                title="Administrador del sistema"
                description="Este usuario tiene el rol Administrador del sistema. Aquí se muestra el catálogo completo de permisos disponibles en la aplicación."
                style={{ marginBottom: 16 }}
              />
            ) : null}
            {!payloadUsuario?.rol ? (
              <Typography.Text type="secondary">El usuario no tiene un rol asignado.</Typography.Text>
            ) : null}
            {payloadUsuario?.rol && rolRows.length === 0 && !loading ? (
              <Typography.Text type="secondary">El rol no tiene permisos configurados.</Typography.Text>
            ) : null}
            {rolRows.map((group) => (
              <DetailInfoCard
                key={group.dominio}
                title={group.dominio}
                icon={<LockOutlined />}
                cols={1}
              >
                <Table
                  className="usuario-permisos__table"
                  rowKey={(r) => `${group.dominio}-${r.permiso_id ?? r.codigo}-${r.accion}`}
                  size="small"
                  pagination={false}
                  loading={loading}
                  dataSource={group.items}
                  columns={[
                    { title: 'Permiso', key: 'permiso', ellipsis: true, render: celdaPermisoNombreCodigo },
                    { title: 'Acción', dataIndex: 'accion', width: 120, render: tagAccion },
                  ]}
                />
              </DetailInfoCard>
            ))}
          </div>
        ),
      },
      {
        key: 'excepciones',
        label: (
          <span className="sd-tab-label">
            <KeyOutlined /> Ajustes individuales
          </span>
        ),
        children: (
          <div className="sd-tab-body">
            <DetailInfoCard
              title="Excepciones por usuario"
              icon={<KeyOutlined />}
              cols={1}
              extra={
                puedeEditar ? (
                  <Button variant="primary" icon={<PlusOutlined />} onClick={() => setOverrideOpen(true)}>
                    Agregar ajuste
                  </Button>
                ) : null
              }
            >
              <Table
                className="usuario-permisos__table"
                rowKey="id"
                size="small"
                dataSource={overrides || []}
                loading={loading}
                columns={[
                  { title: 'Código', dataIndex: 'codigo' },
                  { title: 'Acción', dataIndex: 'accion', render: tagAccion },
                  {
                    title: 'Tipo',
                    dataIndex: 'tipo',
                    render: (t) => (
                      <Tag color={t === 'GRANT' ? 'success' : 'error'}>{tipoOverrideEtiqueta(t)}</Tag>
                    ),
                  },
                  { title: 'Motivo', dataIndex: 'motivo', ellipsis: true },
                  puedeEditar
                    ? {
                        title: '',
                        key: 'x',
                        width: 120,
                        render: (_, row) => (
                          <Button icon={<DeleteOutlined />} variant="error" onClick={() => removeOverride(row.id)}>
                            Quitar
                          </Button>
                        ),
                      }
                    : null,
                ].filter(Boolean)}
              />
            </DetailInfoCard>
          </div>
        ),
      },
      {
        key: 'efectivos',
        label: (
          <span className="sd-tab-label">
            <CheckCircleOutlined /> Permisos efectivos
          </span>
        ),
        children: (
          <div className="sd-tab-body usuario-permisos__tab-gutter">
            <DetailInfoCard title="Resultado aplicado" icon={<CheckCircleOutlined />} cols={1}>
              <Typography.Paragraph type="secondary">
                Lista consolidada tras aplicar el rol del usuario, sumar los permisos otorgados de forma
                individual y restar los revocados. Es la referencia de lo que el sistema permite a este
                usuario en la práctica.
              </Typography.Paragraph>
              <Table
                className="usuario-permisos__table"
                rowKey="codigo"
                size="small"
                pagination={false}
                loading={loading}
                dataSource={efectivos || []}
                columns={[
                  { title: 'Código', dataIndex: 'codigo', width: '36%' },
                  {
                    title: 'Acciones',
                    dataIndex: 'acciones',
                    render: (a) =>
                      Array.isArray(a) ? a.map((v) => <Tag key={v} color={ACCION_TAG_COLOR[v] || 'default'}>{v}</Tag>) : a,
                  },
                ]}
              />
            </DetailInfoCard>
          </div>
        ),
      },
    ],
    [
      rolRows,
      overrides,
      efectivos,
      loading,
      puedeEditar,
      esAdminSistema,
      payloadUsuario,
      removeOverride,
      setOverrideOpen,
    ]
  );

  return (
    <>
      <Tabs defaultActiveKey="rol" items={tabItems} className="sd-tabs" />
      <AgregarOverrideModal
        open={overrideOpen}
        loading={savingOverride}
        permisoOptions={permisoOptions}
        onCancel={() => setOverrideOpen(false)}
        onSubmit={onAddOverride}
      />
    </>
  );
}
