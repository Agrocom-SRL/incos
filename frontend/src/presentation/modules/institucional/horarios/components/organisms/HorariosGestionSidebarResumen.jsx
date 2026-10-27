import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppstoreOutlined, RightOutlined, TeamOutlined, TableOutlined, WarningOutlined } from '@ant-design/icons';
import { Card, Flex, Modal, Table, Tag, Typography } from 'antd';
import { ActionButton, Button } from '@atoms';
import { allSpacing, allColors, componentConfig, shadows, typography, gradients } from '@theme/tokens';
import { resolveCarreraDashboardColor } from '@application-institucional/horarios/utils/carreraDashboardColor';
import { BOARD_COLUMN_LABELS } from '@application-institucional/horarios/config/dashboardConstants';
import {
    buildOfertaParaleloDetalleFromHorarios,
    buildResolverConflictoDocenteNavTarget,
    docenteSoloConflictoAula,
    hintModalConflictoDocente,
    labelResolverConflictoDocente,
} from '@application-institucional/horarios/config/paths';
import { resolveHorariosBoardBucket } from '@application-institucional/horarios/utils/horariosBoardBucket';

const { Text, Title } = Typography;

const DIAS_ORDEN = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];

const fmtHora = (t) => (t == null ? '' : String(t).slice(0, 5));

/**
 * Comprime `lineasDetalle` del backend (una línea por franja) a pocas líneas por materia (primer token antes de " · ").
 */
const resumenLineasConflictoPorMateria = (lineasDetalle) => {
    const lineas = (lineasDetalle || []).map((l) => String(l).trim()).filter(Boolean);
    if (!lineas.length) return [];
    const counts = new Map();
    for (const line of lineas) {
        const sigla = line.split(' · ')[0]?.trim() || line;
        counts.set(sigla, (counts.get(sigla) || 0) + 1);
    }
    const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
    const maxBullets = 3;
    const out = sorted.slice(0, maxBullets).map(([sigla, n]) => `${sigla} · ${n} aviso(s)`);
    const rest = sorted.slice(maxBullets);
    if (rest.length > 0) {
        const otrosAvisos = rest.reduce((s, [, n]) => s + n, 0);
        out.push(`Otras materias (${rest.length}) · ${otrosAvisos} aviso(s)`);
    }
    return out;
};

/** Color de tag según grupo del tablero (`tablero_grupo` / `board_bucket` en API). */
const tableroGrupoColor = (p) => {
    const b = p?.boardBucket ?? resolveHorariosBoardBucket(p);
    if (b === 'completo') return 'success';
    if (b === 'sin_horarios') return 'error';
    if (b === 'sin_docentes') return 'warning';
    if (b === 'sin_aulas') return 'processing';
    return 'default';
};

const diaIndex = (dia) => {
    const i = DIAS_ORDEN.indexOf(String(dia || '').toUpperCase());
    return i >= 0 ? i : 99;
};

/**
 * Sidebar gestión de horarios: tarjetas tipo dashboard; el detalle abre en modal.
 */
const HorariosGestionSidebarResumen = ({
    filteredParallels = [],
    bloquesSinAulaPorParalelo = [],
    cursosSinDocentePorParalelo = [],
    docentesConConflictosOperativos = [],
}) => {
    const navigate = useNavigate();
    const [modal, setModal] = useState({ open: false, kind: null });
    const [aulasDiaFiltroPreferido, setAulasDiaFiltroPreferido] = useState(null);

    const pgIdByParaleloMaestro = useMemo(() => {
        const m = new Map();
        (filteredParallels || []).forEach((p) => {
            const pid = Number(p.id);
            const pg = Number(p.paraleloGestionId);
            if (Number.isFinite(pid) && pid > 0 && Number.isFinite(pg) && pg > 0) {
                m.set(pid, pg);
            }
        });
        return m;
    }, [filteredParallels]);

    const counts = useMemo(() => {
        const paralelos = (filteredParallels || []).length;
        const turnosUnicos = new Set((filteredParallels || []).map((p) => p.turno).filter(Boolean)).size;
        let bloques = 0;
        (bloquesSinAulaPorParalelo || []).forEach((g) => {
            if (Array.isArray(g.items)) bloques += g.items.length;
        });
        let cursos = 0;
        (cursosSinDocentePorParalelo || []).forEach((g) => {
            if (Array.isArray(g.items)) cursos += g.items.length;
        });
        const docentesConflictos = (docentesConConflictosOperativos || []).filter((d) => d?.docenteId != null).length;
        return { paralelos, turnosUnicos, bloques, cursos, docentesConflictos };
    }, [filteredParallels, bloquesSinAulaPorParalelo, cursosSinDocentePorParalelo, docentesConConflictosOperativos]);

    /** Árbol: turno → carrera → periodo → paralelos */
    const arbolTurnos = useMemo(() => {
        const byTurno = new Map();
        (filteredParallels || []).forEach((p) => {
            const turno = p.turno || 'Sin turno';
            if (!byTurno.has(turno)) byTurno.set(turno, new Map());
            const carreraNombre = p.carrera || 'Sin carrera';
            const carreras = byTurno.get(turno);
            if (!carreras.has(carreraNombre)) {
                carreras.set(carreraNombre, {
                    carreraNombre,
                    carreraId: p.carreraId,
                    carreraColorHex: p.carreraColorHex,
                    byPeriodo: new Map(),
                });
            }
            const node = carreras.get(carreraNombre);
            const periodo = p.periodo || '—';
            if (!node.byPeriodo.has(periodo)) node.byPeriodo.set(periodo, []);
            node.byPeriodo.get(periodo).push(p);
        });
        return [...byTurno.entries()]
            .sort((a, b) => String(a[0]).localeCompare(String(b[0])))
            .map(([turno, carrerasMap]) => ({
                turno,
                carreras: [...carrerasMap.values()]
                    .sort((a, b) => String(a.carreraNombre).localeCompare(String(b.carreraNombre)))
                    .map((c) => ({
                        ...c,
                        periodos: [...c.byPeriodo.entries()]
                            .sort(([pa], [pb]) => String(pa).localeCompare(String(pb)))
                            .map(([periodo, paralelos]) => ({
                                periodo,
                                paralelos: [...paralelos].sort((x, y) =>
                                    String(x.paralelo || '').localeCompare(String(y.paralelo || '')),
                                ),
                            })),
                    })),
            }));
    }, [filteredParallels]);

    const tablaBloquesRows = useMemo(() => {
        const rows = [];
        (bloquesSinAulaPorParalelo || []).forEach((g) => {
            (g.items || []).forEach((it, idx) => {
                rows.push({
                    key: `${g.paraleloId}-${it.cursoCodigo || it.materiaSigla || idx}-${idx}`,
                    paraleloEtiqueta: `${g.paraleloNombre || `Paralelo #${g.paraleloId}`}${g.paraleloTurno ? ` · ${g.paraleloTurno}` : ''}`,
                    materia: it.materiaSigla || it.materiaNombre || it.cursoCodigo || '—',
                    dia: it.dia || '—',
                    hora: `${fmtHora(it.horaInicio)}–${fmtHora(it.horaFin)}`,
                });
            });
        });
        rows.sort(
            (a, b) =>
                diaIndex(a.dia) - diaIndex(b.dia) ||
                String(a.hora || '').localeCompare(String(b.hora || '')) ||
                String(a.paraleloEtiqueta).localeCompare(String(b.paraleloEtiqueta)),
        );
        return rows;
    }, [bloquesSinAulaPorParalelo]);

    const diasUnicosBloques = useMemo(() => {
        const s = new Set(tablaBloquesRows.map((r) => r.dia).filter((d) => d && d !== '—'));
        return DIAS_ORDEN.filter((d) => s.has(d));
    }, [tablaBloquesRows]);

    const aulasDiaFiltro = useMemo(() => {
        if (!modal.open || modal.kind !== 'aulas') return null;
        if (!diasUnicosBloques.length) return null;
        if (aulasDiaFiltroPreferido && diasUnicosBloques.includes(aulasDiaFiltroPreferido)) {
            return aulasDiaFiltroPreferido;
        }
        return diasUnicosBloques[0];
    }, [modal.open, modal.kind, diasUnicosBloques, aulasDiaFiltroPreferido]);

    const tablaBloquesFiltrada = useMemo(() => {
        if (!aulasDiaFiltro) return tablaBloquesRows;
        return tablaBloquesRows.filter((r) => r.dia === aulasDiaFiltro);
    }, [tablaBloquesRows, aulasDiaFiltro]);

    const docenteListItems = useMemo(() => {
        const rows = [];
        (cursosSinDocentePorParalelo || []).forEach((g) => {
            (g.items || []).forEach((it, idx) => {
                if (it.cursoId == null) return;
                const hex = resolveCarreraDashboardColor({
                    carreraId: g.carreraId,
                    carreraNombre: g.carreraNombre,
                });
                const pgId = pgIdByParaleloMaestro.get(Number(g.paraleloId)) ?? null;
                rows.push({
                    key: `d-${g.paraleloId}-${it.cursoId}-${idx}`,
                    carreraNombre: g.carreraNombre || '—',
                    periodoNombre: g.periodoNombre || '—',
                    paraleloNombre: g.paraleloNombre || `Paralelo #${g.paraleloId}`,
                    paraleloTurno: g.paraleloTurno || '',
                    paraleloId: g.paraleloId,
                    paraleloGestionId: pgId,
                    cursoId: it.cursoId,
                    materiaLabel: it.materiaNombre || it.cursoCodigo || 'Curso',
                    carreraColor: hex || allColors.colorPrimary,
                });
            });
        });
        return rows;
    }, [cursosSinDocentePorParalelo, pgIdByParaleloMaestro]);

    const openKind = (kind) => setModal({ open: true, kind });
    const close = () => {
        setModal({ open: false, kind: null });
        setAulasDiaFiltroPreferido(null);
    };

    const modalTitle =
        modal.kind === 'paralelos'
            ? 'Paralelos por turno'
            : modal.kind === 'aulas'
                ? 'Bloques sin aula'
                : modal.kind === 'docentes'
                    ? 'Cursos sin docente asignado'
                    : modal.kind === 'conflictos'
                        ? 'Docentes con conflictos operativos'
                        : '';

    const bloquesColumns = useMemo(
        () => [
            { title: 'Día', dataIndex: 'dia', key: 'dia', width: 100 },
            { title: 'Horario', dataIndex: 'hora', key: 'hora', width: 120 },
            { title: 'Paralelo', dataIndex: 'paraleloEtiqueta', key: 'paraleloEtiqueta', ellipsis: true },
            { title: 'Materia', dataIndex: 'materia', key: 'materia', ellipsis: true },
        ],
        [],
    );

    const resumenStatCard = (kind, { gradient, icon, etiqueta, titulo, valor, detalle }) => (
        <Card
            key={kind}
            role="button"
            tabIndex={0}
            hoverable
            onClick={() => openKind(kind)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openKind(kind);
                }
            }}
            className="horarios-sidebar-resumen-stat"
            style={{
                background: gradient,
                borderRadius: `${componentConfig.Card.borderRadiusLG}px`,
                boxShadow: shadows.shadowPrimary,
                border: 'none',
                cursor: 'pointer',
            }}
        >
            <Flex vertical style={{ minWidth: 0, position: 'relative' }}>
                <Flex justify="space-between" align="flex-start" wrap="nowrap">
                    <Text
                        style={{
                            color: allColors.colorTextSecondaryOnDark,
                            fontSize: `${typography.fontSizeSM}px`,
                            margin: 0,
                            letterSpacing: '0.02em',
                            textTransform: 'uppercase',
                        }}
                    >
                        {etiqueta}
                    </Text>
                    <span style={{ color: allColors.colorTextOnDark, fontSize: 22, opacity: 0.95 }} aria-hidden>
                        {icon}
                    </span>
                </Flex>
                <Title
                    level={3}
                    style={{
                        color: allColors.colorTextOnDark,
                        fontSize: 36,
                        fontWeight: typography.fontWeightStrong,
                        margin: 0,
                        lineHeight: 1.1,
                    }}
                >
                    {valor}
                </Title>
                <Title
                    level={5}
                    style={{
                        color: allColors.colorTextOnDark,
                        fontSize: `${typography.fontSizeHeading5}px`,
                        fontWeight: typography.fontWeightStrong,
                        margin: 0,
                        lineHeight: 1.35,
                    }}
                >
                    {titulo}
                </Title>
                <Text style={{ color: allColors.colorTextTertiaryOnDark, fontSize: typography.fontSizeSM }}>
                    {detalle}
                </Text>
                <Flex justify="flex-end" align="center" style={{ marginTop: 4 }}>
                    <Text style={{ color: allColors.colorTextSecondaryOnDark, fontSize: typography.fontSizeSM }}>
                        Ver detalle <RightOutlined style={{ fontSize: 12 }} aria-hidden />
                    </Text>
                </Flex>
            </Flex>
        </Card>
    );

    return (
        <Flex vertical gap={allSpacing.marginMD} style={{ width: '100%', minWidth: 0 }}>
            {counts.paralelos > 0 && resumenStatCard('paralelos', {
                gradient: gradients.gradientPrimary,
                icon: <AppstoreOutlined />,
                etiqueta: 'Planificación',
                valor: counts.paralelos,
                titulo: 'Paralelos por turno',
                detalle: `${counts.turnosUnicos} turno(s) distintos con los filtros actuales`,
            })}
            {counts.bloques > 0 && resumenStatCard('aulas', {
                gradient: gradients.gradientWarning,
                icon: <TableOutlined />,
                etiqueta: 'Aulas',
                valor: counts.bloques,
                titulo: 'Bloques sin aula',
                detalle: 'Franjas con aula pendiente de asignación',
            })}
            {counts.cursos > 0 && resumenStatCard('docentes', {
                gradient: gradients.gradientInfo,
                icon: <TeamOutlined />,
                etiqueta: 'Docencia',
                valor: counts.cursos,
                titulo: 'Cursos sin docente',
                detalle: 'Materias sin asignación docente vigente',
            })}
            {counts.docentesConflictos > 0 && resumenStatCard('conflictos', {
                gradient: gradients.gradientError,
                icon: <WarningOutlined />,
                etiqueta: 'Alertas',
                valor: counts.docentesConflictos,
                titulo: 'Docentes con conflictos',
                detalle: 'Choque de franja, aula o asignación duplicada al mismo curso',
            })}

            <Modal
                title={modalTitle}
                open={modal.open}
                onCancel={close}
                width={Math.min(920, typeof window !== 'undefined' ? window.innerWidth - 32 : 920)}
                footer={[
                    <Button key="close" onClick={close}>
                        Cerrar
                    </Button>,
                ]}
                destroyOnHidden
            >
                {modal.kind === 'paralelos' ? (
                    <Flex vertical gap={allSpacing.marginMD} style={{ minWidth: 0 }}>
                        <Text type="secondary" style={{ fontSize: typography.fontSizeSM }}>
                            Estructura por turno, carrera, periodo y paralelo (estado).
                        </Text>
                        {arbolTurnos.length === 0 ? (
                            <Text type="secondary">No hay paralelos con los filtros actuales.</Text>
                        ) : (
                            <div className="horarios-sidebar-modal-tree">
                                {arbolTurnos.map((nTurno) => (
                                    <div key={nTurno.turno} className="horarios-sidebar-modal-tree__nodo">
                                        <Text strong className="horarios-sidebar-modal-tree__raiz">
                                            Turno {nTurno.turno}
                                        </Text>
                                        {nTurno.carreras.map((c) => {
                                            const colorHex = resolveCarreraDashboardColor({
                                                carreraId: c.carreraId,
                                                carreraNombre: c.carreraNombre,
                                                carreraColorHex: c.carreraColorHex,
                                            });
                                            return (
                                                <div key={c.carreraNombre} className="horarios-sidebar-modal-tree__rama">
                                                    <Text
                                                        strong
                                                        className="horarios-sidebar-modal-tree__carrera"
                                                        style={{ color: colorHex || allColors.colorPrimary }}
                                                    >
                                                        {c.carreraNombre}
                                                    </Text>
                                                    {c.periodos.map((pe) => (
                                                        <div
                                                            key={`${c.carreraNombre}-${pe.periodo}`}
                                                            className="horarios-sidebar-modal-tree__subrama"
                                                        >
                                                            <Text type="secondary" className="horarios-sidebar-modal-tree__periodo">
                                                                {pe.periodo}
                                                            </Text>
                                                            <Flex vertical gap={6} className="horarios-sidebar-modal-tree__hojas">
                                                                {pe.paralelos.map((p) => (
                                                                    <Flex
                                                                        key={p.id}
                                                                        justify="space-between"
                                                                        align="center"
                                                                        gap={8}
                                                                        wrap="wrap"
                                                                        className="horarios-sidebar-modal-tree__fila"
                                                                    >
                                                                        <Text style={{ flex: '1 1 120px', minWidth: 0 }} ellipsis>
                                                                            {p.paralelo}
                                                                        </Text>
                                                                        <Tag
                                                                            color={tableroGrupoColor(p)}
                                                                            style={{ margin: 0, flexShrink: 0 }}
                                                                        >
                                                                            {BOARD_COLUMN_LABELS[
                                                                                p.boardBucket ?? resolveHorariosBoardBucket(p)
                                                                            ] || '—'}
                                                                        </Tag>
                                                                    </Flex>
                                                                ))}
                                                            </Flex>
                                                        </div>
                                                    ))}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        )}
                    </Flex>
                ) : null}

                {modal.kind === 'aulas' ? (
                    <Flex vertical gap={allSpacing.marginMD} style={{ minWidth: 0 }}>
                        <Text type="secondary" style={{ fontSize: typography.fontSizeSM }}>
                            El aula base se asigna en Institucional → Oferta académica (paralelo de gestión), no por bloque
                            de horario.
                        </Text>
                        {tablaBloquesRows.length === 0 ? (
                            <Text type="secondary">No hay bloques sin aula para mostrar.</Text>
                        ) : (
                            <>
                                <div className="horarios-sidebar-modal-dia-tabs" role="tablist" aria-label="Filtrar por día">
                                    {diasUnicosBloques.map((dia) => (
                                        <button
                                            key={dia}
                                            type="button"
                                            role="tab"
                                            aria-selected={aulasDiaFiltro === dia}
                                            className={[
                                                'horarios-sidebar-modal-dia-tabs__btn',
                                                aulasDiaFiltro === dia ? 'horarios-sidebar-modal-dia-tabs__btn--active' : '',
                                            ]
                                                .filter(Boolean)
                                                .join(' ')}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setAulasDiaFiltroPreferido(dia);
                                            }}
                                        >
                                            {dia}
                                        </button>
                                    ))}
                                </div>
                                <Table
                                    size="small"
                                    pagination={{ pageSize: 14, showSizeChanger: false }}
                                    columns={bloquesColumns}
                                    dataSource={tablaBloquesFiltrada}
                                    scroll={{ x: 'max-content' }}
                                />
                                <Flex vertical gap={8}>
                                    <ActionButton
                                        permiso="institucional.oferta.paralelo-gestion"
                                        accion="EDITAR"
                                        variant="primary"
                                        size="large"
                                        block
                                        onClick={() => {
                                            navigate('/institucional/oferta');
                                            close();
                                        }}
                                    >
                                        Ir a Oferta académica
                                    </ActionButton>
                                    <Text type="secondary" style={{ fontSize: typography.fontSizeSM }}>
                                        Asigne el aula base en cada paralelo de gestión antes de armar horarios.
                                    </Text>
                                </Flex>
                            </>
                        )}
                    </Flex>
                ) : null}

                {modal.kind === 'docentes' ? (
                    <Flex vertical gap={allSpacing.marginMD} style={{ minWidth: 0 }}>
                        <Text type="secondary" style={{ fontSize: typography.fontSizeSM }}>
                            Cada fila enlaza al armado del paralelo para asignar docente a esa materia.
                        </Text>
                        <Text strong>Cursos sin docente</Text>
                        {docenteListItems.length === 0 ? (
                            <Text type="secondary">No hay cursos sin docente.</Text>
                        ) : (
                            <Flex
                                vertical
                                className="horarios-sidebar-modal-docentes-list"
                                style={{
                                    border: `1px solid ${allColors.colorBorder}`,
                                    borderRadius: `${componentConfig.borderRadiusLG}px`,
                                    overflow: 'hidden',
                                }}
                            >
                                {docenteListItems.map((row, idx) => (
                                    <Flex
                                        key={row.key}
                                        align="flex-start"
                                        justify="space-between"
                                        gap={12}
                                        wrap="wrap"
                                        className="horarios-sidebar-modal-docentes-list__row"
                                        style={{
                                            padding: `${allSpacing.paddingSM}px ${allSpacing.padding}px`,
                                            borderTop: idx > 0 ? `1px solid ${allColors.colorBorder}` : undefined,
                                            backgroundColor: allColors.colorBgContainer,
                                        }}
                                    >
                                        <Flex vertical gap={2} style={{ flex: '1 1 200px', minWidth: 0 }}>
                                            <Text
                                                strong
                                                className="horarios-sidebar-modal-docentes-list__title"
                                                style={{ color: row.carreraColor }}
                                            >
                                                {row.carreraNombre}
                                            </Text>
                                            <Text type="secondary" style={{ fontSize: typography.fontSizeSM }}>
                                                Periodo: {row.periodoNombre}
                                            </Text><Text type="secondary" style={{ fontSize: typography.fontSizeSM }}>
                                                Paralelo: {row.paraleloNombre} - {row.paraleloTurno}
                                            </Text>
                                            <Text strong style={{ color: 'var(--color-primary)', fontSize: typography.fontSizeSM }}>
                                                Materia: {row.materiaLabel }
                                            </Text>
                                        </Flex>
                                        <ActionButton
                                            permiso="institucional.horario.armado"
                                            accion="EDITAR"
                                            variant="success"
                                            icon={<TeamOutlined />}
                                            style={{ flexShrink: 0 }}
                                            onClick={() => {
                                                const pg = row.paraleloGestionId;
                                                if (!pg) return;
                                                const target = buildOfertaParaleloDetalleFromHorarios(pg, {
                                                    ofertaCursoId: row.cursoId,
                                                });
                                                navigate(
                                                    target.pathname,
                                                    target.state ? { state: target.state } : undefined,
                                                );
                                                close();
                                            }}
                                            disabled={!row.paraleloGestionId}
                                        >
                                            Asignar materia
                                        </ActionButton>
                                    </Flex>
                                ))}
                            </Flex>
                        )}
                    </Flex>
                ) : null}

                {modal.kind === 'conflictos' ? (
                    <Flex vertical gap={allSpacing.marginMD} style={{ minWidth: 0 }}>
                        <Text type="secondary" style={{ fontSize: typography.fontSizeSM }}>
                            {docentesConConflictosOperativos.some((d) => !docenteSoloConflictoAula(d))
                                ? hintModalConflictoDocente({ tiposConflicto: ['horario'] })
                                : hintModalConflictoDocente(docentesConConflictosOperativos[0] || {})}
                        </Text>
                        {!docentesConConflictosOperativos.length ? (
                            <Text type="secondary">No hay docentes con conflictos operativos.</Text>
                        ) : (
                            <Flex
                                vertical
                                className="horarios-sidebar-modal-docentes-list"
                                style={{
                                    border: `1px solid ${allColors.colorBorder}`,
                                    borderRadius: `${componentConfig.borderRadiusLG}px`,
                                    overflow: 'hidden',
                                }}
                            >
                                {docentesConConflictosOperativos.map((d, idx) => {
                                    const bullets = resumenLineasConflictoPorMateria(d.lineasDetalle);
                                    return (
                                        <Flex
                                            key={`dc-${d.docenteId}-${idx}`}
                                            align="flex-start"
                                            justify="space-between"
                                            gap={12}
                                            wrap="wrap"
                                            className="horarios-sidebar-modal-docentes-list__row"
                                            style={{
                                                padding: `${allSpacing.paddingSM}px ${allSpacing.padding}px`,
                                                borderTop: idx > 0 ? `1px solid ${allColors.colorBorder}` : undefined,
                                                backgroundColor: allColors.colorBgContainer,
                                            }}
                                        >
                                            <Flex vertical gap={6} style={{ flex: '1 1 220px', minWidth: 0 }}>
                                                <Text strong>{d.docenteNombre || `Docente #${d.docenteId}`}</Text>
                                                {bullets.length ? (
                                                    <Flex vertical gap={2}>
                                                        {bullets.map((line, li) => (
                                                            <Text
                                                                key={`${d.docenteId}-dl-${li}`}
                                                                type="secondary"
                                                                style={{
                                                                    fontSize: typography.fontSizeSM,
                                                                    lineHeight: 1.45,
                                                                }}
                                                            >
                                                                {line}
                                                            </Text>
                                                        ))}
                                                    </Flex>
                                                ) : (
                                                    <Text type="secondary" style={{ fontSize: typography.fontSizeSM }}>
                                                        Sin resumen disponible.
                                                    </Text>
                                                )}
                                            </Flex>
                                            <ActionButton
                                                permiso="institucional.horario.armado"
                                                accion="EDITAR"
                                                variant="error"
                                                style={{ flexShrink: 0 }}
                                                disabled={d.docenteId == null}
                                                onClick={() => {
                                                    const target = buildResolverConflictoDocenteNavTarget(d);
                                                    const to = target.search
                                                        ? `${target.pathname}${target.search}`
                                                        : target.pathname;
                                                    navigate(to, target.state ? { state: target.state } : undefined);
                                                    close();
                                                }}
                                            >
                                                {labelResolverConflictoDocente(d)}
                                            </ActionButton>
                                        </Flex>
                                    );
                                })}
                            </Flex>
                        )}
                    </Flex>
                ) : null}
            </Modal>
        </Flex>
    );
};

export default HorariosGestionSidebarResumen;
