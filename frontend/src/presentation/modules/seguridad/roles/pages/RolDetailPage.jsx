/**
 * Ficha de detalle de un rol (solo lectura): datos básicos + cantidad de
 * permisos (tab Información) y usuarios que tienen el rol, paginados
 * server-side (tab Usuarios con este rol). El editor de permisos vive en
 * `RolPermisosPage` (no se toca): esta ficha solo enlaza a él.
 */
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tag } from 'antd';
import { KeyOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons';
import { PageTemplate } from '@templates';
import { PageHeader, DetailInfoCard, DetailTabLabel } from '@molecules';
import { ActionButton, DetailField, StatusPill } from '@atoms';
import { DetailPageShell, DetailProfileCard, DetailTabsPanel, DetailPageHeaderActions } from '@organisms';
import { PermisoGuard } from '@/presentation/guards/PermisoGuard.jsx';
import { useSeguridadRolDetailPageContext } from '@/application/modules/seguridad/hooks';
import { TIPO_CONFIG } from '@modules/seguridad/roles/constants/rolTipoConfig.js';
import { rolPillClass } from '@modules/seguridad/roles/components/atoms/rolColor.js';
import RolUsuariosSection from '@modules/seguridad/roles/components/organisms/RolUsuariosSection.jsx';
import '@presentation/styles/pages/detail-page.css';
import '@modules/seguridad/roles/styles/roles.css';

function iniciales(nombre) {
  return String(nombre || 'R').trim().slice(0, 2).toUpperCase();
}

export default function RolDetailPage() {
  const navigate = useNavigate();
  const {
    rol,
    loading,
    breadcrumbItems,
    puedeGestionarPermisos,
    usuarios,
    loadingUsuarios,
    errorUsuarios,
    refetchUsuarios,
    searchText,
    handleSearchChange,
    tablePagination,
    goToRolesList,
    goToGestionarPermisos,
  } = useSeguridadRolDetailPageContext();

  const tipoCfg = useMemo(
    () => (rol ? TIPO_CONFIG[rol.tipo] ?? { label: rol.tipo || '—' } : null),
    [rol]
  );

  const tabItems = useMemo(() => {
    if (!rol) return [];
    const gestionarPermisosButton = puedeGestionarPermisos ? (
      <ActionButton
        permiso="seguridad.rol.gestionar"
        accion="EDITAR"
        variant="primary"
        icon={<KeyOutlined />}
        onClick={goToGestionarPermisos}
      >
        Gestionar permisos
      </ActionButton>
    ) : null;

    return [
      {
        key: 'info',
        label: <DetailTabLabel icon={<UserOutlined />}>Información</DetailTabLabel>,
        children: (
          <div className="sd-tab-body">
            <DetailInfoCard title="Datos del rol" icon={<UserOutlined />} cols={3} extra={gestionarPermisosButton}>
              <DetailField label="Nombre">{rol.nombre}</DetailField>
              <DetailField label="Código">{rol.codigo}</DetailField>
              <DetailField label="Tipo">
                {tipoCfg ? (
                  <StatusPill label={tipoCfg.label} className={rolPillClass(rol.tipo, rol.is_system)} />
                ) : (
                  '—'
                )}
              </DetailField>
              <DetailField label="Rol de sistema">
                {rol.is_system ? <Tag color="purple">Sí</Tag> : <Tag>No</Tag>}
              </DetailField>
              <DetailField label="Cantidad de permisos" span={2}>
                {rol.cantidadPermisos ?? 0}
              </DetailField>
            </DetailInfoCard>
          </div>
        ),
      },
      {
        key: 'usuarios',
        label: <DetailTabLabel icon={<TeamOutlined />}>Usuarios con este rol</DetailTabLabel>,
        children: (
          <div className="sd-tab-body">
            <RolUsuariosSection
              usuarios={usuarios}
              loading={loadingUsuarios}
              error={errorUsuarios}
              onRetry={refetchUsuarios}
              searchText={searchText}
              onSearchChange={handleSearchChange}
              tablePagination={tablePagination}
              navigate={navigate}
            />
          </div>
        ),
      },
    ];
  }, [
    rol,
    tipoCfg,
    puedeGestionarPermisos,
    goToGestionarPermisos,
    usuarios,
    loadingUsuarios,
    errorUsuarios,
    refetchUsuarios,
    searchText,
    handleSearchChange,
    tablePagination,
    navigate,
  ]);

  return (
    <PermisoGuard
      codigo="seguridad.rol.gestionar"
      accion="DETALLE"
      fallback={<div className="sd-empty">No tiene permiso para ver esta página.</div>}
    >
      <PageTemplate
        header={
          <PageHeader
            title={rol ? `Rol ${rol.nombre}` : 'Rol'}
            breadcrumbItems={breadcrumbItems}
            actions={<DetailPageHeaderActions onVolver={goToRolesList} />}
          />
        }
      >
        <DetailPageShell
          loading={loading}
          loadingTip="Cargando rol…"
          showEmpty={!loading && !rol}
          emptyDescription="No se encontró el rol"
        >
          {rol ? (
            <>
              <DetailProfileCard
                avatarInitials={iniciales(rol.nombre)}
                title={rol.nombre}
                subtitle={rol.codigo}
                metaExtra={
                  tipoCfg ? (
                    <StatusPill label={tipoCfg.label} className={rolPillClass(rol.tipo, rol.is_system)} />
                  ) : null
                }
                stats={[
                  { label: 'Permisos', value: rol.cantidadPermisos ?? 0, primary: true },
                  { label: 'Tipo', value: rol.is_system ? 'Sistema' : 'Personalizado' },
                ]}
              />

              <DetailTabsPanel items={tabItems} defaultActiveKey="info" />
            </>
          ) : null}
        </DetailPageShell>
      </PageTemplate>
    </PermisoGuard>
  );
}
