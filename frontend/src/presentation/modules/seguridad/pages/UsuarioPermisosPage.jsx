import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  App,
  Alert,
  Table,
  Tabs,
  Tag,
  Typography,
} from 'antd';
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  KeyOutlined,
  LockOutlined,
  MailOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import '@modules/seguridad/styles/seguridad.css';
import { PermisoGuard } from '@/presentation/guards/PermisoGuard.jsx';
import { usePermiso } from '@/presentation/hooks/usePermiso.js';
import { usePermisosCatalogo, useUsuarioPermisos } from '@/application/modules/seguridad/hooks';
import AgregarOverrideModal from '@modules/seguridad/components/modals/AgregarOverrideModal.jsx';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { Button } from '@atoms';

function errMsg(json) {
  const e = json?.error;
  if (json?.error?.details?.length) {
    return json.error.details.map((d) => d.message).join('. ');
  }
  return typeof e === 'string' ? e : e?.message || 'Error';
}

function agruparRol(flat) {
  const m = {};
  (flat || []).forEach((row) => {
    const key = row.dominio || 'GENERAL';
    if (!m[key]) m[key] = [];
    m[key].push(row);
  });
  return Object.entries(m).map(([dominio, items]) => ({ dominio, items }));
}

function inicialesUsername(username) {
  const u = (username || '').trim();
  if (!u) return '—';
  if (u.length <= 2) return u.toUpperCase();
  return u.slice(0, 2).toUpperCase();
}

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

export default function UsuarioPermisosPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const uid = parseInt(id, 10);
  const { permisos_rol, overrides, efectivos, loading, cargar, agregarOverride, eliminarOverride } = useUsuarioPermisos();
  const { cargar: cargarCatalogo } = usePermisosCatalogo();
  const puedeEditar = usePermiso('seguridad.rol.gestionar', 'EDITAR');
  const [payloadUsuario, setPayloadUsuario] = useState(null);
  const [permisoOptions, setPermisoOptions] = useState([]);
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [savingOverride, setSavingOverride] = useState(false);

  const esAdminSistema = useMemo(
    () => Number(payloadUsuario?.rol?.id) === 1 || payloadUsuario?.rol?.codigo === 'ADMIN_SISTEMA',
    [payloadUsuario]
  );

  const load = useCallback(async () => {
    if (!uid) return;
    try {
      const data = await cargar(uid);
      setPayloadUsuario(data?.usuario ?? null);
    } catch (e) {
      message.error(errMsg(e));
    }
  }, [uid, cargar, message]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const run = async () => {
      const grouped = await cargarCatalogo();
      const opts = [];
      Object.keys(grouped)
        .sort()
        .forEach((dom) => {
          (grouped[dom] || []).forEach((p) => {
            opts.push({
              value: p.id,
              label: `[${dom}] ${p.nombre} (${p.codigo})`,
            });
          });
        });
      setPermisoOptions(opts);
    };
    run();
  }, [cargarCatalogo]);

  const rolRows = useMemo(
    () => agruparRol(permisos_rol),
    [permisos_rol]
  );

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Seguridad', href: '/seguridad/usuarios' },
      { title: 'Usuarios', href: '/seguridad/usuarios' },
      { title: payloadUsuario?.username || `Usuario ${uid}` },
      { title: 'Permisos' },
    ],
    [payloadUsuario, uid]
  );

  const onAddOverride = async (v) => {
    setSavingOverride(true);
    try {
      await agregarOverride(uid, v);
      setSavingOverride(false);
      message.success('Ajuste registrado');
      setOverrideOpen(false);
      load();
    } catch (e) {
      setSavingOverride(false);
      message.error(errMsg(e));
    }
  };

  const removeOv = useCallback(async (overrideId) => {
    try {
      await eliminarOverride(uid, overrideId);
      message.success('Eliminado');
      load();
    } catch (e) {
      message.error(errMsg(e));
    }
  }, [uid, eliminarOverride, message, load]);

  const columnasAccion = (a) => (
    <Tag color={ACCION_TAG_COLOR[a] || 'default'}>{a}</Tag>
  );

  const tabItems = useMemo(() => [
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
              message="Administrador del sistema"
              description="Este usuario tiene el rol Administrador del sistema. Aquí se muestra el catálogo completo de permisos disponibles en la aplicación (referencia equivalente a las acciones válidas por permiso)."
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
            <div key={group.dominio} className="sd-card" style={{ marginBottom: 16 }}>
              <div className="sd-card__head sd-card__head--cabecera">
                <span className="sd-card__title">
                  <span className="sd-card__title-icon"><LockOutlined /></span>
                  {group.dominio}
                </span>
              </div>
              <div className="sd-card__body" style={{ padding: 0 }}>
                <Table
                  className="usuario-permisos__table"
                  rowKey={(r) => `${group.dominio}-${r.permiso_id ?? r.codigo}-${r.accion}`}
                  size="small"
                  pagination={false}
                  loading={loading}
                  dataSource={group.items}
                  columns={[
                    { title: 'Permiso', key: 'permiso', ellipsis: true, render: celdaPermisoNombreCodigo },
                    { title: 'Acción', dataIndex: 'accion', width: 120, render: columnasAccion },
                  ]}
                />
              </div>
            </div>
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
          <div className="sd-card">
            <div className="sd-card__head">
              <span className="sd-card__title">
                <span className="sd-card__title-icon"><KeyOutlined /></span>
                Excepciones por usuario
              </span>
              {puedeEditar ? (
                <div className="sd-card__extra">
                  <Button variant="primary" icon={<PlusOutlined />} onClick={() => setOverrideOpen(true)}>
                    Agregar ajuste
                  </Button>
                </div>
              ) : null}
            </div>
            <div className="sd-card__body" style={{ padding: 0 }}>
              <Table
                className="usuario-permisos__table"
                rowKey="id"
                size="small"
                dataSource={overrides || []}
                loading={loading}
                columns={[
                  { title: 'Código', dataIndex: 'codigo' },
                  { title: 'Acción', dataIndex: 'accion', render: columnasAccion },
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
                          <Button icon={<DeleteOutlined />} variant="error" onClick={() => removeOv(row.id)}>
                            Quitar
                          </Button>
                        ),
                      }
                    : null,
                ].filter(Boolean)}
              />
            </div>
          </div>
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
          <div className="sd-card">
            <div className="sd-card__head sd-card__head--cabecera">
              <span className="sd-card__title">
                <span className="sd-card__title-icon"><CheckCircleOutlined /></span>
                Resultado aplicado
              </span>
            </div>
            <div className="sd-card__body sd-card__body--cols-1">
              <Typography.Paragraph style={{ marginBottom: 0 }}>
                Lista consolidada tras aplicar el rol del usuario, sumar los permisos otorgados de forma
                individual y restar los revocados. Es la referencia de lo que el sistema permite a este
                usuario en la práctica.
              </Typography.Paragraph>
            </div>
            <div className="sd-card__body" style={{ padding: 0, borderTop: '1px solid var(--border, #e5e7eb)' }}>
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
                    render: (a) => (Array.isArray(a) ? a.map((v) => <Tag key={v} color={ACCION_TAG_COLOR[v] || 'default'}>{v}</Tag>) : a),
                  },
                ]}
              />
            </div>
          </div>
        </div>
      ),
    },
  ], [
    rolRows,
    overrides,
    efectivos,
    loading,
    puedeEditar,
    esAdminSistema,
    payloadUsuario,
    removeOv,
  ]);

  const headerActions = (
    <button
      type="button"
      className="sd-btn sd-btn--outline"
      onClick={() => navigate(`/seguridad/usuarios/${uid}`)}
    >
      <ArrowLeftOutlined /> Volver
    </button>
  );

  return (
    <PermisoGuard
      codigo="seguridad.rol.gestionar"
      accion="LISTAR"
      fallback={
        <Typography.Text type="danger">Sin permiso.</Typography.Text>
      }
    >
      <PageTemplate
        header={(
          <PageHeader
            title="Permisos del usuario"
            breadcrumbItems={breadcrumbItems}
            actions={headerActions}
          />
        )}
      >
        <div className="sd">
          <div className="sd-profile">
            <div className="sd-profile__identity">
              <div className="sd-profile__avatar-wrap">
                <div className="sd-profile__avatar sd-profile__avatar--default">
                  {inicialesUsername(payloadUsuario?.username)}
                </div>
              </div>
              <div className="sd-profile__name-block">
                <h1 className="sd-profile__name">{payloadUsuario?.username || 'Usuario'}</h1>
                <div className="sd-profile__meta">
                  <p className="sd-profile__sub">
                    <MailOutlined style={{ marginRight: 6 }} />
                    {payloadUsuario?.email || 'Sin correo'}
                  </p>
                  {payloadUsuario?.rol?.nombre ? (
                    <span className="sd-profile__admission-pill sd-profile__admission-pill--nuevo">
                      {payloadUsuario.rol.nombre}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="sd-profile__divider" />

            <div className="sd-profile__stats">
              <div className="sd-stat">
                <span className="sd-stat__label">Usuario</span>
                <span className="sd-stat__value sd-stat__value--primary">{payloadUsuario?.username || '—'}</span>
              </div>
              <div className="sd-stat">
                <span className="sd-stat__label">Rol</span>
                <span className="sd-stat__value">
                  {payloadUsuario?.rol?.nombre || '—'}
                </span>
              </div>
              <div className="sd-stat">
                <span className="sd-stat__label">Tipo</span>
                <span className="sd-stat__value">
                  {!payloadUsuario?.rol
                    ? '—'
                    : payloadUsuario.rol.is_system
                      ? 'Sistema'
                      : 'Personalizado'}
                </span>
              </div>
            </div>
          </div>

          <div className="sd-tabs-shell">
            <Tabs defaultActiveKey="rol" items={tabItems} className="sd-tabs" />
          </div>
        </div>

        <AgregarOverrideModal
          open={overrideOpen}
          loading={savingOverride}
          permisoOptions={permisoOptions}
          onCancel={() => setOverrideOpen(false)}
          onSubmit={onAddOverride}
        />
      </PageTemplate>
    </PermisoGuard>
  );
}
