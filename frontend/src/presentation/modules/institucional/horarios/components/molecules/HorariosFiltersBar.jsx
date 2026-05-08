import { CloseOutlined } from '@ant-design/icons';
import { Col, Flex, Row, Tag, Typography } from 'antd';
import { FieldSelect, IconButton } from '@atoms';
import { allSpacing, allColors, typography } from '@theme/tokens';

const { Text, Title } = Typography;

const toSelectOptions = (values) => [
    { value: 'all', label: 'Todos' },
    ...(values || []).map((opt) => ({ value: opt, label: opt })),
];

const FilterField = ({ label, value, rawOptions, onChange }) => {
    const active = value !== 'all';
    return (
        <Flex vertical gap={allSpacing.marginXS} style={{ minWidth: 0, width: '100%' }}>
            <Flex align="center" gap={allSpacing.marginXS} wrap="wrap">
                <Text strong style={{ fontSize: typography.fontSizeSM, color: allColors.colorText }}>
                    {label}
                </Text>
                {active ? (
                    <Tag color="processing" style={{ marginInlineEnd: 0 }}>
                        Activo
                    </Tag>
                ) : null}
            </Flex>
            <FieldSelect
                value={value}
                onChange={onChange}
                options={toSelectOptions(rawOptions)}
                style={{ width: '100%', minWidth: 0 }}
                size="middle"
                allowClear={false}
            />
        </Flex>
    );
};

const DEFAULT_FIELDS = ['carrera', 'periodo', 'turno'];

const FIELD_CONFIG = {
    carrera: { label: 'Carrera', optionKey: 'carreras' },
    periodo: { label: 'Periodo / año', optionKey: 'periodos' },
    turno: { label: 'Turno', optionKey: 'turnos' },
};

const HorariosFiltersBar = ({
    filters,
    options,
    onFilterChange,
    onClearFilters,
    title = 'Vista de planificación',
    visibleFields = DEFAULT_FIELDS,
}) => {
    const fields = (visibleFields || [])
        .map((key) => {
            const config = FIELD_CONFIG[key];
            if (!config) return null;
            return { key, label: config.label, raw: options?.[config.optionKey] || [] };
        })
        .filter(Boolean);

    const hayFiltrosActivos = fields.some((field) => (filters?.[field.key] || 'all') !== 'all');

    return (
        <Flex vertical gap={allSpacing.marginMD} style={{ width: '100%' }}>
            <Flex
                justify="space-between"
                align="center"
                gap={allSpacing.marginMD}
                wrap="nowrap"
                className="horarios-filters-bar__header"
            >
                <Title
                    level={4}
                    style={{
                        flex: '1 1 auto',
                        minWidth: 0,
                        margin: 0,
                        color: allColors.colorPrimary,
                        fontSize: `${typography.fontSizeHeading4}px`,
                        fontWeight: typography.fontWeightStrong,
                    }}
                >
                    {title}
                </Title>
                {hayFiltrosActivos ? (
                    <Flex flex="0 0 auto" align="center" className="horarios-filters-bar__clear">
                        <IconButton
                            variant="error"
                            icon={<CloseOutlined />}
                            onClick={onClearFilters}
                            size="middle"
                            aria-label="Limpiar filtros"
                            title="Limpiar filtros"
                        />
                    </Flex>
                ) : null}
            </Flex>
            <Row gutter={[allSpacing.marginLG, allSpacing.marginMD]} align="bottom">
                {fields.map((item) => (
                    <Col key={item.key} xs={24} sm={24} md={12} xl={8}>
                        <FilterField
                            label={item.label}
                            value={filters[item.key]}
                            rawOptions={item.raw}
                            onChange={(v) => onFilterChange(item.key, v)}
                        />
                    </Col>
                ))}
            </Row>
        </Flex>
    );
};

export default HorariosFiltersBar;
