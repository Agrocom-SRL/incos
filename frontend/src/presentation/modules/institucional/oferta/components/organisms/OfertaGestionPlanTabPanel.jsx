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
  totalParalelosGestion = 0,
  soloConsulta = false,
  onNavigateDetalle,
}) => (
  <Flex vertical gap={allSpacing.marginMD} className="oferta-gestion-plan-tab-panel">
    {plan ? (
      <Paragraph type="secondary" className="cfg-academico-workspace__desc">
        {soloConsulta ? (
          <>
            Paralelos ofertados para <strong>{planDisplayLabel(plan)}</strong> en esta gestión
            histórica. Consulte aula, docentes y horarios en el detalle de cada paralelo.
          </>
        ) : (
          <>
            Paralelos ofertados para <strong>{planDisplayLabel(plan)}</strong>. Use «Generar
            paralelos» en el encabezado para crear instancias desde plantillas del catálogo; luego
            configure aula, oferta y docentes en cada ficha.
          </>
        )}
      </Paragraph>
    ) : null}

    <OfertaParalelosCardsGrid
      loading={loading}
      paralelos={paralelos}
      coberturaByParaleloId={coberturaByParaleloId}
      soloConsulta={soloConsulta}
      onNavigateDetalle={onNavigateDetalle}
      emptyDescription={
        plan
          ? soloConsulta
            ? 'No hay paralelos ofertados para este plan en la gestión.'
            : totalParalelosGestion > 0
              ? 'Hay paralelos generados sin oferta de cursos. Abra el detalle de cada uno o genere la oferta desde la ficha.'
              : 'No hay paralelos ofertados. Use «Generar paralelos» en el encabezado para crear instancias desde plantillas del catálogo académico.'
          : 'Seleccione un plan habilitado.'
      }
    />
  </Flex>
);

export default OfertaGestionPlanTabPanel;
