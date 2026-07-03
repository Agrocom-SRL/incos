/**
 * PerfilDocenteSection — rama DOCENTE de "Mi perfil".
 *
 * Atomic Design: ORGANISMO de página (cabecera con título profesional y métricas
 * de carga + tarjeta de cuenta + grilla de accesos del portal). Recibe props ya
 * mapeadas por `usePerfilPage` y los accesos ya construidos; sin fetch.
 */

import { UserOutlined } from '@ant-design/icons';
import { DetailInfoCard, RolPill } from '@molecules';
import { DetailField } from '@atoms';
import { DetailProfileCard } from '@organisms';
import { buildInitials } from '@application/utils/formatters';
import { resumen } from '../../config/perfilAccesos.jsx';
import PerfilAccesosGrid from './PerfilAccesosGrid.jsx';

/** Valor de una línea del `vinculo_perfil` por etiqueta (backend /auth/me). */
function lineaValor(lineas, etiqueta) {
  return lineas?.find((ln) => ln?.etiqueta === etiqueta)?.valor || null;
}

const PerfilDocenteSection = ({ usuario, vinculoPerfil, nombreMostrado, resumenDocente, accesos }) => {
  const rol = usuario?.rol;
  const rolPill = rol?.nombre ? <RolPill rol={rol} /> : null;

  return (
    <>
      <DetailProfileCard
        avatarInitials={buildInitials(nombreMostrado)}
        avatarClassName="sd-profile__avatar sd-profile__avatar--default"
        title={nombreMostrado}
        subtitle={resumen(
          ['Docente', lineaValor(vinculoPerfil?.lineas, 'Título profesional')],
          'Docente',
        )}
        metaExtra={rolPill}
        stats={[
          { label: 'Cursos', value: resumenDocente?.cursos ?? '—', primary: true },
          { label: 'Horas semanales', value: resumenDocente?.horasSemanales ?? '—' },
          { label: 'Gestión', value: resumenDocente?.gestion ?? '—' },
        ]}
      />

      <DetailInfoCard title="Cuenta" icon={<UserOutlined />} cols={2}>
        <DetailField label="Usuario">{usuario.username}</DetailField>
        <DetailField label="Correo">{usuario.email || '—'}</DetailField>
        <DetailField label="Rol">{rolPill ?? '—'}</DetailField>
      </DetailInfoCard>

      <PerfilAccesosGrid accesos={accesos} />
    </>
  );
};

export default PerfilDocenteSection;
