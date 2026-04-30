import { Space, Typography } from 'antd';
import { Button, Card } from '@atoms';
import { ProgressBar, StatusTag } from '../atoms';

const ctaByState = {
    incompleto: 'Completar cursos ->',
    sin_horario: 'Asignar horarios ->',
    conflicto: 'Resolver conflictos ->',
    completo: 'Ver horario ->',
};

const ParaleloCard = ({ paralelo, onOpen }) => {
    return (
        <Card size="small" type="inner" title={`${paralelo.paralelo} - ${paralelo.carrera}`}>
            <Typography.Text type="secondary">
                {paralelo.periodo} | Turno {paralelo.turno} | {paralelo.cursosTotales} asignaturas del plan
            </Typography.Text>
            <br />
            <Typography.Text>
                Cursos: {paralelo.cursosAsignados}/{paralelo.cursosTotales} asignados con horario
            </Typography.Text>
            <ProgressBar assigned={paralelo.bloquesAsignados} required={paralelo.bloquesRequeridos} />
            <Space style={{ marginTop: 8 }}>
                <StatusTag status={paralelo.estado} />
                <Button size="small" variant={paralelo.estado === 'conflicto' ? 'error' : paralelo.estado === 'completo' ? 'success' : 'default'} onClick={() => onOpen(paralelo)}>
                    {ctaByState[paralelo.estado] || 'Abrir ->'}
                </Button>
            </Space>
        </Card>
    );
};

export default ParaleloCard;
