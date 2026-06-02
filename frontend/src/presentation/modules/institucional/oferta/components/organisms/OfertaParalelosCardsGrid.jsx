import { Empty, Flex, Skeleton } from 'antd';
import { useOfertaParaleloCardModels } from '@application-institucional/oferta/hooks/features/useOfertaParaleloCardModels.js';
import { allSpacing } from '@theme/tokens';
import OfertaParaleloCard from '../molecules/OfertaParaleloCard';

const SKELETON_COUNT = 4;

const OfertaParalelosCardsGrid = ({
  paralelos = [],
  loading = false,
  coberturaByParaleloId = {},
  emptyDescription = 'No hay paralelos de gestión.',
  soloConsulta = false,
  onNavigateDetalle,
  toolbar = null,
}) => {
  const cardModels = useOfertaParaleloCardModels(paralelos, coberturaByParaleloId, { soloConsulta });

  return (
    <Flex vertical gap={allSpacing.marginMD} className="oferta-paralelos-cards">
      {toolbar ? (
        <Flex className="oferta-paralelos-cards__toolbar" wrap="wrap" gap={allSpacing.marginSM}>
          {toolbar}
        </Flex>
      ) : null}

      {loading && !paralelos.length ? (
        <div className="oferta-paralelos-cards__grid">
          {Array.from({ length: SKELETON_COUNT }).map((_, idx) => (
            <article
              key={`pg-skeleton-${idx}`}
              className="oferta-paralelo-card oferta-paralelo-card--skeleton"
            >
              <div className="opc-band opc-band--skeleton" />
              <div className="opc-body opc-body--skeleton">
                <Skeleton active paragraph={{ rows: 3 }} />
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {!loading && !paralelos.length ? (
        <Empty description={emptyDescription} className="oferta-paralelos-cards__empty" />
      ) : null}

      {!loading && cardModels.length > 0 ? (
        <div className="oferta-paralelos-cards__grid">
          {cardModels.map((model) => (
            <OfertaParaleloCard key={model.id} model={model} onNavigateDetalle={onNavigateDetalle} />
          ))}
        </div>
      ) : null}
    </Flex>
  );
};

export default OfertaParalelosCardsGrid;
