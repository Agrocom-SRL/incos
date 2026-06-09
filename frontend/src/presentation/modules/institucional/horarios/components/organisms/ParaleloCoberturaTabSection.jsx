import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Col, Divider, Flex, Row, Typography } from 'antd';
import { SyncOutlined, ThunderboltOutlined, TeamOutlined } from '@ant-design/icons';
import { Card, ActionButton, StatusPill } from '@atoms';
import { ofertaPaths } from '@application-institucional/oferta/config/paths';
import {
    buildHorariosConflictosUrl,
    buildOfertaParaleloDetalleFromHorarios,
    HORARIOS_MENU_ROUTE_KEY,
} from '@application-institucional/horarios/config/paths';
import { bloquesRequeridosPorCarga } from '@application-institucional/horarios/utils/generarBloquesAutomaticosCurso';
import { indexCoberturaPorAsignacion } from '@application-institucional/horarios/utils/indexCoberturaPorAsignacion';
import { resolveHorasPlanSemanalCurso } from '@application-institucional/horarios/utils/resolveHorasPlanSemanalCurso';
import { resumenBloquesCurso } from '@application-institucional/horarios/utils/resumenBloquesCurso';

const { Text } = Typography;

const ParaleloCoberturaTabSection = ({
    draftSchedules,
    paraleloGestionId,
    coberturaGrilla = null,
    horarioEditable = true,
    coberturaReajustable = true,
    onGenerarBloquesCurso,
    onReajustarBloquesCurso,
}) => {
    const navigate = useNavigate();
    const pgId = Number(paraleloGestionId);
    const [generandoCursoId, setGenerandoCursoId] = useState(null);
    const [reajustandoCursoId, setReajustandoCursoId] = useState(null);

    const coberturaPorAsignacion = useMemo(
        () => indexCoberturaPorAsignacion(coberturaGrilla),
        [coberturaGrilla],
    );

    const irAOferta = useCallback(() => {
        if (!Number.isFinite(pgId) || pgId < 1) return;
        const target = buildOfertaParaleloDetalleFromHorarios(pgId);
        navigate(target.pathname, target.state ? { state: target.state } : undefined);
    }, [navigate, pgId]);

    const returnArmadoCoberturaPath =
        Number.isFinite(pgId) && pgId > 0
            ? `/institucional/horarios/armado?pg=${pgId}&tab=cobertura`
            : '/institucional/horarios/armado';

    const irAConflictosDocente = useCallback(
        (docenteId) => {
            const id = Number(docenteId);
            if (!Number.isFinite(id) || id < 1) return;
            navigate(buildHorariosConflictosUrl(id), {
                state: {
                    returnListPath: returnArmadoCoberturaPath,
                    menuSidebarKey: HORARIOS_MENU_ROUTE_KEY,
                },
            });
        },
        [navigate, returnArmadoCoberturaPath],
    );

    const irADocenteAsignaciones = useCallback(
        (docenteId) => {
            const id = Number(docenteId);
            if (!Number.isFinite(id) || id < 1) return;
            navigate(ofertaPaths.docenteAsignaciones(id), {
                state: {
                    returnListPath: returnArmadoCoberturaPath,
                    menuSidebarKey: HORARIOS_MENU_ROUTE_KEY,
                },
            });
        },
        [navigate, returnArmadoCoberturaPath],
    );

    const handleGenerar = useCallback(
        async (cursoId, horasPlan) => {
            if (typeof onGenerarBloquesCurso !== 'function') return;
            setGenerandoCursoId(cursoId);
            try {
                await onGenerarBloquesCurso(cursoId, horasPlan);
            } finally {
                setGenerandoCursoId(null);
            }
        },
        [onGenerarBloquesCurso],
    );

    const handleReajustar = useCallback(
        async (cursoId, horasPlan) => {
            if (typeof onReajustarBloquesCurso !== 'function') return;
            setReajustandoCursoId(cursoId);
            try {
                await onReajustarBloquesCurso(cursoId, horasPlan);
            } finally {
                setReajustandoCursoId(null);
            }
        },
        [onReajustarBloquesCurso],
    );

    if (!draftSchedules.length) {
        return (
            <Flex vertical gap={8} align="flex-start">
                <Text type="secondary">
                    No hay cursos de oferta para este paralelo. Completá la oferta académica antes de
                    armar bloques horarios.
                </Text>
                {Number.isFinite(pgId) && pgId > 0 ? (
                    <ActionButton
                        permiso="institucional.oferta.paralelo-gestion"
                        accion="DETALLE"
                        variant="primary"
                        size="small"
                        onClick={irAOferta}
                    >
                        Ir a oferta académica
                    </ActionButton>
                ) : null}
            </Flex>
        );
    }

    return (
        <Row gutter={[12, 12]}>
            {draftSchedules.map((c) => {
                const titulo = c.materiaNombre || c.materiaSigla || 'Materia sin nombre';
                const adId = Number(c.asignacionDocenteId);
                const cobRow = Number.isFinite(adId) ? coberturaPorAsignacion.get(adId) : null;
                const horasPlan = resolveHorasPlanSemanalCurso(c, cobRow);
                const courseForResumen =
                    horasPlan != null && c.horasSemanalesPlan == null
                        ? { ...c, horasSemanalesPlan: horasPlan }
                        : c;
                const { horasGrilla, horasPlan: horasPlanResumen, diasOrd, lineas } =
                    resumenBloquesCurso(courseForResumen);
                const horasPlanEfectivo = horasPlan ?? horasPlanResumen;
                const bloquesReq = bloquesRequeridosPorCarga(horasPlanEfectivo);
                const bloquesActuales = c.bloques?.length ?? 0;
                const bloquesFaltantes = Math.max(0, bloquesReq - bloquesActuales);
                const bloquesExcedentes = Math.max(0, bloquesActuales - bloquesReq);
                const sinDocente = !c.docente;
                const docenteEnConflictoHorario = Boolean(c.docenteEnConflictoHorario);
                const coberturaExacta = bloquesReq > 0 && bloquesActuales === bloquesReq;
                const coberturaDesajustada = bloquesReq > 0 && bloquesActuales !== bloquesReq;
                const puedeReajustar =
                    !sinDocente && coberturaReajustable && coberturaDesajustada;
                const puedeGenerar =
                    !sinDocente && horarioEditable && bloquesFaltantes > 0 && !puedeReajustar;
                const generando = Number(generandoCursoId) === Number(c.cursoId);
                const reajustando = Number(reajustandoCursoId) === Number(c.cursoId);

                const cardExtra = sinDocente ? (
                    <ActionButton
                        permiso="institucional.oferta.paralelo-gestion"
                        accion="DETALLE"
                        variant="primary"
                        size="small"
                        icon={<TeamOutlined />}
                        onClick={irAOferta}
                    >
                        Asignar docente
                    </ActionButton>
                ) : puedeReajustar ? (
                    <ActionButton
                        permiso="institucional.horario.armado"
                        accion="EDITAR"
                        variant="primary"
                        size="small"
                        icon={<SyncOutlined />}
                        loading={reajustando}
                        onClick={() => handleReajustar(c.cursoId, horasPlanEfectivo)}
                    >
                        Reajustar cobertura
                    </ActionButton>
                ) : puedeGenerar ? (
                    <ActionButton
                        permiso="institucional.horario.armado"
                        accion="EDITAR"
                        variant="primary"
                        size="small"
                        icon={<ThunderboltOutlined />}
                        loading={generando}
                        onClick={() => handleGenerar(c.cursoId, horasPlanEfectivo)}
                    >
                        Generar horarios
                    </ActionButton>
                ) : coberturaExacta ? (
                    <StatusPill
                        label={"Cobertura completa"}
                        className={"cfg-materia-pill cfg-materia-pill--activa"}
                    />
                ) : null;

                return (
                    <Col key={c.cursoId} xs={24} lg={12}>
                        <Card
                            variant="default"
                            shadow={true}
                            headerColor="primary"
                            headerAccentHex={c.cursoColorHex}
                            title={titulo}
                            extra={cardExtra}
                        >
                            <Flex vertical gap={6}>
                                {c.materiaSigla ? (
                                    <Text type="secondary">
                                        Sigla: <Text strong>{c.materiaSigla}</Text>
                                    </Text>
                                ) : null}
                                <Text type="secondary">
                                    Docente:{' '}
                                    {docenteEnConflictoHorario && c.docenteId ? (
                                        <>
                                            <Typography.Link
                                                className="horarios-armado-cobertura-docente-link"
                                                onClick={() => irAConflictosDocente(c.docenteId)}
                                            >
                                                <Text strong type="danger">
                                                    {c.docente}
                                                </Text>
                                            </Typography.Link>
                                            <Text type="danger" style={{ marginLeft: 8 }}>
                                                (choque de horario — resolver)
                                            </Text>
                                        </>
                                    ) : c.docenteId ? (
                                        <>
                                            <Typography.Link
                                                className="horarios-armado-cobertura-docente-link"
                                                onClick={() => irADocenteAsignaciones(c.docenteId)}
                                            >
                                                <Text strong>{c.docente}</Text>
                                            </Typography.Link>
                                        </>
                                    ) : (
                                        <Text strong>{c.docente || 'Sin asignar'}</Text>
                                    )}
                                </Text>
                                <Text type="secondary">
                                    Carga horaria (plan):{' '}
                                    <Text strong>
                                        {horasPlanEfectivo != null && !Number.isNaN(horasPlanEfectivo)
                                            ? `${horasPlanEfectivo} h/semana`
                                            : '—'}
                                    </Text>
                                    {bloquesReq > 0 ? (
                                        <>
                                            {' '}
                                            · <Text strong>{bloquesReq}</Text> bloque(s) de 45 min
                                        </>
                                    ) : null}
                                </Text>
                                <Text type="secondary">
                                    Horas en la grilla: <Text strong>{horasGrilla} h</Text> (
                                    {c.bloques?.length ?? 0} bloques
                                    {cobRow?.bloquesAsignados != null
                                        ? ` · ${cobRow.bloquesAsignados} persistidos`
                                        : ''}
                                    )
                                </Text>
                                {bloquesFaltantes > 0 ? (
                                    <Text type="secondary">
                                        Pendiente:{' '}
                                        <Text strong type="warning">
                                            {bloquesFaltantes} bloque(s) por generar
                                        </Text>
                                    </Text>
                                ) : null}
                                {bloquesExcedentes > 0 ? (
                                    <Text type="secondary">
                                        Excedente:{' '}
                                        <Text strong type="danger">
                                            {bloquesExcedentes} bloque(s) sobre el plan
                                        </Text>
                                    </Text>
                                ) : null}
                                <Text type="secondary">
                                    Días con clase:{' '}
                                    <Text strong>{diasOrd.length ? diasOrd.join(', ') : '—'}</Text>
                                </Text>
                                {lineas.length ? (
                                    <>
                                        <Divider plain style={{ margin: '8px 0' }} />
                                        <Text strong>Detalle por día / horario</Text>
                                        <ul className="horarios-armado-cursos__lista">
                                            {lineas.map((ln, idx) => (
                                                <li key={`${c.cursoId}-${idx}`}>
                                                    <Text type="secondary">{ln}</Text>
                                                </li>
                                            ))}
                                        </ul>
                                    </>
                                ) : null}
                            </Flex>
                        </Card>
                    </Col>
                );
            })}
        </Row>
    );
};

export default ParaleloCoberturaTabSection;
