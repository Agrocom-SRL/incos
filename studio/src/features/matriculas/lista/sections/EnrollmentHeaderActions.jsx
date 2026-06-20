/**
 * EnrollmentHeaderActions — acciones del encabezado (export por carrera + nueva).
 * Organismo local: el botón Export se tiñe con el color de la carrera elegida
 * (white-label vía token --export-color). Datos/handlers por props.
 */
import { PlusOutlined, DownloadOutlined } from '@ant-design/icons';
import { Button, Select } from 'antd';
import { useTranslation } from '@lib/i18n/useTranslation';
import './EnrollmentHeaderActions.css';

export function EnrollmentHeaderActions({
  careerSelectOptions,
  selectedCareerForExport,
  onSelectCareer,
  onExport,
  onNew,
}) {
  const { t } = useTranslation();
  const exportColor =
    careerSelectOptions.find((c) => c.value === selectedCareerForExport)?.color || 'var(--brand-600)';

  return (
    <>
      <Select
        className="mat-export-select"
        placeholder={t('enrollments.actions.exportCareerPlaceholder')}
        showSearch
        allowClear
        optionFilterProp="label"
        value={selectedCareerForExport}
        onChange={onSelectCareer}
        options={careerSelectOptions}
      />
      <Button
        icon={<DownloadOutlined />}
        disabled={!selectedCareerForExport}
        className={selectedCareerForExport ? 'mat-export-btn--career' : ''}
        style={selectedCareerForExport ? { '--export-color': exportColor } : undefined}
        onClick={onExport}
      >
        {t('enrollments.actions.export')}
      </Button>
      <Button type="primary" icon={<PlusOutlined />} onClick={onNew}>
        {t('enrollments.actions.newEnrollment')}
      </Button>
    </>
  );
}

export default EnrollmentHeaderActions;
