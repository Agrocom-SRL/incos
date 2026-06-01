import { Flex, Select, Typography } from 'antd';
import { useGestionesCatalogApi } from '@application/modules/shared/hooks';
import { useHorariosArmadoParaleloCatalog } from '@application-institucional/horarios/hooks/useHorariosArmadoParaleloCatalog';
import { allSpacing } from '@theme/tokens';
import { useMemo } from 'react';

const { Text } = Typography;

/**
 * Selector gestión + paralelo en gestión (grano paralelo_gestion).
 */
const HorariosArmadoParaleloSelector = ({
  gestionId,
  onGestionChange,
  paraleloGestionId,
  onParaleloGestionChange,
}) => {
  const { gestiones, loading: gestionesLoading } = useGestionesCatalogApi();
  const { options, loading: paralelosLoading } = useHorariosArmadoParaleloCatalog(gestionId);

  const gestionOptions = useMemo(() => {
    const list = Array.isArray(gestiones) ? gestiones : [];
    return list.map((g) => ({
      value: Number(g.id),
      label: g.nombre ?? g.codigo ?? `Gestión #${g.id}`,
    }));
  }, [gestiones]);

  return (
    <Flex
      wrap="wrap"
      gap={allSpacing.marginSM}
      align="center"
      className="horarios-armado-paralelo-selector"
    >
      <Text type="secondary">Gestión:</Text>
      <Select
        style={{ minWidth: 200 }}
        loading={gestionesLoading}
        value={gestionId ?? undefined}
        options={gestionOptions}
        placeholder="Gestión académica"
        onChange={onGestionChange}
        showSearch
        optionFilterProp="label"
      />
      <Text type="secondary">Paralelo:</Text>
      <Select
        style={{ minWidth: 280 }}
        loading={paralelosLoading}
        value={
          options.some((o) => o.value === paraleloGestionId) ? paraleloGestionId : undefined
        }
        options={options}
        placeholder="Paralelo en gestión"
        onChange={(value, option) => onParaleloGestionChange(value, option)}
        showSearch
        optionFilterProp="label"
        disabled={!gestionId}
      />
    </Flex>
  );
};

export default HorariosArmadoParaleloSelector;
