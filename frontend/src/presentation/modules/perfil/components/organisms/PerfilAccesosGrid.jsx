/**
 * PerfilAccesosGrid — sección "Accesos" del hub de "Mi perfil".
 *
 * Atomic Design: ORGANISMO. Recibe la lista de accesos ya resuelta
 * (`config/perfilAccesos.jsx`) y pinta el título + la grilla
 * `estudiante-accesos-grid` de `DashboardAccesoHubCard` (mismo lenguaje visual
 * que el dashboard). Sin fetch.
 *
 * Fail-closed: cada acceso puede declarar `permiso` (`{ codigo|codigo[], accion }`
 * o array de refs) y se oculta si el usuario no lo tiene (`cumplePermisoRef`,
 * el mismo OR de TableActions). Sin accesos visibles → no renderiza nada
 * (rol sin mapeo = sin sección). Navegación solo a rutas internas.
 */

import { useNavigate } from 'react-router-dom';
import { Flex, Typography } from 'antd';
import { allColors, allSpacing, typography } from '@theme/tokens';
import { useAuthContext } from '@application-auth';
import { cumplePermisoRef } from '@molecules';
import DashboardAccesoHubCard from '@dashboard/components/molecules/DashboardAccesoHubCard.jsx';
import '@dashboard/styles/estudiante-home.css';

const { Title } = Typography;

/** Normaliza `permiso` del config a refs `{codigo, accion}` (codigo puede ser array OR). */
const toPermisoRefs = (permiso) => {
  if (!permiso) return null;
  if (Array.isArray(permiso)) return permiso;
  if (Array.isArray(permiso.codigo)) {
    return permiso.codigo.map((codigo) => ({ codigo, accion: permiso.accion }));
  }
  return permiso;
};

const PerfilAccesosGrid = ({ accesos = [], titulo = 'Accesos' }) => {
  const navigate = useNavigate();
  const { hasPermiso } = useAuthContext();

  /** Navega solo a rutas internas seguras. */
  const navegarSeguro = (path) => {
    if (typeof path === 'string' && path.startsWith('/')) navigate(path);
  };

  // Fail-closed: sin `permiso` declarado se muestra (rol ya gobierna la rama);
  // con `permiso`, solo si el usuario lo tiene.
  const visibles = accesos.filter((acceso) => {
    const refs = toPermisoRefs(acceso.permiso);
    return refs ? cumplePermisoRef(refs, hasPermiso) : true;
  });

  if (!visibles.length) return null;

  return (
    <Flex vertical gap={allSpacing.margin}>
      <Title
        level={4}
        style={{
          color: allColors.colorPrimary,
          fontSize: `${typography.fontSizeHeading4}px`,
          fontWeight: typography.fontWeightStrong,
          margin: 0,
        }}
      >
        {titulo}
      </Title>
      <div className="estudiante-accesos-grid">
        {visibles.map((acceso) => (
          <DashboardAccesoHubCard
            key={acceso.key}
            icon={acceso.icon}
            accent={acceso.accent}
            accentBg={acceso.accentBg}
            title={acceso.title}
            description={acceso.description}
            actionLabel={acceso.actionLabel}
            onClick={() => navegarSeguro(acceso.path)}
          />
        ))}
      </div>
    </Flex>
  );
};

export default PerfilAccesosGrid;
