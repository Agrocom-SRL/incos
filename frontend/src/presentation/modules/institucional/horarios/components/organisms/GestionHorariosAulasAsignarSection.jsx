import { useMemo, useState } from 'react';
import { Alert, Button as AntButton, Col, Flex, Row, Tabs } from 'antd';
import { Button } from '@atoms';
import { PlusOutlined } from '@ant-design/icons';
import { useAcciones } from '@application/modules/shared/hooks/useAcciones';
import { sanitizeDocenteColorHex } from '@docentes/components/atoms/DocenteColorBar';
import AulasAsignacionGrid, { AULA_ASIGN_MIME } from './AulasAsignacionGrid';

const DIAS = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];

const withAlpha = (hex, alpha = 0.36) => {
  const val = sanitizeDocenteColorHex(hex);
  if (!val) return undefined;
  const r = parseInt(val.slice(1, 3), 16);
  const g = parseInt(val.slice(3, 5), 16);
  const b = parseInt(val.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const fmtTime = (t) => String(t || '').slice(0, 5);

const GestionHorariosAulasAsignarSection = ({
  diaActivo,
  setDiaActivo,
  bloques,
  bloquesFiltrados = [],
  aulas,
  onAsignarAula,
  patchLoading,
}) => {
  const { puedeEditar } = useAcciones('institucional.horario.armado');
  const [modoVista, setModoVista] = useState('lectura');
  const [dragHorarioId, setDragHorarioId] = useState(null);
  const esModoEdicion = modoVista === 'edicion' && puedeEditar;
  const bloquesDia = useMemo(() => (bloques || []).filter((b) => b.dia === diaActivo), [bloques, diaActivo]);
  const bloquesDiaFiltrados = useMemo(
    () => (bloquesFiltrados || []).filter((b) => b.dia === diaActivo),
    [bloquesFiltrados, diaActivo]
  );
  const sinAula = useMemo(() => bloquesDiaFiltrados.filter((b) => !b.aula_id), [bloquesDiaFiltrados]);
  const sinAulaDiaOrdenados = useMemo(
    () =>
      (bloquesDia || [])
        .filter((b) => Number(b.curso_horario_id) > 0 && !b.aula_id)
        .sort(
          (a, b) =>
            String(a.curso_codigo || '').localeCompare(String(b.curso_codigo || '')) ||
            Number(a.orden_secuencia || 0) - Number(b.orden_secuencia || 0) ||
            String(a.hora_inicio || '').localeCompare(String(b.hora_inicio || ''))
        ),
    [bloquesDia]
  );
  const rows = useMemo(() => {
    const map = new Map();
    bloquesDia.forEach((b) => {
      if (!b?.horario_id || !b?.hora_inicio || !b?.hora_fin) return;
      if (map.has(b.horario_id)) return;
      map.set(b.horario_id, {
        horarioId: b.horario_id,
        label: `${fmtTime(b.hora_inicio)}-${fmtTime(b.hora_fin)}`,
        startTime: fmtTime(b.hora_inicio),
      });
    });
    return [...map.values()].sort(
      (a, b) => String(a.startTime).localeCompare(String(b.startTime)) || Number(a.horarioId) - Number(b.horarioId)
    );
  }, [bloquesDia]);

  const onDropAsignacion = async (e, aulaId, horarioId) => {
    const raw = e.dataTransfer.getData(AULA_ASIGN_MIME);
    if (!raw) return;
    try {
      const payload = JSON.parse(raw);
      if (Number(payload.horarioId) !== Number(horarioId)) return;
      await onAsignarAula(payload.cursoHorarioId, aulaId);
    } catch {
      return;
    }
  };

  return (
    <>
      <Row gutter={[12, 12]} align="middle" justify="space-between" style={{ marginBottom: 12 }}>
        <Col>
          <Tabs
            activeKey={diaActivo}
            onChange={esModoEdicion ? undefined : setDiaActivo}
            items={DIAS.map((d) => ({ key: d, label: d, disabled: esModoEdicion }))}
          />
        </Col>
        <Col>
          {esModoEdicion ? null : (
            <AntButton type="primary" icon={<PlusOutlined />} onClick={() => setModoVista('edicion')} disabled={!puedeEditar}>
              Habilitar edición
            </AntButton>
          )}
        </Col>
      </Row>

      <Row gutter={12} align="stretch" className={esModoEdicion ? 'horarios-aulas-edicion-layout' : undefined}>
        {esModoEdicion ? (
          <Col flex="220px">
            {sinAulaDiaOrdenados.length === 0 ? (
              <Alert type="success" showIcon title="Todos los bloques del día tienen aula asignada." />
            ) : (
              <div className="horarios-aulas-edicion-layout__left-scroll" style={{ display: 'grid', gap: 8 }}>
                {sinAulaDiaOrdenados.map((b) => (
                  <div
                    key={b.curso_horario_id}
                    className="da-cal-semanal__chip"
                    draggable={esModoEdicion}
                    onDragStart={(e) => {
                      e.dataTransfer.effectAllowed = 'move';
                      e.dataTransfer.setData(
                        AULA_ASIGN_MIME,
                        JSON.stringify({
                          cursoHorarioId: b.curso_horario_id,
                          cursoId: b.curso_id,
                          horarioId: b.horario_id,
                        })
                      );
                      setDragHorarioId(b.horario_id);
                    }}
                    onDragEnd={() => setDragHorarioId(null)}
                    style={{ backgroundColor: withAlpha(b.curso_color_hex) }}
                  >
                    <div className="da-cal-semanal__chip-hora">{fmtTime(b.hora_inicio)}-{fmtTime(b.hora_fin)}</div>
                    <div className="da-cal-semanal__chip-curso">{b.materia_sigla || b.materia_nombre}</div>
                    <div className="da-cal-semanal__chip-line">{b.paralelo_nombre} · {b.paralelo_turno}</div>
                    {b.docente_nombre ? <div className="da-cal-semanal__chip-line">Docente: {b.docente_nombre}</div> : null}
                    {b.carrera_nombre ? <div className="da-cal-semanal__chip-line"><strong>{b.carrera_nombre}</strong></div> : null}
                    {b.periodo_nombre ? <div className="da-cal-semanal__chip-line">Periodo: {b.periodo_nombre}</div> : null}
                  </div>
                ))}
              </div>
            )}
          </Col>
        ) : null}
        <Col flex="auto">
          <AulasAsignacionGrid
            aulas={aulas}
            rows={rows}
            bloques={bloquesDiaFiltrados}
            puedeEditar={esModoEdicion}
            onDropAsignacion={onDropAsignacion}
            activeDragHorarioId={dragHorarioId}
            onSetActiveDragHorarioId={setDragHorarioId}
            onClearActiveDragHorarioId={() => setDragHorarioId(null)}
          />
        </Col>
      </Row>
      {esModoEdicion ? (
        <Flex justify="flex-end" gap={8} style={{ marginTop: 12 }}>
          <Button variant="default" onClick={() => setModoVista('lectura')} disabled={patchLoading}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={() => setModoVista('lectura')} disabled={patchLoading} loading={patchLoading}>
            Guardar cambios
          </Button>
        </Flex>
      ) : null}
    </>
  );
};

export default GestionHorariosAulasAsignarSection;

