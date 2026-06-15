import { Flex, Typography } from 'antd';
import { allSpacing } from '@theme/tokens';
import { planDisplayLabel } from '@application-institucional/oferta/hooks/state/ofertaStateShared.js';
import OfertaParalelosCardsGrid from './OfertaParalelosCardsGrid';

const { Paragraph } = Typography;

const OfertaGestionPlanTabPanel = ({
  loading,
  plan,
  paralelos,
  coberturaByParaleloId = {},
  soloConsulta = false,
  inhabilitandoParaleloId = null,
  onInhabilitarParalelo,
  onHabilitarParalelo,
  onNavigateDetalle,
}) => {
  const emptyDescription = !plan
    ? 'Seleccione un plan habilitado.'
    : soloConsulta
      ? 'No hay paralelos en este plan para la gestión.'
      : paralelos.length === 0
        ? 'No hay paralelos. Use «Generar paralelos» en el encabezado para crear instancias y materias del periodo.'
        : 'No se pudieron cargar los paralelos de este plan.';

  return (
    <Flex vertical gap={allSpacing.marginMD} className="oferta-gestion-plan-tab-panel">
      {plan ? (
        <Paragraph type="secondary" className="cfg-academico-workspace__desc">
          {soloConsulta ? (
            <>
              Paralelos de <strong>{planDisplayLabel(plan)}</strong> en esta gestión histórica. Consulte
              aula, docentes y horarios en el detalle de cada paralelo.
            </>
          ) : (
            <>
              Paralelos de <strong>{planDisplayLabel(plan)}</strong> en estado{' '}
              <strong>BORRADOR</strong> hasta completar aula y oferta. Las tarjetas muestran el avance;
              use «Generar paralelos» en el encabezado para materializar instancias y cursos del periodo.
            </>
          )}
        </Paragraph>
      ) : null}

      <OfertaParalelosCardsGrid
        loading={loading}
        paralelos={paralelos}
        coberturaByParaleloId={coberturaByParaleloId}
        soloConsulta={soloConsulta}
        inhabilitandoParaleloId={inhabilitandoParaleloId}
        onInhabilitarParalelo={onInhabilitarParalelo}
        onHabilitarParalelo={onHabilitarParalelo}
        onNavigateDetalle={onNavigateDetalle}
        emptyDescription={emptyDescription}
      />
    </Flex>
  );
};

export default OfertaGestionPlanTabPanel;
