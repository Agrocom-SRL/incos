/**
 * Skeleton — átomo paramétrico de carga.
 *
 * Atomic Design: ATOMO. Unifica el patrón de los skeletons del proyecto
 * (MatriculaListSkeleton, CursosDocenteSkeleton, LoadingFallback): un único
 * componente que dibuja la forma del contenido que está cargando según `variant`.
 *
 * Wrapper delgado sobre los Skeleton de Ant Design (Skeleton, Skeleton.Input,
 * Skeleton.Image, Skeleton.Button). El shimmer lo provee el `active` de AntD +
 * el CSS global de motion-utilities.css; respeta prefers-reduced-motion global,
 * por eso NO usa motion JS.
 *
 * Variantes:
 *  - 'rows'   → filas apiladas (listados / tablas).
 *  - 'grid'   → tarjetas en grilla (vista de cards).
 *  - 'detail' → cabecera de ficha (avatar + líneas) + bloque de párrafos.
 *  - 'form'   → título + secciones de formulario (= LoadingFallback).
 *
 * @module presentation/components/atoms/Skeleton
 * @param {{
 *   variant?: 'rows' | 'grid' | 'detail' | 'form',
 *   rows?: number,        // nº de filas/tarjetas (default 8; grid usa 6)
 *   active?: boolean,     // shimmer (default true)
 *   className?: string,
 * }} props
 */

import { Skeleton as AntSkeleton, Flex } from 'antd';

const RowsSkeleton = ({ rows, active, className }) => (
  <Flex
    vertical
    gap="small"
    aria-hidden
    className={`incos-skeleton incos-skeleton--rows ${className}`.trim()}
  >
    {Array.from({ length: rows }).map((_, i) => (
      <AntSkeleton.Input key={i} active={active} block size="large" />
    ))}
  </Flex>
);

const GridSkeleton = ({ rows, active, className }) => (
  <div
    aria-hidden
    className={`incos-skeleton incos-skeleton--grid ${className}`.trim()}
  >
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="incos-skeleton__card">
        <AntSkeleton active={active} avatar paragraph={{ rows: 3 }} />
      </div>
    ))}
  </div>
);

const DetailSkeleton = ({ active, className }) => (
  <Flex
    vertical
    gap="large"
    aria-hidden
    className={`incos-skeleton incos-skeleton--detail ${className}`.trim()}
  >
    <AntSkeleton active={active} avatar={{ size: 'large' }} paragraph={{ rows: 2 }} title={{ width: '40%' }} />
    <AntSkeleton active={active} paragraph={{ rows: 5 }} title={false} />
  </Flex>
);

const FormSkeleton = ({ rows, active, className }) => (
  <Flex
    vertical
    gap="large"
    aria-hidden
    className={`incos-skeleton incos-skeleton--form ${className}`.trim()}
  >
    <AntSkeleton.Input active={active} size="large" />
    <AntSkeleton active={active} paragraph={{ rows: 4 }} title={{ width: '60%' }} />
    <AntSkeleton active={active} paragraph={{ rows: Math.max(2, rows - 4) }} title={false} />
  </Flex>
);

const Skeleton = ({ variant = 'rows', rows = 8, active = true, className = '' }) => {
  switch (variant) {
    case 'grid':
      return <GridSkeleton rows={rows === 8 ? 6 : rows} active={active} className={className} />;
    case 'detail':
      return <DetailSkeleton active={active} className={className} />;
    case 'form':
      return <FormSkeleton rows={rows} active={active} className={className} />;
    case 'rows':
    default:
      return <RowsSkeleton rows={rows} active={active} className={className} />;
  }
};

export default Skeleton;
