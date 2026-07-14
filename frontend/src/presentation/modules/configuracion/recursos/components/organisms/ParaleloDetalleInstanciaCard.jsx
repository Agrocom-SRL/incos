/**
 * Tarjeta de paralelo en gestión (oferta) con grilla semanal de horarios.
 */
import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Flex, Spin, Tag, Typography } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { usePermiso } from '@application-auth';
import DocenteHorarioSemanalGrid from '@docentes/components/organisms/DocenteHorarioSemanalGrid';
import { useParaleloGestionGrillaHorarioApi } from '@application-institucional/horarios/hooks/api/useParaleloGestionGrillaHorarioApi';
import { grillaHorarioToCourseSchedules } from '@application-institucional/horarios/mappers/grillaHorarioMapper';
import {
  getSabadoArmadoGridRangeMinutes,
  getTurnoGridRangeMinutes,
} from '@application-institucional/horarios/utils/turnoGridRange';
import { getParaleloTurnoPillClass } from '@application-configuracion/recursos/config/paraleloTurnoOptions';
import StatusPill from '@atoms/StatusPill';
import ParaleloPlanSemanaCell from '@institucional/horarios/components/atoms/ParaleloPlanSemanaCell';

const { Text, Title } = Typography;

const SLOT_STEP = 45;

const estadoTag = (estado) => {
  const e = String(estado || '').toUpperCase();
  switch (e) {
    case 'OFERTADO':
      return { color: 'processing', label: 'OFERTADO' };
    case 'PUBLICADO':
      return { color: 'success', label: 'PUBLICADO' };
    case 'CERRADO':
      return { color: 'default', label: 'CERRADO' };
    default:
      return { color: 'default', label: e || '—' };
  }
};

const ParaleloDetalleInstanciaCard = ({ instancia, paraleloNombre }) => {
  const navigate = useNavigate();
  const puedeEditarHorario = usePermiso('institucional.horario.armado', 'EDITAR');
  const { fetchGrillaHorario, grillaHorario, loading: grillaLoading } =
    useParaleloGestionGrillaHorarioApi();

  const pgId = instancia?.id;
  const turno = instancia?.turno ?? instancia?.paraleloTurnoMaestro;
  const tag = estadoTag(instancia?.estado);

  useEffect(() => {
    if (pgId) fetchGrillaHorario(pgId);
  }, [pgId, fetchGrillaHorario]);

  const gridRange = useMemo(() => getTurnoGridRangeMinutes(turno), [turno]);
  const sabadoRange = useMemo(() => getSabadoArmadoGridRangeMinutes(), []);
  const courseSchedules = useMemo(
    () =>
      grillaHorario
        ? grillaHorarioToCourseSchedules(grillaHorario, {
            turno,
            paraleloNombre: paraleloNombre ?? instancia?.paraleloNombre,
          })
        : [],
    [grillaHorario, turno, paraleloNombre, instancia?.paraleloNombre],
  );

  const onEditarHorario = () => {
    if (!pgId) return;
    const q = new URLSearchParams({ pg: String(pgId), tab: 'plan' });
    navigate(`/institucional/horarios/armado?${q.toString()}`);
  };

  return (
    <Card className="cfg-paralelo-detalle-instancia-card" styles={{ body: { padding: 16 } }}>
      <Flex vertical gap={12}>
        <Flex align="flex-start" justify="space-between" wrap="wrap" gap={8}>
          <div>
            <Flex align="center" gap={8} wrap="wrap">
              <Title level={5} style={{ margin: 0 }}>
                {instancia?.gestionNombre || instancia?.gestionCodigo || 'Gestión'}
              </Title>
              {instancia?.gestionVigente ? <Tag color="green">Vigente</Tag> : null}
              <Tag color={tag.color}>{tag.label}</Tag>
            </Flex>
            <Text type="secondary">
              {instancia?.gestionCodigo ? `${instancia.gestionCodigo} · ` : ''}
              {instancia?.gestionAnio ? `Año ${instancia.gestionAnio} · ` : ''}
              Turno PG:{' '}
              {turno ? (
                <StatusPill label={turno} className={getParaleloTurnoPillClass(turno)} />
              ) : (
                '—'
              )}
              {instancia?.aulaCodigo ? ` · Aula ${instancia.aulaCodigo}` : ''}
              {pgId ? ` · PG #${pgId}` : ''}
              {instancia?.ofertaActual != null ? ` · ${instancia.ofertaActual} cursos` : ''}
            </Text>
          </div>
          {pgId && puedeEditarHorario ? (
            <button
              type="button"
              className="sd-profile__edit-btn"
              onClick={onEditarHorario}
              aria-label="Editar plan semanal en gestión"
              title="Editar plan semanal"
            >
              <EditOutlined />
            </button>
          ) : null}
        </Flex>

        <Spin spinning={grillaLoading} tip="Cargando horario…">
          {courseSchedules.length > 0 ? (
            <div className="cfg-paralelo-detalle-instancia-card__grid">
              <DocenteHorarioSemanalGrid
                courseSchedules={courseSchedules}
                CellComponent={ParaleloPlanSemanaCell}
                gridTimeRange={gridRange}
                saturdayGridTimeRange={sabadoRange}
                slotStepMinutes={SLOT_STEP}
                uniformSlotGrid
                editable={false}
                cellExtraProps={{}}
              />
            </div>
          ) : (
            <Text type="secondary">
              {grillaLoading
                ? ' '
                : 'Sin bloques de horario armados para esta instancia en gestión.'}
            </Text>
          )}
        </Spin>
      </Flex>
    </Card>
  );
};

export default ParaleloDetalleInstanciaCard;
