import { useMemo } from 'react';
import { Alert, Flex, Table, Tag, Tooltip, Typography, Button as AntButton } from 'antd';
import { BookOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import DetailInfoCard from '@docentes/components/molecules/DetailInfoCard';
import ParaleloCursoOfertaModal from '../ParaleloCursoOfertaModal';

const { Text } = Typography;

const ParaleloCursosGestionSection = ({
    validParaleloId,
    canCrear,
    canEditar,
    canEliminar,
    missingSubjects,
    filasOferta,
    cursoModal,
    closeCursoModal,
    onNuevoCurso,
    onEditarCurso,
    onCrearCursoDesdeMateria,
    requestDeleteCurso,
    deleteCursoLoading,
    handleCrearCursoOferta,
    handleActualizarCursoOferta,
    refetchOferta,
    ofertaError = null,
}) => {
    const columnasOferta = useMemo(
        () => [
            {
                title: 'Sigla',
                dataIndex: 'materiaSigla',
                key: 'materiaSigla',
                width: 100,
                ellipsis: true,
                render: (v) => v || '—',
            },
            {
                title: 'Materia',
                dataIndex: 'materiaNombre',
                key: 'materiaNombre',
                ellipsis: true,
                render: (v) => v || '—',
            },
            {
                title: 'Estado',
                key: 'estado',
                width: 118,
                render: (_, row) =>
                    row.rowKind === 'sin_curso' ? <Tag color="warning">Sin curso</Tag> : <Tag color="processing">Curso</Tag>,
            },
            {
                title: 'Cupo',
                key: 'cupo',
                width: 120,
                align: 'center',
                render: (_, row) => {
                    if (row.rowKind === 'sin_curso') return '—';
                    const min = row.cupoMinimo;
                    const max = row.cupoMaximo;
                    if (min == null && max == null) return '—';
                    return (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {min ?? '—'} / {max ?? '—'}
                        </Text>
                    );
                },
            },
            {
                title: 'Color',
                dataIndex: 'colorHex',
                key: 'colorHex',
                width: 88,
                render: (hex, row) =>
                    row.rowKind === 'sin_curso' ? (
                        '—'
                    ) : hex ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                            <span
                                style={{
                                    width: 18,
                                    height: 18,
                                    borderRadius: 4,
                                    background: hex,
                                    border: '1px solid var(--ant-color-border-secondary, #ddd)',
                                }}
                            />
                            <Text type="secondary" code style={{ fontSize: 11 }}>
                                {hex}
                            </Text>
                        </span>
                    ) : (
                        '—'
                    ),
            },
            {
                title: '',
                key: 'acciones',
                width: 120,
                align: 'right',
                render: (_, row) =>
                    row.rowKind === 'sin_curso' ? (
                        <Flex gap={4} justify="flex-end" wrap="wrap">
                            {canCrear ? (
                                <Tooltip title="Crear curso para esta materia">
                                    <AntButton
                                        type="text"
                                        size="small"
                                        icon={<PlusOutlined />}
                                        aria-label="Crear curso para esta materia"
                                        onClick={() => onCrearCursoDesdeMateria(row)}
                                        style={{ color: 'var(--ant-color-success, #52c41a)' }}
                                    />
                                </Tooltip>
                            ) : null}
                        </Flex>
                    ) : (
                        <Flex gap={4} justify="flex-end" wrap="wrap">
                            {canEditar ? (
                                <Tooltip title="Editar curso">
                                    <AntButton
                                        type="text"
                                        size="small"
                                        icon={<EditOutlined />}
                                        aria-label="Editar curso"
                                        onClick={() => onEditarCurso(row)}
                                        style={{ color: 'var(--accent-600, #d48806)' }}
                                    />
                                </Tooltip>
                            ) : null}
                            {canEliminar ? (
                                <Tooltip title="Eliminar curso">
                                    <AntButton
                                        type="text"
                                        size="small"
                                        danger
                                        icon={<DeleteOutlined />}
                                        aria-label="Eliminar curso"
                                        loading={deleteCursoLoading}
                                        disabled={deleteCursoLoading}
                                        onClick={() => requestDeleteCurso(row)}
                                    />
                                </Tooltip>
                            ) : null}
                        </Flex>
                    ),
            },
        ],
        [
            onEditarCurso,
            requestDeleteCurso,
            onCrearCursoDesdeMateria,
            deleteCursoLoading,
            canCrear,
            canEditar,
            canEliminar,
        ],
    );

    const extraCard = canCrear ? (
        <AntButton type="primary" icon={<PlusOutlined />} onClick={onNuevoCurso}>
            Nuevo curso
        </AntButton>
    ) : null;

    return (
        <>
            {ofertaError ? (
                <Alert type="error" showIcon style={{ marginBottom: 12 }} title="No se pudo cargar la oferta" description={ofertaError} />
            ) : null}
            <DetailInfoCard title={`Cursos del periodo (${filasOferta.length})`} icon={<BookOutlined />} cols={1} extra={extraCard}>
                {filasOferta.length === 0 ? (
                    <div className="sd-empty" style={{ padding: '24px 0' }}>
                        <BookOutlined className="sd-empty__icon" />
                        <p className="sd-empty__text">No hay materias del periodo ni cursos cargados para este paralelo.</p>
                    </div>
                ) : (
                    <Table
                        className="horarios-oferta-cursos-table"
                        dataSource={filasOferta}
                        rowKey="_rowKey"
                        pagination={false}
                        size="small"
                        expandable={{
                            expandedRowRender: (record) => {
                                const isMissing = record.rowKind === 'sin_curso';
                                const codigo = !isMissing ? record.codigo || null : null;
                                const horariosTxt = isMissing
                                    ? '—'
                                    : record.tieneHorarios
                                      ? `${record.bloquesCount} bloque(s) en la grilla`
                                      : 'Sin bloques en la grilla';
                                return (
                                    <div
                                        className="sd-card__body"
                                        style={{
                                            padding: '12px 16px',
                                            gap: '8px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            background: 'var(--border-soft, #f3f4f6)',
                                        }}
                                    >
                                        <div>
                                            <span className="sd-field__label" style={{ display: 'block', marginBottom: 2 }}>
                                                Código del curso
                                            </span>
                                            <span className="sd-field__value">{codigo || '—'}</span>
                                        </div>
                                        <div>
                                            <span className="sd-field__label" style={{ display: 'block', marginBottom: 2 }}>
                                                Horarios (grilla)
                                            </span>
                                            <span className="sd-field__value">{horariosTxt}</span>
                                        </div>
                                        {isMissing && record.horasSemanalesPlan != null ? (
                                            <div>
                                                <span className="sd-field__label" style={{ display: 'block', marginBottom: 2 }}>
                                                    Carga horaria plan (h/sem)
                                                </span>
                                                <span className="sd-field__value">{record.horasSemanalesPlan}</span>
                                            </div>
                                        ) : null}
                                    </div>
                                );
                            },
                            rowExpandable: () => true,
                        }}
                        columns={columnasOferta}
                    />
                )}
            </DetailInfoCard>

            {validParaleloId ? (
                <ParaleloCursoOfertaModal
                    open={cursoModal.open}
                    onClose={closeCursoModal}
                    isEdit={cursoModal.isEdit}
                    cursoEdit={cursoModal.cursoEdit}
                    missingSubjects={missingSubjects}
                    initialAsignaturaPlanId={cursoModal.prefillAsignaturaPlanId}
                    parallelId={validParaleloId}
                    onCrearCurso={handleCrearCursoOferta}
                    onActualizarCurso={handleActualizarCursoOferta}
                    onSaved={() => refetchOferta()}
                    canSubmit={cursoModal.isEdit ? canEditar : canCrear}
                />
            ) : null}
        </>
    );
};

export default ParaleloCursosGestionSection;
