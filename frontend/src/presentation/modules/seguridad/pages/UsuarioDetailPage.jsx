import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { App, Empty, Space, Spin, Tabs, Tag } from 'antd';
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
import { usePermiso } from '@/presentation/hooks/usePermiso.js';
import { useUsuarios } from '@modules/seguridad/hooks/useUsuarios.js';
import { useRoles } from '@modules/seguridad/hooks/useRoles.js';
import CambiarPasswordModal from '@modules/seguridad/components/modals/CambiarPasswordModal.jsx';
import CambiarEstadoModal from '@modules/seguridad/components/modals/CambiarEstadoModal.jsx';
import EditarUsuarioModal from '@modules/seguridad/components/modals/EditarUsuarioModal.jsx';
import '@modules/seguridad/styles/seguridad.css';

function errMsg(json) {
  const e = json?.error;
  if (json?.error?.details?.length) {
    return json.error.details.map((d) => d.message).join('. ');
  }
  return typeof e === 'string' ? e : e?.message || 'Error';
}

export default function UsuarioDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const api = useUsuarios();
  const rolesApi = useRoles();
  const puedeEditar = usePermiso('seguridad.usuario.administrar', 'EDITAR');
  const puedeVerPermisos = usePermiso('seguridad.rol.gestionar', 'VER');

  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openEstado, setOpenEstado] = useState(false);
  const [openPass, setOpenPass] = useState(false);

  const uid = parseInt(id, 10);

  const load = async () => {
    if (!uid) return;
    setLoading(true);
    const w = await api.getUser(uid);
    setLoading(false);
    if (!w) return;
    const { res, json } = w;
    if (!res.ok) {
      message.error(errMsg(json));
      return;
    }
    const u = json.data;
    setUser(u);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  useEffect(() => {
    const run = async () => {
      const w = await rolesApi.listRoles();
      if (!w) return;
      const { res, json } = w;
      if (res.ok) setRoles(json.data?.roles || []);
    };
    run();
  }, [rolesApi]);

  const saveBasic = async (v) => {
    setSaving(true);
    const w = await api.updateUser(uid, v);
    setSaving(false);
    if (!w) return;
    const { res, json } = w;
    if (res.ok) {
      message.success('Actualizado');
      setOpenEdit(false);
      load();
    } else message.error(errMsg(json));
  };

  const saveEstado = async (v) => {
    setSaving(true);
    const w = await api.changeEstado(uid, v);
    setSaving(false);
    if (!w) return;
    const { res, json } = w;
    if (res.ok) {
      message.success('Estado actualizado');
      setOpenEstado(false);
      load();
    } else message.error(errMsg(json));
  };

  const savePass = async (passwordNuevo) => {
    setSaving(true);
    const w = await api.changePassword(uid, { password_nuevo: passwordNuevo });
    setSaving(false);
    if (!w) return;
    const { res, json } = w;
    if (res.ok) {
      setOpenPass(false);
      message.success('Contraseña actualizada');
    }
    else message.error(errMsg(json));
  };

  const estadoTag = (estado) => {
    if (!estado) return <Tag color="success">Activo</Tag>;
    if (estado === 'BLOQUEADO') return <Tag color="error">BLOQUEADO</Tag>;
    if (estado === 'SUSPENDIDO') return <Tag color="warning">SUSPENDIDO</Tag>;
    if (estado === 'RETIRADO') return <Tag>RETIRADO</Tag>;
    return <Tag>{estado}</Tag>;
  };

  const nivelColor = (nivel) => (nivel >= 5 ? 'purple' : nivel >= 4 ? 'blue' : nivel >= 3 ? 'cyan' : nivel >= 2 ? 'green' : 'default');
  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Seguridad', href: '/seguridad/usuarios' },
      { title: 'Usuarios', href: '/seguridad/usuarios' },
      { title: user?.username || `Usuario ${uid}` },
    ],
    [user, uid]
  );

  if (loading) {
    return <div className="sd-loading"><Spin size="large" /></div>;
  }

  if (!user) {
    return <Empty description="No se encontró el usuario" />;
  }

  return (
    <PermisoGuard
      codigo="seguridad.usuario.administrar"
      accion="VER"
      fallback={
        <Typography.Text type="danger">Sin permiso.</Typography.Text>
      }
    >
      <PageTemplate
        header={
          <PageHeader
            title={`Usuario ${user.username}`}
            breadcrumbItems={breadcrumbItems}
            actions={<Button variant="default" onClick={() => navigate('/seguridad/usuarios')}>Volver</Button>}
          />
        }
      >
        <div className="sd">
          <div className="sd-profile">
            <div className="sd-profile__identity">
              <div className="sd-profile__avatar">{String(user.username || 'U').slice(0, 2).toUpperCase()}</div>
              <div className="sd-profile__name-block">
                <h1 className="sd-profile__name">{user.username}</h1>
                <p className="seg-profile__sub">{user.email} · {user.rol?.nombre || 'Sin rol'}</p>
              </div>
            </div>
            <div className="sd-profile__divider" />
            <div className="sd-profile__stats seg-profile__stats">
              <div className="sd-stat">
                <span className="sd-stat__label">Rol</span>
                <span className="sd-stat__value">{user.rol?.nombre || '—'}</span>
              </div>
              <div className="sd-stat">
                <span className="sd-stat__label">Nivel</span>
                <span className="sd-stat__value"><Tag color={nivelColor(user.rol?.nivel_acceso)}>{user.rol?.nivel_acceso ?? '—'}</Tag></span>
              </div>
              <div className="sd-stat">
                <span className="sd-stat__label">Estado</span>
                <span className="sd-stat__value">{estadoTag(user.estado)}</span>
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
                <button type="button" className="sd-btn sd-btn--primary" onClick={() => navigate(`/seguridad/usuarios/${uid}/permisos`)}>
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
                      <div className="sd-card">
                        <div className="sd-card__head"><span className="sd-card__title">Datos de la cuenta</span></div>
                        <div className="sd-card__body sd-card__body--cols-3">
                          <div className="sd-field"><span className="sd-field__label">username</span><span className="sd-field__value">{user.username}</span></div>
                          <div className="sd-field"><span className="sd-field__label">email</span><span className="sd-field__value">{user.email || '—'}</span></div>
                          <div className="sd-field"><span className="sd-field__label">foto_url</span><span className="sd-field__value">{user.foto_url || '—'}</span></div>
                          <div className="sd-field"><span className="sd-field__label">tipo_referencia</span><span className="sd-field__value">{user.tipo_referencia || '—'}</span></div>
                          <div className="sd-field"><span className="sd-field__label">referencia_id</span><span className="sd-field__value">{user.referencia_id || '—'}</span></div>
                          <div className="sd-field"><span className="sd-field__label">actualizado</span><span className="sd-field__value">{user.updated_at || user.updatedAt || '—'}</span></div>
                        </div>
                      </div>
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
                          <div className="sd-field"><span className="sd-field__label">estado</span><span className="sd-field__value">{estadoTag(user.estado)}</span></div>
                          <div className="sd-field"><span className="sd-field__label">motivo</span><span className="sd-field__value">{user.motivo_cambio_estado || 'Usuario activo sin restricciones'}</span></div>
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
            username: user.username,
            email: user.email,
            rol_id: user.rol?.id,
            foto_url: user.foto_url,
          }}
          onCancel={() => setOpenEdit(false)}
          onSubmit={saveBasic}
        />
        <CambiarEstadoModal
          open={openEstado}
          loading={saving}
          initialValues={{ estado: user.estado ?? null, motivo: user.motivo_cambio_estado ?? '' }}
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
