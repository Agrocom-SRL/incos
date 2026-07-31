/**
 * Organismo: cabecera de la ficha de un trámite de pasantía (TUT · Pasantías).
 *
 * Reusa el shell compartido `sd-profile` vía `DetailProfileCard` (gemelo de
 * `ProyectoGradoFichaHeader`). Camino y estado con StatusPill del kit y
 * métricas del trámite (horas, informes, seguimientos). Recibe props ya
 * mapeadas; no llama hooks (el gate de permiso lo resuelve la página).
 */

import { ShopOutlined } from '@ant-design/icons';
import { StatusPill } from '@atoms';
import { DetailProfileCard } from '@organisms';
import {
  formatEstadoPasantia,
  formatNivelDesempeno,
  formatTipoPasantia,
  getEstadoPasantiaPillClass,
  getTipoPasantiaPillClass,
} from '@application-titulacion/utils/pasantiasPills';

const PasantiaFichaHeader = ({ pasantia, puedeEditar = false, onEditar }) => {
  // El camino ya se muestra como pill en metaExtra; el subtítulo lleva el contexto académico.
  const subtitle =
    [pasantia.carreraNombre, pasantia.gestionLabel].filter(Boolean).join(' · ') ||
    'Trámite de pasantía';

  return (
    <DetailProfileCard
      avatarInitials={<ShopOutlined />}
      avatarClassName="sd-profile__avatar sd-profile__avatar--default"
      active={!['RECHAZADA', 'CANCELADA'].includes(pasantia.estado)}
      title={pasantia.estudianteNombre || 'Trámite de pasantía'}
      subtitle={subtitle}
      metaExtra={
        <>
          <StatusPill
            label={formatTipoPasantia(pasantia.tipo)}
            className={getTipoPasantiaPillClass(pasantia.tipo)}
          />
          <StatusPill
            label={formatEstadoPasantia(pasantia.estado)}
            className={getEstadoPasantiaPillClass(pasantia.estado)}
          />
        </>
      }
      showEdit={puedeEditar}
      onEdit={onEditar}
      editTooltip="Editar datos del trámite"
      editAriaLabel="Editar datos del trámite de pasantía"
      stats={[
        { label: 'Empresa', value: pasantia.empresaNombre || 'Sin empresa asignada' },
        { label: 'Horas', value: pasantia.horasLabel || '—', primary: true },
        { label: 'Informes', value: pasantia.totalInformes ?? 0 },
        { label: 'Seguimientos', value: pasantia.totalSeguimientos ?? 0 },
        ...(pasantia.ultimoSeguimientoNivel != null
          ? [
              {
                label: 'Último desempeño',
                value: formatNivelDesempeno(pasantia.ultimoSeguimientoNivel),
              },
            ]
          : []),
      ]}
    />
  );
};

export default PasantiaFichaHeader;
