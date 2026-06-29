import { IdcardOutlined, LockOutlined, UserOutlined } from '@ant-design/icons';
import { Tag } from 'antd';
import { PageTemplate } from '@templates';
import { PageHeader, DetailInfoCard } from '@molecules';
import { DetailField, Button } from '@atoms';
import { DetailPageShell, DetailProfileCard } from '@organisms';
import { usePerfilPageContext } from '@/application/modules/perfil/hooks';
import CambiarMiPasswordModal from '@modules/perfil/components/modals/CambiarMiPasswordModal.jsx';

function iniciales(username) {
  const u = (username || '').trim();
  if (!u) return '—';
  return u.slice(0, 2).toUpperCase();
}

export default function PerfilPage() {
  const {
    usuario,
    loading,
    vinculoPerfil,
    openPass,
    saving,
    breadcrumbItems,
    setOpenPass,
    cambiarPassword,
  } = usePerfilPageContext();

  const rol = usuario?.rol;
  const tipoRol = !rol ? '—' : rol.is_system ? 'Sistema' : 'Personalizado';

  return (
    <PageTemplate
      header={
        <PageHeader
          title="Mi perfil"
          breadcrumbItems={breadcrumbItems}
          actions={
            <Button variant="primary" icon={<LockOutlined />} onClick={() => setOpenPass(true)}>
              Cambiar contraseña
            </Button>
          }
        />
      }
    >
      <DetailPageShell
        loading={loading}
        loadingTip="Cargando perfil…"
        showEmpty={!loading && !usuario}
        emptyDescription="No se pudo cargar tu perfil"
      >
        {usuario ? (
          <>
            <DetailProfileCard
              avatarInitials={iniciales(usuario.username)}
              title={usuario.username}
              subtitle={usuario.email || 'Sin correo'}
              metaExtra={
                rol?.nombre ? <Tag color="green">{rol.nombre}</Tag> : null
              }
              stats={[
                { label: 'Rol', value: rol?.nombre || '—', primary: true },
                { label: 'Tipo de rol', value: tipoRol },
              ]}
            />

            <DetailInfoCard title="Cuenta y rol" icon={<UserOutlined />} cols={2}>
              <DetailField label="Usuario">{usuario.username}</DetailField>
              <DetailField label="Correo">{usuario.email || '—'}</DetailField>
              <DetailField label="Rol">{rol?.nombre || '—'}</DetailField>
              <DetailField label="Tipo de rol">{tipoRol}</DetailField>
            </DetailInfoCard>

            {vinculoPerfil ? (
              <DetailInfoCard title="Persona / ficha" icon={<IdcardOutlined />} cols={2}>
                <DetailField label="Vinculación">
                  <Tag color="blue">{vinculoPerfil.tipo_etiqueta}</Tag>
                  <strong style={{ marginLeft: 8 }}>{vinculoPerfil.nombre_completo}</strong>
                </DetailField>
                {(vinculoPerfil.lineas || []).map((ln, idx) => (
                  <DetailField key={`${ln.etiqueta}-${idx}`} label={ln.etiqueta}>
                    {ln.valor || '—'}
                  </DetailField>
                ))}
              </DetailInfoCard>
            ) : null}
          </>
        ) : null}
      </DetailPageShell>

      <CambiarMiPasswordModal
        open={openPass}
        loading={saving}
        onCancel={() => setOpenPass(false)}
        onSubmit={cambiarPassword}
      />
    </PageTemplate>
  );
}
