import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { App, Empty, Space, Spin, Tabs, Tag, Typography } from 'antd';
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
import { useRolesList, useUsuarioDetail } from '@/application/modules/seguridad/hooks';
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
  const location = useLocation();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const {
    usuario,
    loading,
    cargar,
    actualizar,
    cambiarEstado,
    cambiarPassword,
  } = useUsuarioDetail();
  const { roles, cargar: cargarRoles } = useRolesList();
  const puedeEditar = usePermiso('seguridad.usuario.administrar', 'EDITAR');
  const puedeVerPermisos = usePermiso('seguridad.rol.gestionar', 'LISTAR');

  const [saving, setSaving] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openEstado, setOpenEstado] = useState(false);
  const [openPass, setOpenPass] = useState(false);

  const uid = parseInt(id, 10);

  const load = async () => {
    if (!uid) return;
    try {
      await cargar(uid);
    } catch (e) {
      message.error(errMsg(e));
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  useEffect(() => {
    const run = async () => {
      await cargarRoles();
    };
    run();
  }, [cargarRoles]);

  useEffect(() => {
    const action = location.state?.quickAction;
    if (!action || !puedeEditar) return;
    if (action === 'edit') setOpenEdit(true);
    if (action === 'estado') setOpenEstado(true);
    if (action === 'password') setOpenPass(true);
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate, puedeEditar]);

  const saveBasic = async (v) => {
    setSaving(true);
    try {
      await actualizar(uid, v);
      setSaving(false);
      message.success('Actualizado');
      setOpenEdit(false);
      load();
    } catch (e) {
      setSaving(false);
      message.error(errMsg(e));
    }
  };

  const saveEstado = async (v) => {
    setSaving(true);
    try {
      await cambiarEstado(uid, v.estado, v.motivo);
      setSaving(false);
      message.success('Estado actualizado');
      setOpenEstado(false);
      load();
    } catch (e) {
      setSaving(false);
      message.error(errMsg(e));
    }
  };

  const savePass = async (passwordNuevo) => {
    setSaving(true);
    try {
      await cambiarPassword(uid, passwordNuevo);
      setSaving(false);
      setOpenPass(false);
      message.success('Contraseña actualizada');
    } catch (e) {
      setSaving(false);
      message.error(errMsg(e));
    }
  };

  const estadoTag = (estado) => {
    if (!estado) return <Tag color="success">Activo</Tag>;
    if (estado === 'BLOQUEADO') return <Tag color="error">BLOQUEADO</Tag>;
    if (estado === 'SUSPENDIDO') return <Tag color="warning">SUSPENDIDO</Tag>;
    if (estado === 'RETIRADO') return <Tag>RETIRADO</Tag>;
    return <Tag>{estado}</Tag>;
  };

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Seguridad', href: '/seguridad/usuarios' },
      { title: 'Usuarios', href: '/seguridad/usuarios' },
      { title: usuario?.username || `Usuario ${uid}` },
    ],
    [usuario, uid]
  );

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
            actions={<Button variant="default" onClick={() => navigate('/seguridad/usuarios')}>Volver</Button>}
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
                          <div className="sd-field"><span className="sd-field__label">username</span><span className="sd-field__value">{usuario.username}</span></div>
                          <div className="sd-field"><span className="sd-field__label">email</span><span className="sd-field__value">{usuario.email || '—'}</span></div>
                          <div className="sd-field"><span className="sd-field__label">foto_url</span><span className="sd-field__value">{usuario.foto_url || '—'}</span></div>
                          <div className="sd-field"><span className="sd-field__label">tipo_referencia</span><span className="sd-field__value">{usuario.tipo_referencia || '—'}</span></div>
                          <div className="sd-field"><span className="sd-field__label">referencia_id</span><span className="sd-field__value">{usuario.referencia_id || '—'}</span></div>
                          <div className="sd-field"><span className="sd-field__label">actualizado</span><span className="sd-field__value">{usuario.updated_at || usuario.updatedAt || '—'}</span></div>
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
                          <div className="sd-field"><span className="sd-field__label">estado</span><span className="sd-field__value">{estadoTag(usuario.estado)}</span></div>
                          <div className="sd-field"><span className="sd-field__label">motivo</span><span className="sd-field__value">{usuario.motivo_cambio_estado || 'Usuario activo sin restricciones'}</span></div>
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
            email: usuario.email,
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
