import { useMemo, useState } from 'react';
import { Alert, Col, Divider, Flex, Row, Spin, Tabs, Typography, Button as AntButton } from 'antd';
import { ArrowLeftOutlined, BookOutlined, EyeOutlined, ScheduleOutlined, TeamOutlined, SettingOutlined } from '@ant-design/icons';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { Card, ActionButton } from '@atoms';
import { useHorariosArmadoContext } from '@application-institucional/horarios';
import { resumenBloquesCurso } from '@application-institucional/horarios/utils/resumenBloquesCurso';
import { buildCarreraImageUrl } from '@application-institucional/horarios/utils/buildCarreraImageUrl';
import ParaleloArmadoPlanSection from '../components/organisms/ParaleloArmadoPlanSection';
import ParaleloCursosGestionSection from '../components/organisms/ParaleloCursosGestionSection';
import DocenteAsignacionCursoModal from '../components/organisms/DocenteAsignacionCursoModal';
import '@presentation/styles/pages/detail-page.css';
import '../styles/gestion-horarios-page.css';

const { Text, Title } = Typography;

const GestionHorariosArmadoPage = () => {
    const {
        paraleloId,
        tab,
        setTab,
        turnoEfectivo,
        breadcrumbItems,
        pageTitle,
        loading,
        error,
        persistResult,
        persistLoading,
        persistError,
        paraleloApiMeta,
        paraleloNombre,
        missingSubjects,
        draftSchedules,
        setDraftSchedules,
        onRequestPersist,
        handleVolver,
        ofertaParalelo,
    } = useHorariosArmadoContext();
    const [docenteModalOpen, setDocenteModalOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);

    const handleOpenDocenteAsignacion = (row) => {
        if (!row?.cursoId) return;
        const source = draftSchedules.find((c) => Number(c.cursoId) === Number(row.cursoId));
        const fallback = {
            ...row,
            bloques: [],
            docente: row.docente || null,
            cursoColorHex: row.colorHex || row.cursoColorHex || null,
        };
        setSelectedCourse(source || fallback);
        setDocenteModalOpen(true);
    };

    const handleDocenteAssigned = ({ cursoId, docenteNombre }) => {
        const docente = docenteNombre || null;
        setDraftSchedules((prev) =>
            prev.map((c) =>
                Number(c.cursoId) === Number(cursoId)
                    ? {
                          ...c,
                          docente,
                      }
                    : c,
            ),
        );
        setSelectedCourse((prev) =>
            prev && Number(prev.cursoId) === Number(cursoId)
                ? {
                      ...prev,
                      docente,
                  }
                : prev,
        );
    };

    const tabItems = useMemo(
        () => [
            {
                key: 'cursos',
                label: (
                    <span className="sd-tab-label">
                        <BookOutlined className="horarios-armado-tab__icon" aria-hidden />
                        <span>Cursos del paralelo</span>
                    </span>
                ),
                children: (
                    <div className="sd-tab-body horarios-armado-tab-body">
                        {!draftSchedules.length ? (
                            <Alert
                                type="info"
                                showIcon
                                title="Sin cursos"
                                description={
                                    <Flex vertical gap={8} align="flex-start">
                                        <span>No hay cursos cargados para este paralelo.</span>
                                        <ActionButton
                                            permiso="institucional.gestion.horarios"
                                            accion="LISTAR"
                                            variant="default"
                                            size="small"
                                            onClick={() => setTab('gestion')}
                                        >
                                            Ir a gestión de cursos
                                        </ActionButton>
                                    </Flex>
                                }
                            />
                        ) : (
                            <Flex vertical gap={12}>
                                {missingSubjects.length ? (
                                    <Alert
                                        type="warning"
                                        showIcon
                                        title={`Materias del periodo sin curso (${missingSubjects.length})`}
                                        description={
                                            <ul className="horarios-armado-cursos__lista">
                                                {missingSubjects.map((m, idx) => (
                                                    <li key={`${m.asignaturaPlanId || m.materiaId || idx}`}>
                                                        <Text type="secondary">
                                                            {m.materiaSigla && m.materiaNombre
                                                                ? `${m.materiaSigla} — ${m.materiaNombre}`
                                                                : m.materiaNombre || m.materiaSigla || 'Materia sin nombre'}{' '}
                                                            {m.horasSemanalesPlan != null
                                                                ? `· ${m.horasSemanalesPlan} h/semana`
                                                                : ''}
                                                        </Text>
                                                    </li>
                                                ))}
                                            </ul>
                                        }
                                    />
                                ) : (
                                    <Alert type="success" showIcon title="Todas las materias del periodo ya tienen curso." />
                                )}
                                <Row gutter={[12, 12]}>
                                    {draftSchedules.map((c) => {
                                        const titulo = c.materiaNombre || c.materiaSigla || 'Materia sin nombre';
                                        const { horasGrilla, horasPlan, diasOrd, lineas } = resumenBloquesCurso(c);
                                        const docenteActual = c.docente || null;
                                        return (
                                            <Col key={c.cursoId} xs={24} lg={12}>
                                                <Card
                                                    variant="default"
                                                    shadow={true}
                                                    headerColor="primary"
                                                    headerAccentHex={c.cursoColorHex}
                                                    title={titulo}
                                                    extra={
                                                        <AntButton
                                                            type="primary"
                                                            icon={<TeamOutlined />}
                                                            onClick={() => handleOpenDocenteAsignacion({ ...c, docente: docenteActual })}
                                                        >
                                                            {docenteActual ? 'Reasignar docente' : 'Asignar docente'}
                                                        </AntButton>
                                                    }
                                                >
                                                    <Flex vertical gap={6}>
                                                        {c.materiaSigla && c.materiaNombre ? (
                                                            <Text type="secondary">
                                                                Sigla: <Text strong>{c.materiaSigla}</Text>
                                                            </Text>
                                                        ) : null}
                                                        <Text type="secondary">
                                                            Docente:{' '}
                                                            <Text strong>{docenteActual || 'Sin asignar'}</Text>
                                                        </Text>
                                                        <Text type="secondary">
                                                            Carga horaria del periodo (plan):{' '}
                                                            <Text strong>
                                                                {horasPlan != null && !Number.isNaN(horasPlan)
                                                                    ? `${horasPlan} h/semana`
                                                                    : '—'}
                                                            </Text>
                                                        </Text>
                                                        <Text type="secondary">
                                                            Horas acumuladas en la grilla (bloques):{' '}
                                                            <Text strong>{horasGrilla} h</Text> (
                                                            {c.bloques?.length ?? 0} bloques)
                                                        </Text>
                                                        <Text type="secondary">
                                                            Días con clase:{' '}
                                                            <Text strong>{diasOrd.length ? diasOrd.join(', ') : '—'}</Text>
                                                        </Text>
                                                        {lineas.length ? (
                                                            <>
                                                                <Divider plain style={{ margin: '8px 0' }} />
                                                                <Text strong>Detalle por combinación día / horario</Text>
                                                                <ul className="horarios-armado-cursos__lista">
                                                                    {lineas.map((ln, idx) => (
                                                                        <li key={`${c.cursoId}-${idx}`}>
                                                                            <Text type="secondary">{ln}</Text>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </>
                                                        ) : (
                                                            <Text type="secondary" italic>
                                                                Aún no hay bloques cargados en el plan para esta materia.
                                                            </Text>
                                                        )}
                                                    </Flex>
                                                </Card>
                                            </Col>
                                        );
                                    })}
                                </Row>
                            </Flex>
                        )}
                    </div>
                ),
            },
            {
                key: 'gestion',
                label: (
                    <span className="sd-tab-label">
                        <SettingOutlined className="horarios-armado-tab__icon" aria-hidden />
                        <span>Gestión de cursos</span>
                    </span>
                ),
                children: (
                    <div className="sd-tab-body horarios-armado-tab-body horarios-oferta-cursos-card">
                        <Spin spinning={Boolean(ofertaParalelo?.validParaleloId) && Boolean(ofertaParalelo?.loading)} tip="Cargando oferta…">
                            <ParaleloCursosGestionSection
                                validParaleloId={ofertaParalelo.validParaleloId}
                                canCrear={ofertaParalelo.canCrear}
                                canEditar={ofertaParalelo.canEditar}
                                canEliminar={ofertaParalelo.canEliminar}
                                missingSubjects={ofertaParalelo.missingSubjects}
                                filasOferta={ofertaParalelo.filasOferta}
                                cursoModal={ofertaParalelo.cursoModal}
                                closeCursoModal={ofertaParalelo.closeCursoModal}
                                onNuevoCurso={ofertaParalelo.onNuevoCurso}
                                onEditarCurso={ofertaParalelo.onEditarCurso}
                                onCrearCursoDesdeMateria={ofertaParalelo.onCrearCursoDesdeMateria}
                                requestDeleteCurso={ofertaParalelo.requestDeleteCurso}
                                deleteCursoLoading={ofertaParalelo.deleteCursoLoading}
                                handleCrearCursoOferta={ofertaParalelo.handleCrearCursoOferta}
                                handleActualizarCursoOferta={ofertaParalelo.handleActualizarCursoOferta}
                                refetchOferta={ofertaParalelo.refetchOferta}
                                ofertaError={ofertaParalelo.error}
                            />
                        </Spin>
                    </div>
                ),
            },
            {
                key: 'plan',
                label: (
                    <span className="sd-tab-label">
                        <ScheduleOutlined className="horarios-armado-tab__icon" aria-hidden />
                        <span>Plan semanal</span>
                    </span>
                ),
                children: (
                    <div className="sd-tab-body horarios-armado-tab-body">
                        <ParaleloArmadoPlanSection
                            schedules={draftSchedules}
                            onSchedulesChange={setDraftSchedules}
                            editable
                            turnoLabel={turnoEfectivo || undefined}
                            persistLoading={persistLoading}
                            persistError={persistError}
                            persistSuccess={Boolean(!persistLoading && !persistError && persistResult)}
                            onRequestPersist={onRequestPersist}
                        />
                    </div>
                ),
            },
            {
                key: 'vista',
                label: (
                    <span className="sd-tab-label">
                        <EyeOutlined className="horarios-armado-tab__icon" aria-hidden />
                        <span>Vista previa</span>
                    </span>
                ),
                children: (
                    <div className="sd-tab-body horarios-armado-tab-body">
                        <ParaleloArmadoPlanSection
                            schedules={draftSchedules}
                            onSchedulesChange={() => { }}
                            editable={false}
                            turnoLabel={turnoEfectivo || undefined}
                        />
                    </div>
                ),
            },
        ],
        [
            draftSchedules,
            missingSubjects,
            turnoEfectivo,
            persistLoading,
            persistError,
            persistResult,
            setDraftSchedules,
            onRequestPersist,
            setTab,
            ofertaParalelo,
        ],
    );

    const headerActions = (
        <button type="button" className="sd-btn sd-btn--outline" onClick={handleVolver}>
            <ArrowLeftOutlined /> Volver
        </button>
    );

    return (
        <PageTemplate
            header={<PageHeader title={pageTitle} breadcrumbItems={breadcrumbItems} actions={headerActions} />}
            sidebar={null}
        >
            <Spin spinning={Boolean(paraleloId) && loading} size="large" tip="Cargando plan del paralelo…">
                <div className="sd sd-spin-body horarios-armado-page">
                    {!paraleloId ? (
                        <Alert
                            type="warning"
                            showIcon
                            title="Falta el paralelo"
                            description="Abrí esta pantalla desde la gestión de horarios eligiendo un paralelo (Tablero o Tabla)."
                        />
                    ) : (
                        <>
                            {error ? (
                                <Alert
                                    type="error"
                                    showIcon
                                    style={{ marginBottom: 16 }}
                                    title="No se pudo cargar el plan"
                                    description={error}
                                />
                            ) : null}
                            {!error ? (
                                <>
                                    <div className="horarios-armado-context" style={{ marginBottom: 16 }}>
                                        <Flex gap={16} align="flex-start" wrap="wrap">
                                            {paraleloApiMeta?.carreraImagenRuta ? (
                                                <img
                                                    className="horarios-armado-context__img"
                                                    src={buildCarreraImageUrl(paraleloApiMeta.carreraImagenRuta)}
                                                    alt=""
                                                    width={152}
                                                    height={152}
                                                    style={{
                                                        objectFit: 'cover',
                                                        borderRadius: 10,
                                                        flexShrink: 0,
                                                        border: '1px solid var(--ant-color-border-secondary, #eee)',
                                                    }}
                                                />
                                            ) : null}
                                            <Flex vertical gap={4} style={{ minWidth: 0, flex: 1 }}>
                                                <Title level={5} style={{ margin: 0 }}>
                                                    {paraleloNombre || 'Paralelo'}
                                                </Title>
                                                <Text type="secondary">
                                                    {paraleloApiMeta?.carreraNombre
                                                        ? `${paraleloApiMeta.carreraNombre}${paraleloApiMeta.carreraCodigo
                                                            ? ` (${paraleloApiMeta.carreraCodigo})`
                                                            : ''
                                                        }`
                                                        : 'Carrera: —'}
                                                </Text>
                                                <Text type="secondary">
                                                    Periodo:{' '}
                                                    <Text strong>
                                                        {paraleloApiMeta?.periodoNombre
                                                            ? `${paraleloApiMeta.periodoNombre}${paraleloApiMeta.periodoNumero != null
                                                                ? ` (n.º ${paraleloApiMeta.periodoNumero})`
                                                                : ''
                                                            }`
                                                            : '—'}
                                                    </Text>
                                                </Text>
                                                <Text type="secondary">
                                                    Turno: <Text strong>{turnoEfectivo || '—'}</Text>
                                                </Text>
                                                {paraleloApiMeta?.descripcion ? (
                                                    <Text type="secondary" style={{ marginTop: 4 }}>
                                                        {paraleloApiMeta.descripcion}
                                                    </Text>
                                                ) : null}
                                                <Text type="secondary" style={{ marginTop: 8 }}>
                                                    Revisá las materias del periodo, editá el plan semanal (arrastrá bloques
                                                    entre celdas de la misma ventana del turno) y usá la vista previa.
                                                </Text>
                                            </Flex>
                                        </Flex>
                                    </div>
                                    <div className="sd-tabs-shell">
                                        <Tabs
                                            className="sd-tabs"
                                            activeKey={tab}
                                            onChange={setTab}
                                            items={tabItems}
                                            destroyOnHidden
                                        />
                                    </div>
                                </>
                            ) : null}
                        </>
                    )}
                </div>
            </Spin>
            {docenteModalOpen ? (
                <DocenteAsignacionCursoModal
                    open={docenteModalOpen}
                    onClose={() => setDocenteModalOpen(false)}
                    selectedCourse={selectedCourse}
                    paraleloLabel={paraleloNombre || `#${paraleloId || '—'}`}
                    onAssigned={handleDocenteAssigned}
                />
            ) : null}
        </PageTemplate>
    );
};

export default GestionHorariosArmadoPage;
