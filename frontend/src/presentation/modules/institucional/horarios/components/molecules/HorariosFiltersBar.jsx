import { Space } from 'antd';
import { Button } from '@atoms';
import { FilterChip } from '../atoms';

const HorariosFiltersBar = ({ filters, options, onFilterChange, onClearFilters }) => {
    const filtroItems = [
        { key: 'gestion', label: 'Gestion', values: options.gestiones || [] },
        { key: 'carrera', label: 'Carrera', values: options.carreras || [] },
        { key: 'periodo', label: 'Periodo/Ano', values: options.periodos || [] },
        { key: 'turno', label: 'Turno', values: options.turnos || [] },
        { key: 'estado', label: 'Estado', values: ['incompleto', 'sin_horario', 'conflicto', 'completo'] },
    ];
    const hayFiltrosActivos = Object.values(filters || {}).some((value) => value !== 'all');

    return (
        <Space wrap size={8} style={{ width: '100%' }}>
            {filtroItems.map((item) => (
                <FilterChip
                    key={item.key}
                    label={item.label}
                    value={filters[item.key]}
                    options={item.values}
                    onChange={(value) => onFilterChange(item.key, value)}
                />
            ))}
            {hayFiltrosActivos ? (
                <Button variant="default" size="small" onClick={onClearFilters}>
                    Limpiar
                </Button>
            ) : null}
        </Space>
    );
};

export default HorariosFiltersBar;
