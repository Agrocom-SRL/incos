import { useMemo } from 'react';
import { Space, Table, Typography } from 'antd';
import { Card, ActionButton } from '@atoms';
import {
    buildCarreraHeadingSurfaceStyle,
    resolveCarreraDashboardColor,
} from '@application-institucional/horarios/utils/carreraDashboardColor';
import { resolveHorariosBoardBucket } from '@application-institucional/horarios/utils/horariosBoardBucket';
import {
    labelParaleloSinDocentesCta,
    permisoParaleloSinDocentesCta,
} from '@application-institucional/horarios/config/paths';
import { StatusTag } from '../atoms';

const ctaByBucket = {
    sin_horarios: 'Completar plan',
    sin_docentes: 'Asignar docentes',
    sin_aulas: 'Asignar aula',
    completo: 'Ver horario',
};

const actionPermisoByBucket = {
    sin_horarios: { permiso: 'institucional.horario.armado', accion: 'EDITAR' },
    sin_docentes: { permiso: 'institucional.oferta.paralelo-gestion', accion: 'DETALLE' },
    sin_aulas: { permiso: 'institucional.oferta.paralelo-gestion', accion: 'DETALLE' },
    completo: { permiso: 'institucional.horario.armado', accion: 'EDITAR' },
};

const ctaLabelForRow = (row) => {
    const bucket = row.boardBucket ?? resolveHorariosBoardBucket(row);
    const confAula = Number(row.conflictosAula) || 0;
    const cursosTotales = Number(row.cursosTotales) || 0;
    const cursosCreados = Number(row.cursosCreados) || 0;
    const coberturaInc = Number(row.ofertasCoberturaIncompleta) || 0;
    const sinBloques = Number(row.cursosSinBloquesHorario) || 0;
    const solape = Number(row.conflictosSolapeMismoBloque) || 0;
    const faltaCursos = Math.max(0, cursosTotales - cursosCreados);
    const soloCruceAula =
        bucket === 'sin_horarios' &&
        confAula > 0 &&
        faltaCursos <= 0 &&
        coberturaInc <= 0 &&
        sinBloques <= 0 &&
        solape <= 0;

    if (soloCruceAula) return 'Resolver cruces';
    if (bucket === 'sin_horarios') {
        if (faltaCursos > 0) return 'Completar cursos';
        return 'Asignar horarios';
    }
    if (bucket === 'sin_docentes') return labelParaleloSinDocentesCta(row);
    return ctaByBucket[bucket] || 'Abrir';
};

const actionVariantForBucket = (bucket) => {
    if (bucket === 'sin_horarios') return 'error';
    if (bucket === 'sin_docentes') return 'warning';
    if (bucket === 'sin_aulas') return 'info';
    if (bucket === 'completo') return 'success';
    return 'primary';
};

const groupParallels = (rows) => {
    const list = [...(rows || [])];
    list.sort((a, b) => {
        const c = String(a.carrera || '').localeCompare(String(b.carrera || ''), 'es');
        if (c !== 0) return c;
        const p = String(a.periodo || '').localeCompare(String(b.periodo || ''), 'es');
        if (p !== 0) return p;
        const t = String(a.turno || '').localeCompare(String(b.turno || ''), 'es');
        if (t !== 0) return t;
        return String(a.paralelo || '').localeCompare(String(b.paralelo || ''), 'es');
    });
    const groups = [];
    let current = null;
    for (const row of list) {
        const carrera = row.carrera || '—';
        const periodo = row.periodo || '—';
        const key = `${carrera}\u0000${periodo}`;
        if (!current || current.key !== key) {
            current = { key, carrera, periodo, items: [] };
            groups.push(current);
        }
        current.items.push(row);
    }
    return groups;
};

const ParalelosTable = ({ filteredParallels, onOpenArmado, embedded = false }) => {
    const groups = useMemo(() => groupParallels(filteredParallels), [filteredParallels]);

    const columns = [
        {
            title: 'Paralelo',
            dataIndex: 'paralelo',
            key: 'paralelo',
            ellipsis: true,
        },
        {
            title: 'Turno',
            dataIndex: 'turno',
            key: 'turno',
            width: 110,
            ellipsis: true,
            render: (v) => v || '—',
        },
        {
            title: 'Grupo',
            dataIndex: 'boardBucket',
            key: 'boardBucket',
            width: 150,
            ellipsis: true,
            render: (_, row) => {
                const bucket = row.boardBucket ?? resolveHorariosBoardBucket(row);
                return <StatusTag status={bucket} />;
            },
        },
        {
            title: 'Acción',
            key: 'accion',
            align: 'right',
            width: 260,
            render: (_, row) => {
                const bucket = row.boardBucket ?? resolveHorariosBoardBucket(row);
                const actionPermiso =
                    bucket === 'sin_docentes'
                        ? permisoParaleloSinDocentesCta(row)
                        : (actionPermisoByBucket[bucket] ?? actionPermisoByBucket.sin_horarios);
                return (
                    <Space size={8} wrap>
                        <ActionButton
                            permiso={actionPermiso.permiso}
                            accion={actionPermiso.accion}
                            size="small"
                            variant={actionVariantForBucket(bucket)}
                            className="horarios-paralelos-table__action-btn"
                            onClick={() => onOpenArmado(row)}
                        >
                            {ctaLabelForRow(row)}
                        </ActionButton>
                    </Space>
                );
            },
        },
    ];

    const tables = (
        <div className="horarios-paralelos-table-scroll">
            {groups.length === 0 ? (
                <Typography.Text type="secondary">Sin paralelos con los filtros actuales.</Typography.Text>
            ) : (
                groups.map((g) => {
                    const primera = g.items[0];
                    const carreraHex = resolveCarreraDashboardColor({
                        carreraId: primera?.carreraId,
                        carreraNombre: g.carrera,
                        carreraColorHex: primera?.carreraColorHex,
                    });
                    const headingStyle = carreraHex ? buildCarreraHeadingSurfaceStyle(carreraHex) : undefined;
                    return (
                    <div key={g.key} className="horarios-table-group">
                        <div
                            className={`horarios-table-group__heading${carreraHex ? ' horarios-table-group__heading--carrera' : ''}`}
                            style={headingStyle}
                        >
                            <Typography.Text strong ellipsis>
                                {g.carrera}
                            </Typography.Text>
                            <Typography.Text type="secondary" className="horarios-table-group__sub">
                                {g.periodo} · {g.items.length} paralelo{g.items.length === 1 ? '' : 's'}
                            </Typography.Text>
                        </div>
                        <Table
                            className="horarios-paralelos-table__inner"
                            rowKey="id"
                            columns={columns}
                            dataSource={g.items}
                            pagination={false}
                            scroll={{ x: 'max-content' }}
                            tableLayout="fixed"
                            size="small"
                            showHeader
                        />
                    </div>
                    );
                })
            )}
        </div>
    );

    if (embedded) {
        return <div className="horarios-paralelos-table-embedded">{tables}</div>;
    }

    return <Card size="small">{tables}</Card>;
};

export default ParalelosTable;
