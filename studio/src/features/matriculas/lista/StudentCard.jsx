/**
 * StudentCard — tarjeta de estudiante (vista grid). Organismo LOCAL del feature.
 *
 * Render: acento de carrera, header (avatar + código + nombre + tag de tipo),
 * chip de carrera, bloque de inscripción, píldora de historial, stats y barra de
 * progreso animada (gateada por reduced-motion), footer con acciones. Reusa los
 * átomos compartidos Avatar, StatusPill e IconButton. Textos vía i18n.
 */
import { useEffect, useState } from 'react';
import {
  EyeOutlined,
  EditOutlined,
  MoreOutlined,
  PrinterOutlined,
  MailOutlined,
  FileTextOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { Dropdown } from 'antd';
import { Avatar } from '@ui/atoms/Avatar/Avatar';
import { StatusPill } from '@ui/atoms/StatusPill/StatusPill';
import { IconButton } from '@ui/atoms/IconButton/IconButton';
import { useTranslation } from '@lib/i18n/useTranslation';
import { useReducedMotion } from '@lib/motion/useReducedMotion';
import { historyStateOf, HISTORY_ICONS } from './historyStates';
import { pagoStatusOf } from './pagoStatus';

function MetaRow({ label, value }) {
  if (value == null || value === '' || value === '—') return null;
  return (
    <div className="mat-card__meta-row">
      <span className="mat-card__meta-label">{label}</span>
      <span className="mat-card__meta-value">{value}</span>
    </div>
  );
}

function Stat({ label, value, accent = false }) {
  return (
    <div className="mat-card__stat">
      <div className={`mat-card__stat-value${accent ? ' mat-card__stat-value--accent' : ''}`}>{value}</div>
      <div className="mat-card__stat-label">{label}</div>
    </div>
  );
}

export function StudentCard({ row, onOpen, onView, onEdit, onPrint, onEmail, onReport, onDelete }) {
  const { t } = useTranslation();
  const reduce = useReducedMotion();

  const progress = Math.min(100, Math.round((Number(row.semestre) / 6) * 100));
  const histState = historyStateOf(row.historialKey);
  const HistIcon = HISTORY_ICONS[histState.iconKey];
  const promedio = row.promedio ?? '—';
  const periodoLabel = [row.periodoNombre, row.paralelo].filter(Boolean).join(' · ');
  const pagoLabel = row.estadoPago
    ? t(pagoStatusOf(row.estadoPago).tone === 'ok' ? 'enrollments.payment.upToDate' : 'enrollments.payment.pending')
    : null;

  // Anima el llenado de la barra de 0 al valor real (explica el dato). En
  // reduced-motion se renderiza el valor final directamente.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    if (reduce) return undefined;
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, [reduce]);
  const fillWidth = reduce || mounted ? progress : 0;

  const menu = {
    items: [
      { key: 'print', icon: <PrinterOutlined />, label: t('enrollments.actions.print'), onClick: () => onPrint?.(row) },
      { key: 'email', icon: <MailOutlined />, label: t('enrollments.actions.email'), onClick: () => onEmail?.(row) },
      { key: 'report', icon: <FileTextOutlined />, label: t('enrollments.actions.report'), onClick: () => onReport?.(row) },
      { type: 'divider' },
      { key: 'delete', icon: <DeleteOutlined />, label: t('enrollments.actions.delete'), danger: true, onClick: () => onDelete?.(row) },
    ],
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen?.(row)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onOpen?.(row);
      }}
      className="mat-card"
      style={{ '--card-career-color': row.career.color }}
    >
      <div className="mat-card__accent" aria-hidden />

      <div className="mat-card__header">
        <Avatar name={row.fullName} size={52} tone={row.career.color} />
        <div className="mat-card__identity">
          <div className="mat-card__code">#{row.codigo}</div>
          <div className="mat-card__name">{row.fullName}</div>
        </div>
        <span className="mat-card__tipo" data-antiguo={row.isAntiguo ? 'true' : 'false'}>
          {t(`enrollments.type.${row.typeKey}`)}
        </span>
      </div>

      <div className="mat-card__body">
        <div className="mat-card__career" title={row.career.name}>
          <span className="mat-card__career-dot" aria-hidden />
          <span className="mat-card__career-label">{row.career.name}</span>
        </div>

        <div className="mat-card__enrollment">
          <MetaRow label={t('enrollments.card.ci')} value={row.ci} />
          <MetaRow label={t('enrollments.card.term')} value={row.gestion} />
          <MetaRow label={t('enrollments.card.enrolled')} value={row.fecha} />
          <MetaRow label={t('enrollments.card.period')} value={periodoLabel} />
          <MetaRow label={t('enrollments.card.payment')} value={pagoLabel} />
        </div>
      </div>

      <div className="mat-card__status">
        <StatusPill tone={histState.tone} icon={HistIcon ? <HistIcon /> : null}>
          {t(`enrollments.history.${row.historialKey}`)}
        </StatusPill>
      </div>

      <div className="mat-card__stats">
        <Stat label={t('enrollments.card.semester')} value={`${row.semestre}°`} />
        <Stat label={t('enrollments.card.subjects')} value={row.materias} />
        <Stat label={t('enrollments.card.average')} value={promedio} accent />
      </div>

      <div className="mat-card__progress">
        <div className="mat-card__progress-head">
          <span>{t('enrollments.card.progress')}</span>
          <span>{progress}%</span>
        </div>
        <div className="mat-card__progress-track">
          <div className="mat-card__progress-fill" style={{ width: `${fillWidth}%` }} />
        </div>
      </div>

      <div
        className="mat-card__footer"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <IconButton
          tone="info"
          icon={<EyeOutlined />}
          label={t('enrollments.actions.view')}
          className="mat-card__btn-primary"
          onClick={() => (onView ? onView(row) : onOpen?.(row))}
        />
        <IconButton tone="warning" icon={<EditOutlined />} label={t('enrollments.actions.edit')} onClick={() => onEdit?.(row)} />
        <Dropdown menu={menu} trigger={['click']} placement="bottomRight">
          <span onClick={(e) => e.stopPropagation()}>
            <IconButton tone="muted" icon={<MoreOutlined />} label={t('enrollments.actions.more')} />
          </span>
        </Dropdown>
      </div>
    </div>
  );
}

export default StudentCard;
