/**
 * Tarjeta de asignación docente — patrón cobertura horarios (Card atómico + meta).
 */

import { Flex, Typography } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Card, ActionButton, StatusPill } from '@atoms';
import { sanitizeDocenteColorHex } from '@docentes/components/atoms/DocenteColorBar';

const { Text } = Typography;

const MetaLine = ({ label, value }) => {
  if (value == null || value === '' || value === '—') return null;
  return (
    <Text type="secondary">
      {label}: <Text strong>{value}</Text>
    </Text>
  );
};

const DocenteAssignmentCard = ({
  assignment: a,
  showActions = false,
  onEdit = null,
  onDelete = null,
}) => {
  const titulo = a.materia || a.siglaMateria || 'Materia sin nombre';
  const accent =
    sanitizeDocenteColorHex(a.cursoColorHex) || sanitizeDocenteColorHex(a.carreraColorHex);
  const conflictos = a?.conflictos || {};
  const hasConflictos = Boolean(conflictos.hasConflictos) || Number(conflictos.total) > 0;
  const conflictResumen = [
    conflictos.horario ? 'horario' : null,
    conflictos.aula ? 'aula' : null,
    conflictos.curso ? 'curso' : null,
  ]
    .filter(Boolean)
    .join(' · ');

  const cargaHoraria =
    a.cargaHorariaSemanal != null
      ? `${a.cargaHorariaSemanal} h/semana`
      : a.horasPlanMateria != null
        ? `${a.horasPlanMateria} h/semana (plan)`
        : null;

  const statusPill = hasConflictos ? (
    <StatusPill label="Conflicto" className="cfg-materia-pill cfg-materia-pill--inactiva" />
  ) : a.vigente ? (
    <StatusPill label="Vigente" className="cfg-materia-pill cfg-materia-pill--activa" />
  ) : (
    <StatusPill label="No vigente" className="cfg-materia-pill cfg-materia-pill--default" />
  );

  const cardExtra = (
    <Flex align="center" gap={8} wrap="wrap" justify="flex-end">
      {showActions && (onEdit || onDelete) ? (
        <>
          {onEdit ? (
            <ActionButton
              permiso="docentes.asignar"
              accion="EDITAR"
              size="small"
              variant="warning"
              icon={<EditOutlined />}
              onClick={() => onEdit?.(a)}
              title="Editar asignación"
            />
          ) : null}
          {onDelete ? (
            <ActionButton
              permiso="docentes.asignar"
              accion="ELIMINAR"
              size="small"
              variant="error"
              icon={<DeleteOutlined />}
              onClick={() => onDelete?.(a)}
              title="Dar de baja asignación"
            />
          ) : null}
        </>
      ) : null}
      {statusPill}
    </Flex>
  );

  return (
    <Card
      variant="default"
      shadow
      headerColor="primary"
      headerAccentHex={accent}
      title={titulo}
      extra={cardExtra}
      className={hasConflictos ? 'docente-asignacion-card--conflict' : undefined}
    >
      <Flex vertical gap={6}>
        <MetaLine label="Sigla" value={a.siglaMateria} />
        <MetaLine label="Paralelo" value={a.paralelo} />
        <MetaLine label="Turno" value={a.turnoParalelo} />
        <MetaLine label="Carga horaria" value={cargaHoraria} />
        <MetaLine label="Gestión" value={a.gestion} />
        <MetaLine label="Plan habilitado" value={a.planHabilitado} />
        <MetaLine label="Oferta" value={a.cursoCodigo} />
        <MetaLine label="Asignación" value={a.fechaAsignacion} />
        {hasConflictos ? (
          <Text type="danger">
            Conflicto detectado
            {conflictResumen ? `: ${conflictResumen}` : ''}
          </Text>
        ) : null}
      </Flex>
    </Card>
  );
};

export default DocenteAssignmentCard;
