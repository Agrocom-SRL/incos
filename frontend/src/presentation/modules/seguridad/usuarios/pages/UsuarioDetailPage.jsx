import { useMemo, useState } from 'react';
import { Tag } from 'antd';
import {
  EditOutlined,
  IdcardOutlined,
  KeyOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { PageTemplate } from '@templates';
import { PageHeader, DetailInfoCard, DetailTabLabel } from '@molecules';
import { Button, ActionButton, DetailField } from '@atoms';
import { DetailPageShell, DetailProfileCard, DetailTabsPanel } from '@organisms';
import { PermisoGuard } from '@/presentation/guards/PermisoGuard.jsx';
import { SeguridadUsuarioPermisosProvider } from '@/application/modules/seguridad/providers';
import { useSeguridadUsuarioDetailPageContext } from '@/application/modules/seguridad/hooks';
import CambiarPasswordModal from '@modules/seguridad/usuarios/components/modals/CambiarPasswordModal.jsx';
import EditarUsuarioModal from '@modules/seguridad/usuarios/components/modals/EditarUsuarioModal.jsx';
import UsuarioPermisosTab from '@modules/seguridad/usuarios/components/organisms/UsuarioPermisosTab.jsx';
import '@modules/seguridad/usuarios/styles/usuarios.css';

function fmtDateTime(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString('es-BO', { dateStyle: 'short', timeStyle: 'short' });
}

function iniciales(username) {
  return String(username || 'U').slice(0, 2).toUpperCase();
}

function estadoTag(estado) {
  if (!estado) return <Tag color="success">Activo</Tag>;
  if (estado === 'BLOQUEADO') return <Tag color="error">BLOQUEADO</Tag>;
  if (estado === 'SUSPENDIDO') return <Tag color="warning">SUSPENDIDO</Tag>;
  if (estado === 'RETIRADO') return <Tag>RETIRADO</Tag>;
  return <Tag>{estado}</Tag>;
}

export default function UsuarioDetailPage({ initialTab = 'info' }) {
  const {
    usuario,
    loading,
    savingPass,
    savingAccion,
    openPass,
    openEdit,
    puedeEditar,
    puedeVerPermisos,
    rolesParaSelect,
    editInitialValues,
    breadcrumbItems,
    setOpenPass,
    setOpenEdit,
    openEditModal,
    savePass,
    saveEdit,
    goToUsuarioEdit,
    goToUsuariosList,
  } = useSeguridadUsuarioDetailPageContext();

  const tipoRol = !usuario?.rol ? '—' : usuario.rol.is_system ? 'Sistema' : 'Personalizado';

  const tabItems = useMemo(() => {
    const items = [
      {
        key: 'info',
        label: <DetailTabLabel icon={<UserOutlined />}>Información</DetailTabLabel>,
        children: (
          <div className="sd-tab-body">
            <DetailInfoCard title="Datos de la cuenta" icon={<UserOutlined />} cols={3}>
              <DetailField label="Usuario">{usuario?.username}</DetailField>
              <DetailField label="Correo">{usuario?.email || '—'}</DetailField>
              <DetailField label="Foto (enlace)">{usuario?.foto_url || '—'}</DetailField>
              <DetailField label="Última actualización">
                {fmtDateTime(usuario?.updated_at || usuario?.updatedAt)}
              </DetailField>
            </DetailInfoCard>

            {usuario?.vinculo_perfil ? (
              <DetailInfoCard title="Perfil en la institución" icon={<IdcardOutlined />} cols={1}>
                <DetailField label="Vinculación">
                  <Tag color="blue">{usuario.vinculo_perfil.tipo_etiqueta}</Tag>
                  <strong style={{ marginLeft: 8 }}>{usuario.vinculo_perfil.nombre_completo}</strong>
                </DetailField>
                {(usuario.vinculo_perfil.lineas || []).map((ln, idx) => (
                  <DetailField key={`${ln.etiqueta}-${idx}`} label={ln.etiqueta}>
                    {ln.valor || '—'}
                  </DetailField>
                ))}
              </DetailInfoCard>
            ) : null}
          </div>
        ),
      },
      {
        key: 'acceso',
        label: <DetailTabLabel icon={<KeyOutlined />}>Rol y acceso</DetailTabLabel>,
        children: (
          <div className="sd-tab-body">
            <DetailInfoCard
              title="Rol y estado"
              icon={<KeyOutlined />}
              cols={3}
              extra={
                puedeEditar ? (
                  <div className="seg-actions">
                    <ActionButton
                      permiso="seguridad.usuario.administrar"
                      accion="EDITAR"
                      variant="primary"
                      icon={<EditOutlined />}
                      onClick={openEditModal}
                    >
                      Cambiar rol y datos
                    </ActionButton>
                    <ActionButton
                      permiso="seguridad.usuario.administrar"
                      accion="EDITAR"
                      icon={<LockOutlined />}
                      onClick={() => setOpenPass(true)}
                    >
                      Cambiar contraseña
                    </ActionButton>
                  </div>
                ) : null
              }
            >
              <DetailField label="Rol">{usuario?.rol?.nombre || '—'}</DetailField>
              <DetailField label="Tipo de rol">
                {!usuario?.rol ? (
                  '—'
                ) : usuario.rol.is_system ? (
                  <Tag color="purple">Sistema</Tag>
                ) : (
                  <Tag>Personalizado</Tag>
                )}
              </DetailField>
              <DetailField label="Estado">{estadoTag(usuario?.estado)}</DetailField>
              <DetailField label="Motivo u observación" span={3}>
                {usuario?.motivo_cambio_estado || 'Usuario activo sin restricciones'}
              </DetailField>
            </DetailInfoCard>

            {puedeEditar ? (
              <div className="seg-actions" style={{ marginTop: 16 }}>
                <Button variant="back" icon={<EditOutlined />} onClick={goToUsuarioEdit}>
                  Editar perfil completo
                </Button>
              </div>
            ) : null}
          </div>
        ),
      },
    ];

    if (puedeVerPermisos) {
      items.push({
        key: 'permisos',
        label: <DetailTabLabel icon={<SafetyCertificateOutlined />}>Permisos</DetailTabLabel>,
        children: (
          <div className="sd-tab-body">
            <SeguridadUsuarioPermisosProvider>
              <UsuarioPermisosTab />
            </SeguridadUsuarioPermisosProvider>
          </div>
        ),
      });
    }

    return items;
  }, [
    usuario,
    puedeEditar,
    puedeVerPermisos,
    openEditModal,
    setOpenPass,
    goToUsuarioEdit,
  ]);

  const initialActiveKey = initialTab === 'permisos' && !puedeVerPermisos ? 'info' : initialTab;
  const [activeKey, setActiveKey] = useState(initialActiveKey);

  return (
    <PermisoGuard
      codigo="seguridad.usuario.administrar"
      accion="DETALLE"
      fallback={<div className="sd-empty">No tiene permiso para ver esta página.</div>}
    >
      <PageTemplate
        header={
          <PageHeader
            title={usuario ? `Usuario ${usuario.username}` : 'Usuario'}
            breadcrumbItems={breadcrumbItems}
            actions={<Button variant="back" onClick={goToUsuariosList}>Volver</Button>}
          />
        }
      >
        <DetailPageShell
          loading={loading}
          loadingTip="Cargando usuario…"
          showEmpty={!loading && !usuario}
          emptyDescription="No se encontró el usuario"
        >
          {usuario ? (
            <>
              <DetailProfileCard
                avatarInitials={iniciales(usuario.username)}
                active={!usuario.estado}
                title={usuario.username}
                subtitle={usuario.email || 'Sin correo'}
                metaExtra={usuario.rol?.nombre ? <Tag color="green">{usuario.rol.nombre}</Tag> : null}
                stats={[
                  { label: 'Rol', value: usuario.rol?.nombre || '—', primary: true },
                  { label: 'Tipo', value: tipoRol },
                  { label: 'Estado', value: estadoTag(usuario.estado) },
                ]}
              />

              <DetailTabsPanel items={tabItems} activeKey={activeKey} onChange={setActiveKey} />
            </>
          ) : null}
        </DetailPageShell>

        <CambiarPasswordModal
          open={openPass}
          loading={savingPass}
          onCancel={() => setOpenPass(false)}
          onSubmit={savePass}
        />
        <EditarUsuarioModal
          open={openEdit}
          loading={savingAccion}
          roles={rolesParaSelect}
          initialValues={editInitialValues}
          onCancel={() => setOpenEdit(false)}
          onSubmit={saveEdit}
        />
      </PageTemplate>
    </PermisoGuard>
  );
}
