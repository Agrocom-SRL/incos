/**
 * Organismo: tab "Información" de la ficha de curso (CAP).
 *
 * Compone `DetailInfoCard` + `DetailField` (patrón de fichas del sistema).
 * Recibe el curso ya mapeado; no llama hooks de fetch.
 */

import { InfoCircleOutlined } from '@ant-design/icons';
import { DetailInfoCard } from '@molecules';
import { DetailField, StatusPill } from '@atoms';
import {
  formatEstadoCurso,
  getEstadoCursoPillClass,
} from '@application-capacitacion/utils/capacitacionPills';
import CostoCursoLabel from '@capacitacion/components/atoms/CostoCursoLabel';

const CursoInformacionSection = ({ curso }) => (
  <div className="sd-tab-body">
    <DetailInfoCard title="Datos del curso" icon={<InfoCircleOutlined />} cols={3}>
      <DetailField label="Estado">
        <StatusPill
          label={formatEstadoCurso(curso.estado)}
          className={getEstadoCursoPillClass(curso.estado)}
        />
      </DetailField>
      <DetailField label="Costo">
        <CostoCursoLabel costo={curso.costo} />
      </DetailField>
      <DetailField label="Cupo máximo">
        {curso.cupoMaximo != null ? curso.cupoMaximo : '—'}
      </DetailField>
      <DetailField label="Fecha de inicio">{curso.fechaInicioLabel || '—'}</DetailField>
      <DetailField label="Fecha de fin">{curso.fechaFinLabel || '—'}</DetailField>
      <DetailField label="Aula">{curso.aulaLabel || 'Sin aula asignada'}</DetailField>
      <DetailField label="Inscritos">{curso.inscritosCount}</DetailField>
      <DetailField label="Cupo disponible">
        {curso.cupoMaximo != null ? curso.cupoDisponible : '—'}
      </DetailField>
      <DetailField label="Registro activo">{curso.activo ? 'Sí' : 'No'}</DetailField>
    </DetailInfoCard>

    {curso.descripcion ? (
      <DetailInfoCard title="Descripción" icon={<InfoCircleOutlined />} cols={1}>
        <DetailField label="Detalle">{curso.descripcion}</DetailField>
      </DetailInfoCard>
    ) : null}
  </div>
);

export default CursoInformacionSection;
