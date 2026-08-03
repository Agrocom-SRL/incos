/**
 * Organismo: cabecera de la ficha de proyecto de grado (TIT · Titulación).
 *
 * Reusa el shell compartido `sd-profile` vía `DetailProfileCard` (gemelo de
 * `CursoCapacitacionFichaHeader` de CAP). Estado del proyecto con StatusPill
 * del kit y métricas de tutoría (avance, integrantes, observaciones).
 * Recibe props ya mapeadas; no llama hooks (el gate de permiso lo resuelve
 * la página).
 */

import { SolutionOutlined } from '@ant-design/icons';
import { StatusPill } from '@atoms';
import { DetailProfileCard } from '@organisms';
import {
  formatEstadoProyecto,
  getEstadoProyectoPillClass,
} from '@application-titulacion/utils/titulacionPills';

const ProyectoGradoFichaHeader = ({ proyecto, puedeEditar = false, onEditar }) => {
  const subtitle =
    [proyecto.modalidadNombre || proyecto.modalidadCodigo, proyecto.carreraNombre]
      .filter(Boolean)
      .join(' · ') || 'Proyecto de grado';

  return (
    <DetailProfileCard
      avatarInitials={<SolutionOutlined />}
      avatarClassName="sd-profile__avatar sd-profile__avatar--default"
      active={proyecto.activo}
      title={proyecto.titulo}
      subtitle={subtitle}
      metaExtra={
        <StatusPill
          label={formatEstadoProyecto(proyecto.estado)}
          className={getEstadoProyectoPillClass(proyecto.estado)}
        />
      }
      showEdit={puedeEditar}
      onEdit={onEditar}
      editTooltip="Editar datos del proyecto"
      editAriaLabel="Editar datos del proyecto de grado"
      stats={[
        { label: 'Tutor', value: proyecto.tutorNombre || 'Sin tutor asignado' },
        { label: 'Integrantes', value: proyecto.cantidadIntegrantes },
        { label: 'Avance', value: `${proyecto.porcentajeAvance}%`, primary: true },
        { label: 'Obs. pendientes', value: proyecto.observacionesPendientes },
        ...(proyecto.notaFinal != null
          ? [{ label: 'Nota final', value: proyecto.notaFinal }]
          : []),
      ]}
    />
  );
};

export default ProyectoGradoFichaHeader;
