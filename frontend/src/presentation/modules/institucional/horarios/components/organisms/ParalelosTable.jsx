import { useMemo } from 'react';
import { Space, Table, Typography } from 'antd';
import { Card, ActionButton } from '@atoms';
import { StatusTag } from '../atoms';

const ctaByState = {
    incompleto: 'Completar cursos',
    sin_horario: 'Asignar horarios',
    conflicto: 'Resolver conflictos',
    completo: 'Ver horario',
};

const actionVariant = (estado) => {
    if (estado === 'conflicto') return 'error';
    if (estado === 'completo') return 'success';
    if (estado === 'sin_horario') return 'info';
    if (estado === 'incompleto') return 'warning';
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
        const turno = row.turno || '—';
        const key = `${carrera}\u0000${periodo}\u0000${turno}`;
        if (!current || current.key !== key) {
            current = { key, carrera, periodo, turno, items: [] };
            groups.push(current);
        }
        current.items.push(row);
    }
    return groups;
};

const ParalelosTable = ({ filteredParallels, onOpenArmado, onOpenGestionCursos, embedded = false }) => {
    const groups = useMemo(() => groupParallels(filteredParallels), [filteredParallels]);

    const columns = [
        {
            title: 'Paralelo',
            dataIndex: 'paralelo',
            key: 'paralelo',
            ellipsis: true,
        },
        {
            title: 'Estado',
            dataIndex: 'estado',
            key: 'estado',
            width: 130,
            render: (value) => <StatusTag status={value}>{value}</StatusTag>,
        },
        {
            title: 'Acción',
            key: 'accion',
            align: 'right',
            width: 260,
            render: (_, row) => (
                <Space size={8} wrap>
                    <ActionButton
                        permiso="institucional.horario.armado"
                        accion="EDITAR"
                        size="small"
                        variant={actionVariant(row.estado)}
                        className="horarios-paralelos-table__action-btn"
                        onClick={() => onOpenArmado(row)}
                    >
                        {ctaByState[row.estado] || 'Abrir'}
                    </ActionButton>
                    {typeof onOpenGestionCursos === 'function' ? (
                        <ActionButton
                            permiso="institucional.gestion.horarios"
                            accion="LISTAR"
                            size="small"
                            variant="default"
                            onClick={() => onOpenGestionCursos(row)}
                        >
                            Cursos
                        </ActionButton>
                    ) : null}
                </Space>
            ),
        },
    ];

    const tables = (
        <div className="horarios-paralelos-table-scroll">
            {groups.length === 0 ? (
                <Typography.Text type="secondary">Sin paralelos con los filtros actuales.</Typography.Text>
            ) : (
                groups.map((g) => (
                    <div key={g.key} className="horarios-table-group">
                        <div className="horarios-table-group__heading">
                            <Typography.Text strong ellipsis>
                                {g.carrera}
                            </Typography.Text>
                            <Typography.Text type="secondary" className="horarios-table-group__sub">
                                {g.periodo} · Turno {g.turno} · {g.items.length} paralelo{g.items.length === 1 ? '' : 's'}
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
                ))
            )}
        </div>
    );

    if (embedded) {
        return <div className="horarios-paralelos-table-embedded">{tables}</div>;
    }

    return <Card size="small">{tables}</Card>;
};

export default ParalelosTable;
