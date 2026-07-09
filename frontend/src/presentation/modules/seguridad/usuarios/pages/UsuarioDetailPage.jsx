import { useMemo, useState } from 'react';
import { Flex, Tag } from 'antd';
import {
  IdcardOutlined,
  KeyOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
  StopOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { allSpacing } from '@theme/tokens';
import { PageTemplate } from '@templates';
import { PageHeader, DetailInfoCard, DetailTabLabel } from '@molecules';
import { ActionButton, DetailField } from '@atoms';
import { DetailPageShell, DetailProfileCard, DetailTabsPanel, DetailPageHeaderActions } from '@organisms';
import { PermisoGuard } from '@/presentation/guards/PermisoGuard.jsx';
import { useSeguridadUsuarioDetailPageContext } from '@/application/modules/seguridad/hooks';
import CambiarPasswordModal from '@modules/seguridad/usuarios/components/modals/CambiarPasswordModal.jsx';
import CambiarEstadoModal from '@modules/seguridad/usuarios/components/modals/CambiarEstadoModal.jsx';
import UsuarioEstadoTag from '@modules/seguridad/usuarios/components/atoms/UsuarioEstadoTag.jsx';
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

export default function UsuarioDetailPage({ initialTab = 'info' }) {
  const {
    usuario,
    loading,
    savingPass,
    savingEstado,
    openPass,
    openEstado,
    puedeEditar,
    puedeVerPermisos,
    permisosEfectivosCount,
    estadoInitialValues,
    breadcrumbItems,
    setOpenPass,
    setOpenEstado,
    savePass,
    saveEstado,
    goToUsuarioEdit,
    goToUsuarioPermisos,
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
                  <Flex align="center" gap={allSpacing.marginSM}>
                    <Tag color="blue">{usuario.vinculo_perfil.tipo_etiqueta}</Tag>
                    <strong>{usuario.vinculo_perfil.nombre_completo}</strong>
                  </Flex>
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
                <div className="seg-actions">
                  <ActionButton
                    permiso="seguridad.usuario.administrar"
                    accion="DETALLE"
                    variant="primary"
                    icon={<SafetyCertificateOutlined />}
                    onClick={goToUsuarioPermisos}
                  >
                    Ver accesos
                  </ActionButton>
                  {puedeEditar ? (
                    <>
                      <ActionButton
                        variant="error"
                        permiso="seguridad.usuario.administrar"
                        accion="EDITAR"
                        icon={<LockOutlined />}
                        onClick={() => setOpenPass(true)}
                      >
                        Cambiar contraseña
                      </ActionButton>
                      <ActionButton
                        variant="info"
                        permiso="seguridad.usuario.administrar"
                        accion="EDITAR"
                        icon={<StopOutlined />}
                        onClick={() => setOpenEstado(true)}
                      >
                        Cambiar estado
                      </ActionButton>
                    </>
                  ) : null}
                </div>
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
              <DetailField label="Estado"><UsuarioEstadoTag estado={usuario?.estado} /></DetailField>
              <DetailField label="Motivo u observación" span={3}>
                {usuario?.motivo_cambio_estado || 'Usuario activo sin restricciones'}
              </DetailField>
            </DetailInfoCard>
          </div>
        ),
      },
    ];

    return items;
  }, [
    usuario,
    puedeEditar,
    setOpenPass,
    setOpenEstado,
    goToUsuarioPermisos,
  ]);

  const [activeKey, setActiveKey] = useState(initialTab);

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
            actions={<DetailPageHeaderActions onVolver={goToUsuariosList} />}
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
                showEdit={puedeEditar}
                onEdit={goToUsuarioEdit}
                editTooltip="Editar perfil completo"
                editAriaLabel="Editar perfil completo del usuario"
                stats={[
                  { label: 'Rol', value: usuario.rol?.nombre || '—', primary: true },
                  { label: 'Tipo', value: tipoRol },
                  { label: 'Estado', value: <UsuarioEstadoTag estado={usuario.estado} /> },
                  ...(puedeVerPermisos
                    ? [{ label: 'Permisos efectivos', value: permisosEfectivosCount ?? 0 }]
                    : []),
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
        <CambiarEstadoModal
          open={openEstado}
          loading={savingEstado}
          initialValues={estadoInitialValues}
          onCancel={() => setOpenEstado(false)}
          onSubmit={saveEstado}
        />
      </PageTemplate>
    </PermisoGuard>
  );
}
