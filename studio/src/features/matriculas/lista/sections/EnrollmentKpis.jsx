/**
 * EnrollmentKpis — fila de indicadores del listado (organismo local).
 * Compone KpiCard (compartido) con stagger gateado por reduced-motion.
 * Recibe los KPIs ya calculados (DIP); no calcula datos de negocio.
 */
import { TeamOutlined, RiseOutlined, UserAddOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { motion } from 'motion/react';
import { KpiCard } from '@ui/molecules/KpiCard/KpiCard';
import { useTranslation } from '@lib/i18n/useTranslation';
import { useReducedMotion } from '@lib/motion/useReducedMotion';
import { staggerContainer, staggerItem } from '@lib/motion/presets';

const MotionDiv = motion.div;

export function EnrollmentKpis({ kpis, termLabel }) {
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  const pct = (n) => (kpis.total ? Math.round((n / kpis.total) * 100) : 0);

  const cards = [
    { label: t('enrollments.kpi.totalEnrolled'), value: kpis.total, icon: <TeamOutlined />, accent: 'var(--brand-600)', sub: termLabel },
    { label: t('enrollments.kpi.returningStudents'), value: kpis.returning, icon: <RiseOutlined />, accent: 'var(--accent-gold)', sub: t('enrollments.kpi.ofTotal', { pct: pct(kpis.returning) }) },
    { label: t('enrollments.kpi.newEntries'), value: kpis.news, icon: <UserAddOutlined />, accent: 'var(--accent-sky)', sub: t('enrollments.kpi.firstTerm') },
    { label: t('enrollments.kpi.pendingRecords'), value: kpis.pending, icon: <ClockCircleOutlined />, accent: 'var(--accent-red)', sub: t('enrollments.kpi.needReview') },
  ];

  return (
    <MotionDiv className="mat-kpis" variants={reduce ? undefined : staggerContainer} initial="hidden" animate="visible">
      {cards.map((c) => (
        <MotionDiv key={c.label} variants={reduce ? undefined : staggerItem}>
          <KpiCard label={c.label} value={c.value} icon={c.icon} accent={c.accent} sub={c.sub} />
        </MotionDiv>
      ))}
    </MotionDiv>
  );
}

export default EnrollmentKpis;
