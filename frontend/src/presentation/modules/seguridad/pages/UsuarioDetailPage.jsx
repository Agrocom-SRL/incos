import { Empty, Space, Spin, Tabs, Tag, Typography } from 'antd';
import {
  EditOutlined,
  InfoCircleOutlined,
  KeyOutlined,
  LockOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { Button, Card } from '@atoms';
import { PermisoGuard } from '@/presentation/guards/PermisoGuard.jsx';
import { useSeguridadUsuarioDetailPageContext } from '@/application/modules/seguridad/hooks';
import CambiarPasswordModal from '@modules/seguridad/components/modals/CambiarPasswordModal.jsx';
import CambiarEstadoModal from '@modules/seguridad/components/modals/CambiarEstadoModal.jsx';
import EditarUsuarioModal from '@modules/seguridad/components/modals/EditarUsuarioModal.jsx';
import '@modules/seguridad/styles/seguridad.css';

function fmtDateTime(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString('es-BO', { dateStyle: 'short', timeStyle: 'short' });
}

export default function UsuarioDetailPage() {
  const {
    uid,
    usuario,
    roles,
    loading,
    saving,
    openEdit,
    openEstado,
    openPass,
    puedeEditar,
    puedeVerPermisos,
    breadcrumbItems,
    setOpenEdit,
    setOpenEstado,
    setOpenPass,
    saveBasic,
    saveEstado,
    savePass,
    goToUsuariosList,
    goToUsuarioPermisos,
  } = useSeguridadUsuarioDetailPageContext();

  const estadoTag = (estado) => {
    if (!estado) return <Tag color="success">Activo</Tag>;
    if (estado === 'BLOQUEADO') return <Tag color="error">BLOQUEADO</Tag>;
    if (estado === 'SUSPENDIDO') return <Tag color="warning">SUSPENDIDO</Tag>;
    if (estado === 'RETIRADO') return <Tag>RETIRADO</Tag>;
    return <Tag>{estado}</Tag>;
  };

  if (loading) {
    return <div className="sd-loading"><Spin size="large" /></div>;
  }

  if (!usuario) {
    return <Empty description="No se encontró el usuario" />;
  }

  return (
    <PermisoGuard
      codigo="seguridad.usuario.administrar"
      accion="DETALLE"
      fallback={
        <Typography.Text type="danger">Sin permiso.</Typography.Text>
      }
    >
      <PageTemplate
        header={
          <PageHeader
            title={`Usuario ${usuario.username}`}
            breadcrumbItems={breadcrumbItems}
            actions={<Button variant="default" onClick={goToUsuariosList}>Volver</Button>}
          />
        }
      >
        <div className="sd">
          <div className="sd-profile">
            <div className="sd-profile__identity">
              <div className="sd-profile__avatar">{String(usuario.username || 'U').slice(0, 2).toUpperCase()}</div>
              <div className="sd-profile__name-block">
                <h1 className="sd-profile__name">{usuario.username}</h1>
                <p className="seg-profile__sub">{usuario.email} · {usuario.rol?.nombre || 'Sin rol'}</p>
              </div>
            </div>
            <div className="sd-profile__divider" />
            <div className="sd-profile__stats seg-profile__stats">
              <div className="sd-stat">
                <span className="sd-stat__label">Rol</span>
                <span className="sd-stat__value">{usuario.rol?.nombre || '—'}</span>
              </div>
              <div className="sd-stat">
                <span className="sd-stat__label">Tipo</span>
                <span className="sd-stat__value">
                  {!usuario.rol
                    ? '—'
                    : usuario.rol.is_system
                      ? <Tag color="purple">Sistema</Tag>
                      : <Tag color="default">Personalizado</Tag>}
                </span>
              </div>
              <div className="sd-stat">
                <span className="sd-stat__label">Estado</span>
                <span className="sd-stat__value">{estadoTag(usuario.estado)}</span>
              </div>
            </div>
            <div className="sd-profile__divider" />
            <div className="sd-profile__actions">
              {puedeEditar ? (
                <>
                  <button type="button" className="sd-btn sd-btn--outline" onClick={() => setOpenPass(true)}>
                    <LockOutlined /> Cambiar contraseña
                  </button>
                  <button type="button" className="sd-btn sd-btn--primary" onClick={() => setOpenEdit(true)}>
                    <EditOutlined /> Editar datos
                  </button>
                  <button type="button" className="sd-btn sd-btn--warn" onClick={() => setOpenEstado(true)}>
                    <InfoCircleOutlined /> Cambiar estado
                  </button>
                </>
              ) : null}
              {puedeVerPermisos ? (
                <button type="button" className="sd-btn sd-btn--primary" onClick={goToUsuarioPermisos}>
                  <KeyOutlined /> Ver permisos
                </button>
              ) : null}
            </div>
          </div>

          <div className="sd-tabs-shell">
            <Tabs
              className="sd-tabs"
              items={[
                {
                  key: 'info',
                  label: <span className="sd-tab-label"><UserOutlined /> Información</span>,
                  children: (
                    <div className="sd-tab-body">
                      <Space orientation="vertical" size="large" style={{ width: '100%' }}>
                        <div className="sd-card">
                          <div className="sd-card__head"><span className="sd-card__title">Datos de la cuenta</span></div>
                          <div className="sd-card__body sd-card__body--cols-3">
                            <div className="sd-field"><span className="sd-field__label">Usuario</span><span className="sd-field__value">{usuario.username}</span></div>
                            <div className="sd-field"><span className="sd-field__label">Correo</span><span className="sd-field__value">{usuario.email || '—'}</span></div>
                            <div className="sd-field"><span className="sd-field__label">Foto (enlace)</span><span className="sd-field__value">{usuario.foto_url || '—'}</span></div>
                            <div className="sd-field"><span className="sd-field__label">Última actualización</span><span className="sd-field__value">{fmtDateTime(usuario.updated_at || usuario.updatedAt)}</span></div>
                          </div>
                        </div>
                        {usuario.vinculo_perfil ? (
                          <div className="sd-card">
                            <div className="sd-card__head"><span className="sd-card__title">Perfil en la institución</span></div>
                            <div className="sd-card__body sd-card__body--cols-1">
                              <div className="sd-field">
                                <span className="sd-field__label">Vinculación</span>
                                <span className="sd-field__value">
                                  <Tag color="blue">{usuario.vinculo_perfil.tipo_etiqueta}</Tag>
                                  <strong style={{ marginLeft: 8 }}>{usuario.vinculo_perfil.nombre_completo}</strong>
                                </span>
                              </div>
                              {(usuario.vinculo_perfil.lineas || []).map((ln, idx) => (
                                <div key={`${ln.etiqueta}-${idx}`} className="sd-field">
                                  <span className="sd-field__label">{ln.etiqueta}</span>
                                  <span className="sd-field__value">{ln.valor || '—'}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </Space>
                    </div>
                  ),
                },
                {
                  key: 'estado',
                  label: <span className="sd-tab-label"><InfoCircleOutlined /> Estado</span>,
                  children: (
                    <div className="sd-tab-body">
                      <div className="sd-card">
                        <div className="sd-card__head"><span className="sd-card__title">Estado actual</span></div>
                        <div className="sd-card__body sd-card__body--cols-2">
                          <div className="sd-field"><span className="sd-field__label">Estado</span><span className="sd-field__value">{estadoTag(usuario.estado)}</span></div>
                          <div className="sd-field"><span className="sd-field__label">Motivo u observación</span><span className="sd-field__value">{usuario.motivo_cambio_estado || 'Usuario activo sin restricciones'}</span></div>
                        </div>
                      </div>
                    </div>
                  ),
                },
              ]}
            />
          </div>
        </div>

        <EditarUsuarioModal
          open={openEdit}
          loading={saving}
          roles={roles}
          initialValues={{
            username: usuario.username,
            rol_id: usuario.rol?.id,
            foto_url: usuario.foto_url,
          }}
          onCancel={() => setOpenEdit(false)}
          onSubmit={saveBasic}
        />
        <CambiarEstadoModal
          open={openEstado}
          loading={saving}
          initialValues={{ estado: usuario.estado ?? null, motivo: usuario.motivo_cambio_estado ?? '' }}
          onCancel={() => setOpenEstado(false)}
          onSubmit={saveEstado}
        />
        <CambiarPasswordModal
          open={openPass}
          loading={saving}
          onCancel={() => setOpenPass(false)}
          onSubmit={savePass}
        />
      </PageTemplate>
    </PermisoGuard>
  );
}
