import { Card, Flex } from 'antd';
import { allSpacing, componentConfig, allColors, shadows } from '@theme/tokens';
import DashboardUltimosPersonasBlock from './DashboardUltimosPersonasBlock';

/**
 * Molécula: tarjeta con dos bloques de últimos docentes / estudiantes.
 */
const DashboardUltimosRegistrosPanel = ({
    ultimosDocentes,
    ultimosEstudiantes,
    onVerTodosDocentes,
    onVerTodosEstudiantes,
    onOverflowDocentes,
    onOverflowEstudiantes,
}) => {
    return (
        <Card
            style={{
                borderRadius: `${componentConfig.Card.borderRadiusLG}px`,
                boxShadow: shadows.shadowElevation2,
                border: `1px solid ${allColors.colorBorder}`,
                backgroundColor: allColors.colorBgContainer,
            }}
            styles={{ body: { padding: `${componentConfig.Card.paddingLG}px` } }}
        >
            <Flex gap={allSpacing.marginXL} wrap="wrap" align="stretch">
                <DashboardUltimosPersonasBlock
                    title="Últimos docentes"
                    people={ultimosDocentes}
                    onVerTodos={onVerTodosDocentes}
                    overflowTooltip="Ver más docentes"
                    onOverflowClick={onOverflowDocentes}
                />
                <DashboardUltimosPersonasBlock
                    title="Últimos estudiantes"
                    people={ultimosEstudiantes}
                    onVerTodos={onVerTodosEstudiantes}
                    overflowTooltip="Ver más estudiantes"
                    onOverflowClick={onOverflowEstudiantes}
                />
            </Flex>
        </Card>
    );
};

export default DashboardUltimosRegistrosPanel;
