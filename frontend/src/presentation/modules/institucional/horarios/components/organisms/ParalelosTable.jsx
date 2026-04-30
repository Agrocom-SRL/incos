import { Table } from 'antd';
import { Button, Card } from '@atoms';
import { StatusTag } from '../atoms';

const ctaByState = {
    incompleto: 'Completar cursos ->',
    sin_horario: 'Asignar horarios ->',
    conflicto: 'Resolver conflictos ->',
    completo: 'Ver horario ->',
};

const ParalelosTable = ({ filteredParallels, onOpenArmado }) => {
    const columns = [
        { title: 'Paralelo', dataIndex: 'paralelo', key: 'paralelo' },
        { title: 'Carrera', dataIndex: 'carrera', key: 'carrera' },
        { title: 'Periodo', dataIndex: 'periodo', key: 'periodo' },
        { title: 'Turno', dataIndex: 'turno', key: 'turno' },
        {
            title: 'Estado',
            dataIndex: 'estado',
            key: 'estado',
            render: (value) => <StatusTag status={value}>{value}</StatusTag>,
        },
        {
            title: 'Progreso',
            key: 'progreso',
            render: (_, row) => `${row.bloquesAsignados}/${row.bloquesRequeridos}`,
        },
        {
            title: 'Accion',
            key: 'accion',
            render: (_, row) => (
                <Button type="link" onClick={() => onOpenArmado(row)}>
                    {ctaByState[row.estado] || 'Abrir ->'}
                </Button>
            ),
        },
    ];

    return (
        <Card size="small">
            <Table rowKey="id" columns={columns} dataSource={filteredParallels} pagination={{ pageSize: 6 }} />
        </Card>
    );
};

export default ParalelosTable;
