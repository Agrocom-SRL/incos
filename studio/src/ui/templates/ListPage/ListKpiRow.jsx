/**
 * ListKpiRow — fila de indicadores del listado (genérica).
 * Compone KpiCard (compartido) con stagger gateado por reduced-motion.
 * Recibe los KPIs ya calculados por useListPage (DIP); aquí solo se traducen
 * las claves i18n (labelKey/sub.key) a texto. Generaliza sections/EnrollmentKpis.
 */
import { motion } from 'motion/react';
import { KpiCard } from '@ui/molecules/KpiCard/KpiCard';
import { useTranslation } from '@lib/i18n/useTranslation';
import { useReducedMotion } from '@lib/motion/useReducedMotion';
import { staggerContainer, staggerItem } from '@lib/motion/presets';
import './ListKpiRow.css';

const MotionDiv = motion.div;

export function ListKpiRow({ kpiValues }) {
  const { t } = useTranslation();
  const reduce = useReducedMotion();

  return (
    <MotionDiv
      className="mat-kpis"
      variants={reduce ? undefined : staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {kpiValues.map((k) => (
        <MotionDiv key={k.key} variants={reduce ? undefined : staggerItem}>
          <KpiCard
            label={t(k.labelKey)}
            value={k.value}
            icon={k.icon}
            accent={k.accent}
            sub={k.sub ? t(k.sub.key, k.sub.params) : undefined}
          />
        </MotionDiv>
      ))}
    </MotionDiv>
  );
}

export default ListKpiRow;
