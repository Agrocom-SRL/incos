/**
 * Página "Accesos del usuario": muestra el acceso RESUELTO (rol + overrides
 * individuales) en una grilla de 3 vías (heredado/otorgado/revocado), espejo visual de
 * `RolPermisosPage` (mismo shell: `PageTemplate` → `PageHeader` → `DetailProfileCard` →
 * `DetailInfoCard` con `Tabs` de dominio como primer hijo del cuerpo — un dominio por
 * pestaña, más descubrible que el `Select` cerrado que reemplaza).
 *
 * Reemplaza la antigua pestaña "Permisos" (con sub-tabs "Permisos del rol" / "Ajustes
 * individuales" / "Permisos efectivos") de la ficha de Usuario: aquí toda esa
 * información vive en una sola grilla — la celda YA muestra si algo viene heredado del
 * rol, si fue otorgado/revocado puntualmente para este usuario, o si no aplica.
 */
import { Alert, Button as AntButton, Checkbox, Empty, Flex, Spin, Tabs, Tag, Typography } from 'antd';
import { ArrowLeftOutlined, KeyOutlined, LockOutlined, StopOutlined } from '@ant-design/icons';
import { allSpacing } from '@theme/tokens';
import { PermisoGuard } from '@/presentation/guards/PermisoGuard.jsx';
import { useSeguridadUsuarioPermisosPageContext } from '@/application/modules/seguridad/hooks';
import AccesosUsuarioDominioPicker from '@modules/seguridad/usuarios/components/organisms/AccesosUsuarioDominioPicker.jsx';
import AgregarOverrideModal from '@modules/seguridad/usuarios/components/modals/AgregarOverrideModal.jsx';
import UsuarioEstadoTag from '@modules/seguridad/usuarios/components/atoms/UsuarioEstadoTag.jsx';
import { PageTemplate } from '@templates';
import { PageHeader, DetailInfoCard } from '@molecules';
import { Button } from '@atoms';
import { DetailPageShell, DetailProfileCard } from '@organisms';
import '@modules/seguridad/roles/styles/roles.css';
import '@modules/seguridad/usuarios/styles/usuarios.css';

function iniciales(username) {
  return String(username || 'U').trim().slice(0, 2).toUpperCase();
}

/**
 * Leyenda compacta de los 4 estados de celda de `AccesosUsuarioDominioPicker` (hallazgo
 * de auditoría: hoy solo se explicaba en el tooltip al hover, no es descubrible). Reusa
 * las clases `.seg-accesos-celda*` de la grilla como "swatch" en vez de inventar un
 * lenguaje visual paralelo.
 */
function LeyendaAccesos() {
  return (
    <Flex gap={allSpacing.margin} wrap role="note" aria-label="Leyenda de estados de acceso" className="seg-accesos-leyenda">
      <span className="seg-accesos-leyenda__item">
        <span className="seg-accesos-celda seg-accesos-celda--heredado seg-accesos-leyenda__swatch">
          <Checkbox checked disabled />
          <LockOutlined className="seg-accesos-celda__lock" />
        </span>
        <Typography.Text type="secondary">Heredado del rol</Typography.Text>
      </span>
      <span className="seg-accesos-leyenda__item">
        <span className="seg-accesos-celda seg-accesos-celda--otorgado seg-accesos-leyenda__swatch">
          <Checkbox checked disabled />
        </span>
        <Typography.Text type="secondary">Otorgado individualmente</Typography.Text>
      </span>
      <span className="seg-accesos-leyenda__item">
        <span className="seg-accesos-celda seg-accesos-celda--revocado seg-accesos-leyenda__swatch">
          <Checkbox disabled />
          <StopOutlined className="seg-accesos-celda__stop" />
        </span>
        <Typography.Text type="secondary">Revocado individualmente</Typography.Text>
      </span>
      <span className="seg-accesos-leyenda__item">
        <span className="seg-accesos-celda seg-accesos-leyenda__swatch">
          <Checkbox disabled />
        </span>
        <Typography.Text type="secondary">Sin acceso</Typography.Text>
      </span>
    </Flex>
  );
}

export default function UsuarioAccesosPage() {
  const {
    usuario,
    grupos,
    loading,
    loadingGrupos,
    dominios,
    dominioSeleccionado,
    puedeVer,
    puedeEditar,
    esAdminSistema,
    overrideOpen,
    savingOverride,
    pendingToggle,
    breadcrumbItems,
    setDominioSeleccionado,
    errorGrupos,
    reintentarGrupos,
    estadoCelda,
    overrideDeCelda,
    toggleCelda,
    isCeldaToggling,
    onAddOverride,
    onCloseOverrideModal,
    goToUsuarioDetail,
  } = useSeguridadUsuarioPermisosPageContext();

  const tipoRol = !usuario?.rol ? '—' : usuario.rol.is_system ? <Tag color="purple">Sistema</Tag> : <Tag>Personalizado</Tag>;

  return (
    <PermisoGuard
      codigo="seguridad.usuario.administrar"
      accion="EDITAR"
      fallback={<Typography.Text type="danger">Sin permiso.</Typography.Text>}
    >
      <PageTemplate
        header={
          <PageHeader
            title="Accesos del usuario"
            breadcrumbItems={breadcrumbItems}
            actions={
              <Button variant="back" icon={<ArrowLeftOutlined />} onClick={goToUsuarioDetail}>
                Volver
              </Button>
            }
          />
        }
      >
        <DetailPageShell
          loading={loading}
          loadingTip="Cargando accesos del usuario…"
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
                  { label: 'Estado', value: <UsuarioEstadoTag estado={usuario.estado} /> },
                ]}
              />

              <DetailInfoCard title="Accesos por dominio" icon={<KeyOutlined />} cols={1}>
                {/* Sin rol asignado no hay grilla que navegar por dominio: se oculta el
                    Tabs entero (en vez de mostrarlo deshabilitado) y solo queda el `Empty`
                    de abajo — una barra de tabs inerte sobre un estado vacío es ruido. */}
                {dominios.length > 0 && usuario?.rol ? (
                  <Tabs
                    activeKey={dominioSeleccionado}
                    onChange={setDominioSeleccionado}
                    items={dominios.map((d) => ({ key: d.value, label: d.label }))}
                    style={{ marginBottom: allSpacing.margin }}
                  />
                ) : null}

                {/* Sin permiso de LISTAR bloquea TODO, incluido el admin del sistema. */}
                {!puedeVer ? (
                  <Alert
                    type="warning"
                    showIcon
                    title="Sin permiso para ver la grilla de accesos"
                    description="Se requiere el permiso de gestión de roles (LISTAR) para ver el detalle de acceso resuelto de este usuario."
                  />
                ) : !usuario?.rol ? (
                  <Empty description="Este usuario no tiene un rol asignado." />
                ) : (
                  <>
                    {esAdminSistema ? (
                      <Alert
                        type="info"
                        showIcon
                        title="Administrador del sistema"
                        description="Este usuario tiene el rol Administrador del sistema; hereda automáticamente todo el catálogo de permisos y no admite overrides individuales. La grilla se muestra completa a modo de referencia, deshabilitada para edición."
                        style={{ marginBottom: allSpacing.margin }}
                      />
                    ) : null}

                    {errorGrupos ? (
                      <Alert
                        type="error"
                        showIcon
                        title="No se pudieron cargar los accesos"
                        description={errorGrupos}
                        action={
                          <AntButton size="small" onClick={reintentarGrupos}>
                            Reintentar
                          </AntButton>
                        }
                      />
                    ) : (
                      // `spinning` cubre el cambio de tab: sin esto, la grilla seguía
                      // mostrando (solo atenuados) los `grupos` del dominio ANTERIOR
                      // mientras `cargarGrupos` traía los nuevos, dando la falsa
                      // impresión de que el dominio recién elegido tiene los mismos
                      // permisos que el anterior.
                      <Spin spinning={loadingGrupos}>
                        <LeyendaAccesos />
                        <AccesosUsuarioDominioPicker
                          grupos={grupos}
                          estadoCelda={estadoCelda}
                          overrideDeCelda={overrideDeCelda}
                          onToggle={toggleCelda}
                          isToggling={isCeldaToggling}
                          disabled={esAdminSistema || !puedeEditar || loadingGrupos}
                        />
                      </Spin>
                    )}
                  </>
                )}
              </DetailInfoCard>
            </>
          ) : null}
        </DetailPageShell>

        <AgregarOverrideModal
          open={overrideOpen}
          loading={savingOverride}
          fixedValues={pendingToggle}
          onCancel={onCloseOverrideModal}
          onSubmit={onAddOverride}
        />
      </PageTemplate>
    </PermisoGuard>
  );
}
