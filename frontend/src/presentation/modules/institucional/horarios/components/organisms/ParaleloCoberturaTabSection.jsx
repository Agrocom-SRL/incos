import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Col, Divider, Flex, Row, Tag, Typography } from 'antd';
import { ThunderboltOutlined, TeamOutlined } from '@ant-design/icons';
import { Card, ActionButton } from '@atoms';
import { buildOfertaParaleloDetalleFromHorarios } from '@application-institucional/horarios/config/paths';
import { bloquesRequeridosPorCarga } from '@application-institucional/horarios/utils/generarBloquesAutomaticosCurso';
import { indexCoberturaPorAsignacion } from '@application-institucional/horarios/utils/indexCoberturaPorAsignacion';
import { resumenBloquesCurso } from '@application-institucional/horarios/utils/resumenBloquesCurso';

const { Text } = Typography;

const ParaleloCoberturaTabSection = ({
    draftSchedules,
    paraleloGestionId,
    coberturaGrilla = null,
    horarioEditable = true,
    onGenerarBloquesCurso,
}) => {
    const navigate = useNavigate();
    const pgId = Number(paraleloGestionId);
    const [generandoCursoId, setGenerandoCursoId] = useState(null);

    const coberturaPorAsignacion = useMemo(
        () => indexCoberturaPorAsignacion(coberturaGrilla),
        [coberturaGrilla],
    );

    const irAOferta = useCallback(() => {
        if (!Number.isFinite(pgId) || pgId < 1) return;
        const target = buildOfertaParaleloDetalleFromHorarios(pgId);
        navigate(target.pathname, target.state ? { state: target.state } : undefined);
    }, [navigate, pgId]);

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
                const horasPlanFromCobertura =
                    cobRow?.horasRequeridas != null && cobRow.horasRequeridas > 0
                        ? cobRow.horasRequeridas
                        : null;
                const horasPlan =
                    horasPlanFromCobertura ??
                    (c.horasSemanalesPlan != null ? Number(c.horasSemanalesPlan) : null);
                const courseForResumen =
                    horasPlanFromCobertura != null && c.horasSemanalesPlan == null
                        ? { ...c, horasSemanalesPlan: horasPlanFromCobertura }
                        : c;
                const { horasGrilla, horasPlan: horasPlanResumen, diasOrd, lineas } =
                    resumenBloquesCurso(courseForResumen);
                const horasPlanEfectivo = horasPlan ?? horasPlanResumen;
                const bloquesReq = bloquesRequeridosPorCarga(horasPlanEfectivo);
                const bloquesActuales = c.bloques?.length ?? 0;
                const bloquesFaltantes = Math.max(0, bloquesReq - bloquesActuales);
                const sinDocente = !c.docente;
                const docenteEnConflictoHorario = Boolean(c.docenteEnConflictoHorario);
                const coberturaCompleta =
                    horasPlanEfectivo != null &&
                    horasPlanEfectivo > 0 &&
                    horasGrilla >= horasPlanEfectivo;
                const horasFaltantes =
                    horasPlanEfectivo != null && horasGrilla < horasPlanEfectivo
                        ? Math.round((horasPlanEfectivo - horasGrilla) * 100) / 100
                        : 0;
                const puedeGenerar =
                    !sinDocente && horarioEditable && horasFaltantes > 0 && bloquesFaltantes > 0;
                const generando = Number(generandoCursoId) === Number(c.cursoId);

                const cardExtra = sinDocente ? (
                    <ActionButton
                        permiso="institucional.oferta.paralelo-gestion"
                        accion="DETALLE"
                        variant="primary"
                        size="small"
                        icon={<TeamOutlined />}
                        onClick={irAOferta}
                    >
                        Asignar en oferta
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
                        Generar bloques
                    </ActionButton>
                ) : coberturaCompleta ? (
                    <Tag color="success">Cobertura completa</Tag>
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
                                    <Text
                                        strong
                                        type={docenteEnConflictoHorario ? 'danger' : undefined}
                                        className={
                                            docenteEnConflictoHorario
                                                ? 'horarios-armado-docente--conflicto'
                                                : undefined
                                        }
                                    >
                                        {c.docente || 'Sin asignar'}
                                    </Text>
                                    {docenteEnConflictoHorario ? (
                                        <Text type="danger" style={{ marginLeft: 8 }}>
                                            (choque de horario)
                                        </Text>
                                    ) : null}
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
                                {horasFaltantes > 0 ? (
                                    <Text type="secondary">
                                        Pendiente:{' '}
                                        <Text strong type="warning">
                                            {horasFaltantes} h · {bloquesFaltantes} bloque(s) por
                                            generar
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
