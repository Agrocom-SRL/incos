import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Button as AntButton, Col, Flex, Row, Tabs, message } from 'antd';
import { Button, FieldSelect } from '@atoms';
import { allColors, typography } from '@theme/tokens';
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
  bloquesLoading = false,
  initialForzarEdicion = false,
  onEditModeChange,
  vistaExpandida = false,
  paraleloFocoId = null,
}) => {
  const { puedeEditar } = useAcciones('institucional.horario.armado');
  const [messageApi, contextHolder] = message.useMessage();
  const [modoVista, setModoVista] = useState('lectura');
  const edicionAutoQueryKeyRef = useRef('');
  const [dragHorarioId, setDragHorarioId] = useState(null);
  const [workingBloquesDia, setWorkingBloquesDia] = useState([]);
  const [originalBloquesDia, setOriginalBloquesDia] = useState([]);
  const [savingDraft, setSavingDraft] = useState(false);
  const [filtroParalelo, setFiltroParalelo] = useState('all');
  const esModoEdicion = modoVista === 'edicion' && puedeEditar;
  const bloquesDia = useMemo(() => (bloques || []).filter((b) => b.dia === diaActivo), [bloques, diaActivo]);
  const bloquesDiaFiltrados = useMemo(
    () => (bloquesFiltrados || []).filter((b) => b.dia === diaActivo),
    [bloquesFiltrados, diaActivo]
  );
  const bloquesBaseDia = useMemo(
    () => (paraleloFocoId != null ? bloquesDiaFiltrados : bloquesDia),
    [paraleloFocoId, bloquesDiaFiltrados, bloquesDia]
  );
  const bloquesDiaVista = esModoEdicion ? workingBloquesDia : bloquesDiaFiltrados;
  const sinAulaDiaBase = useMemo(() => {
    const source = esModoEdicion ? (workingBloquesDia || []) : (bloquesBaseDia || []);
    return source.filter((b) => Number(b.curso_horario_id) > 0 && !b.aula_id);
  }, [esModoEdicion, workingBloquesDia, bloquesBaseDia]);

  const paralelosDisponibles = useMemo(() => {
    const seen = new Map();
    sinAulaDiaBase.forEach((b) => {
      if (b.paralelo_id && !seen.has(b.paralelo_id)) {
        seen.set(b.paralelo_id, {
          value: Number(b.paralelo_id),
          label: b.paralelo_nombre || `Paralelo ${b.paralelo_id}`,
          carrera: b.carrera_nombre || '',
          periodo: b.periodo_nombre || '',
        });
      }
    });
    return [...seen.values()].sort((a, b) => String(a.label).localeCompare(String(b.label)));
  }, [sinAulaDiaBase]);

  const sinAulaDiaOrdenados = useMemo(() => {
    return sinAulaDiaBase
      .filter((b) => filtroParalelo === 'all' || Number(b.paralelo_id) === filtroParalelo)
      .sort(
        (a, b) =>
          String(a.curso_codigo || '').localeCompare(String(b.curso_codigo || '')) ||
          Number(a.orden_secuencia || 0) - Number(b.orden_secuencia || 0) ||
          String(a.hora_inicio || '').localeCompare(String(b.hora_inicio || ''))
      );
  }, [sinAulaDiaBase, filtroParalelo]);
  const rows = useMemo(() => {
    const map = new Map();
    (bloquesDia || []).forEach((b) => {
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

  useEffect(() => {
    if (!esModoEdicion) {
      const snapshot = (bloquesBaseDia || []).map((b) => ({ ...b }));
      setWorkingBloquesDia(snapshot);
      setOriginalBloquesDia(snapshot);
    }
  }, [bloquesBaseDia, esModoEdicion]);

  useEffect(() => {
    if (!initialForzarEdicion) {
      edicionAutoQueryKeyRef.current = '';
    }
  }, [initialForzarEdicion]);

  useEffect(() => {
    if (!initialForzarEdicion || !puedeEditar) return;
    if (bloquesLoading) return;
    const snapshotSource = paraleloFocoId != null ? bloquesDiaFiltrados : bloquesDia;
    const snapshot = (snapshotSource || []).map((b) => ({ ...b }));
    if (snapshot.length === 0) return;
    const key = `1|${paraleloFocoId ?? ''}|${diaActivo}`;
    if (edicionAutoQueryKeyRef.current === key) return;
    edicionAutoQueryKeyRef.current = key;
    setWorkingBloquesDia(snapshot);
    setOriginalBloquesDia(snapshot);
    setModoVista('edicion');
  }, [
    initialForzarEdicion,
    puedeEditar,
    bloquesLoading,
    bloquesDia,
    bloquesDiaFiltrados,
    paraleloFocoId,
    diaActivo,
  ]);

  useEffect(() => {
    onEditModeChange?.(esModoEdicion);
  }, [esModoEdicion, onEditModeChange]);

  useEffect(() => {
    if (!esModoEdicion) setFiltroParalelo('all');
  }, [esModoEdicion]);

  const onDropAsignacion = async (e, aulaId, horarioId, payloadFromGrid = null) => {
    const raw = e.dataTransfer.getData(AULA_ASIGN_MIME);
    try {
      const payload = payloadFromGrid || (raw ? JSON.parse(raw) : null);
      if (!payload) return;
      if (Number(payload.horarioId) !== Number(horarioId)) return;
      setWorkingBloquesDia((prev) => {
        const next = (prev || []).map((b) => ({ ...b }));
        const draggedIdx = next.findIndex((b) => Number(b.curso_horario_id) === Number(payload.cursoHorarioId));
        if (draggedIdx < 0) return prev;

        const targetIdx = next.findIndex(
          (b) =>
            Number(b.curso_horario_id) !== Number(payload.cursoHorarioId) &&
            Number(b.horario_id) === Number(horarioId) &&
            Number(b.aula_id) === Number(aulaId) &&
            Number(b.curso_horario_id) > 0
        );

        const sourceAulaId = payload.sourceAulaId == null ? null : Number(payload.sourceAulaId);
        if (targetIdx >= 0 && Number.isFinite(sourceAulaId) && sourceAulaId > 0) {
          next[targetIdx].aula_id = sourceAulaId;
          next[targetIdx].aula_codigo = next[draggedIdx].aula_codigo || null;
          next[targetIdx].aula_nombre = next[draggedIdx].aula_nombre || null;
          next[targetIdx].aula_categoria = next[draggedIdx].aula_categoria || null;
          next[targetIdx].aula_capacidad = next[draggedIdx].aula_capacidad || null;
        } else if (targetIdx >= 0) {
          return prev;
        }

        const aulaTarget = (aulas || []).find((a) => Number(a.id) === Number(aulaId));
        next[draggedIdx].aula_id = Number(aulaId);
        next[draggedIdx].aula_codigo = aulaTarget?.codigo || null;
        next[draggedIdx].aula_nombre = aulaTarget?.nombre || null;
        next[draggedIdx].aula_categoria = aulaTarget?.categoria || null;
        next[draggedIdx].aula_capacidad = aulaTarget?.capacidad || null;
        return next;
      });
    } catch {
      return;
    }
  };

  const onRemoveAsignacion = (cursoHorarioId) => {
    setWorkingBloquesDia((prev) =>
      (prev || []).map((b) =>
        Number(b.curso_horario_id) === Number(cursoHorarioId)
          ? {
            ...b,
            aula_id: null,
            aula_codigo: null,
            aula_nombre: null,
            aula_categoria: null,
            aula_capacidad: null,
          }
          : b
      )
    );
  };

  const handleCancelarEdicion = () => {
    setWorkingBloquesDia((originalBloquesDia || []).map((b) => ({ ...b })));
    setDragHorarioId(null);
    setModoVista('lectura');
  };

  const handleHabilitarEdicion = () => {
    const base = paraleloFocoId != null ? bloquesDiaFiltrados : bloquesDia;
    const snapshot = (base || []).map((b) => ({ ...b }));
    setWorkingBloquesDia(snapshot);
    setOriginalBloquesDia(snapshot);
    setModoVista('edicion');
  };

  const handleGuardarEdicion = async () => {
    const originalMap = new Map(
      (originalBloquesDia || [])
        .filter((b) => Number(b.curso_horario_id) > 0)
        .map((b) => [Number(b.curso_horario_id), b])
    );
    const changes = (workingBloquesDia || [])
      .filter((b) => Number(b.curso_horario_id) > 0)
      .filter((b) => {
        const original = originalMap.get(Number(b.curso_horario_id));
        if (!original) return false;
        return Number(original.aula_id || 0) !== Number(b.aula_id || 0);
      });

    if (!changes.length) {
      setModoVista('lectura');
      return;
    }

    const cambiosConAulaPrevia = changes.filter((b) => {
      const original = originalMap.get(Number(b.curso_horario_id));
      const originalAulaId = original?.aula_id == null ? null : Number(original.aula_id);
      const nextAulaId = b.aula_id == null ? null : Number(b.aula_id);
      return Number.isFinite(originalAulaId) && originalAulaId > 0 && originalAulaId !== nextAulaId;
    });

    setSavingDraft(true);
    try {
      // Fase 1: liberar aulas actuales para evitar conflictos transitorios en swaps.
      for (const change of cambiosConAulaPrevia) {
        await onAsignarAula(change.curso_horario_id, null);
      }

      // Fase 2: aplicar destino final (incluye desasignaciones definitivas y nuevas asignaciones).
      for (const change of changes) {
        await onAsignarAula(change.curso_horario_id, change.aula_id ?? null);
      }
      messageApi.success(
        changes.length === 1
          ? 'Asignación de aula guardada correctamente.'
          : `${changes.length} asignaciones de aula guardadas correctamente.`
      );
      setModoVista('lectura');
    } catch (err) {
      messageApi.error(err?.message || 'No se pudieron guardar los cambios. Revisa la consola o vuelve a intentar.');
    } finally {
      setSavingDraft(false);
    }
  };

  const mainRowClassName = [
    'horarios-aulas-asignar-root__main-row',
    esModoEdicion ? 'horarios-aulas-edicion-layout' : null,
    vistaExpandida ? 'horarios-aulas-asignar-root__main-row--expanded' : null,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={[
        'horarios-aulas-asignar-root',
        vistaExpandida ? 'horarios-aulas-asignar-root--fill' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {contextHolder}
      <Row gutter={[12, 12]} align="middle" justify="space-between" style={{ marginBottom: 12 }} className="horarios-aulas-asignar-root__toolbar">
        <Col>
          <Tabs
            activeKey={diaActivo}
            onChange={esModoEdicion ? undefined : setDiaActivo}
            items={DIAS.map((d) => ({ key: d, label: d, disabled: esModoEdicion }))}
          />
        </Col>
        <Col>
          {esModoEdicion ? null : (
            <AntButton type="primary" icon={<PlusOutlined />} onClick={handleHabilitarEdicion} disabled={!puedeEditar}>
              Habilitar edición
            </AntButton>
          )}
        </Col>
      </Row>

      <Row gutter={12} align="stretch" wrap={false} className={mainRowClassName}>
        {esModoEdicion ? (
          <Col flex="220px" className="horarios-aulas-edicion-layout__left-col">
            {paralelosDisponibles.length > 1 && (
              <FieldSelect
                value={filtroParalelo}
                onChange={(v) => setFiltroParalelo(v ?? 'all')}
                options={[
                  { value: 'all', label: 'Todos los paralelos' },
                  ...paralelosDisponibles,
                ]}
                size="middle"
                allowClear={false}
                style={{ width: '100%', marginBottom: 8 }}
                optionRender={(option) => (
                  <Flex vertical gap={2}>
                    <span>{option.label}</span>
                    {(option.data?.carrera || option.data?.periodo) ? (
                      <span style={{ fontSize: typography.fontSizeSM - 1, color: allColors.colorTextSecondary, lineHeight: 1.3 }}>
                        {[option.data.carrera, option.data.periodo].filter(Boolean).join(' · ')}
                      </span>
                    ) : null}
                  </Flex>
                )}
              />
            )}
            {sinAulaDiaOrdenados.length === 0 ? (
              <Alert
                type={sinAulaDiaBase.length === 0 ? 'success' : 'info'}
                showIcon
                message={
                  sinAulaDiaBase.length === 0
                    ? 'Todos los bloques del día tienen aula asignada.'
                    : 'No hay bloques sin aula para el paralelo seleccionado.'
                }
              />
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
        <Col flex="auto" className="horarios-aulas-edicion-layout__grid-col">
          <AulasAsignacionGrid
            aulas={aulas}
            rows={rows}
            bloques={bloquesDiaVista}
            puedeEditar={esModoEdicion}
            onDropAsignacion={onDropAsignacion}
            activeDragHorarioId={dragHorarioId}
            onSetActiveDragHorarioId={setDragHorarioId}
            onClearActiveDragHorarioId={() => setDragHorarioId(null)}
            onRemoveAsignacion={onRemoveAsignacion}
          />
        </Col>
      </Row>
      {esModoEdicion ? (
        <Flex
          justify="flex-end"
          gap={8}
          style={{ marginTop: 12 }}
          className="horarios-aulas-asignar-root__footer-actions"
        >
          <Button variant="default" onClick={handleCancelarEdicion} disabled={patchLoading || savingDraft}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleGuardarEdicion} disabled={patchLoading || savingDraft} loading={patchLoading || savingDraft}>
            Guardar cambios
          </Button>
        </Flex>
      ) : null}
    </div>
  );
};

export default GestionHorariosAulasAsignarSection;

