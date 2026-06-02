import { Button, Flex, Select, Tag, Typography } from 'antd';
import { ActionButton } from '@atoms';
import { allColors, allSpacing } from '@theme/tokens';

const { Text } = Typography;

const OfertaStepGestionSection = ({
  gestiones,
  selectedGestionId,
  gestionSeleccionada,
  onSelectGestion,
  onMarcarVigente,
  onContinuar,
}) => (
  <Flex vertical gap={allSpacing.marginMD} className="oferta-step-section">
    <Text type="secondary">
      Seleccione la gestión académica donde habilitará planes y generará la oferta de cursos. La gestión{' '}
      <strong>vigente</strong> es la referencia para matrícula e inscripciones.
    </Text>
    <Select
      placeholder="Seleccione gestión"
      className="oferta-step-section__select"
      style={{ maxWidth: 420 }}
      value={selectedGestionId}
      onChange={onSelectGestion}
      options={gestiones.map((g) => ({
        value: g.id,
        label: `${g.codigo ?? g.name ?? g.nombre ?? `Gestión ${g.id}`}${g.anio ? ` ${g.anio}` : ''}${
          g.vigente ? ' (vigente)' : ''
        }`,
      }))}
    />
    {gestionSeleccionada ? (
      <Flex
        gap="small"
        align="center"
        style={{
          padding: '8px 12px',
          background: allColors.colorFillSecondary,
          borderRadius: 6,
          width: 'fit-content',
        }}
      >
        <Tag color={gestionSeleccionada.vigente ? 'success' : 'default'}>
          {gestionSeleccionada.vigente ? 'Vigente' : 'No vigente'}
        </Tag>
        {gestionSeleccionada.codigo ? (
          <Text type="secondary">Código: {gestionSeleccionada.codigo}</Text>
        ) : null}
      </Flex>
    ) : null}
    <Flex wrap="wrap" gap="small">
      <ActionButton
        permiso="institucional.oferta.gestion-plan"
        accion="ACTIVAR"
        onClick={onMarcarVigente}
        disabled={!selectedGestionId}
      >
        Marcar vigente
      </ActionButton>
      <Button type="primary" disabled={!selectedGestionId} onClick={onContinuar}>
        Continuar a planes
      </Button>
    </Flex>
  </Flex>
);

export default OfertaStepGestionSection;

// ✅ Bugs corregidos: (ninguno)
// ✅ Mejoras aplicadas: gap tokenizado; Select maxWidth; mini-card estado; Flex en botones
