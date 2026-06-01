import { useCallback } from 'react';
import { Alert, Spin } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useDocentesFormContext } from '@application-docentes/hooks';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { Button } from '@atoms';
import { WizardForm } from '@organisms';
import DocenteFormIdentidadVisualSection from '@docentes/components/organisms/DocenteFormIdentidadVisualSection';
import '@docentes/styles/docentes-form.css';

const DocentesForm = () => {
  const {
    pageTitle,
    breadcrumbItems,
    loading,
    error,
    submitLoading,
    form,
    wizardMountKey,
    wizardSteps,
    wizardInitialValues,
    resolveOptions,
    onValidateBeforeNext,
    finishLabel,
    handleVolver,
    handleFinish,
    isInvalidEditId,
  } = useDocentesFormContext();

  const renderSectionContent = useCallback(
    (stepIndex, sectionKey, _section, wizardForm) => {
      if (stepIndex === 1 && sectionKey === 'identidadVisual') {
        return (
          <DocenteFormIdentidadVisualSection
            form={wizardForm}
            initialColorHex={wizardForm.getFieldValue('colorHex')}
          />
        );
      }
      return null;
    },
    [],
  );

  if (isInvalidEditId) {
    return (
      <PageTemplate
        header={
          <PageHeader
            title={pageTitle}
            breadcrumbItems={breadcrumbItems}
            actions={
              <Button variant="back" icon={<ArrowLeftOutlined />} onClick={handleVolver}>
                Volver
              </Button>
            }
          />
        }
      >
        <Alert type="error" showIcon title="Identificador de docente inválido" />
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      header={
        <PageHeader
          title={pageTitle}
          breadcrumbItems={breadcrumbItems}
          actions={
            <Button variant="back" icon={<ArrowLeftOutlined />} onClick={handleVolver}>
              Volver
            </Button>
          }
        />
      }
      sidebar={null}
    >
      <Spin spinning={loading}>
        {error ? <Alert type="error" showIcon message={error} style={{ marginBottom: 16 }} /> : null}
        {!loading ? (
          <WizardForm
            key={wizardMountKey}
            className="doc-docente-form-wizard"
            steps={wizardSteps}
            form={form}
            loading={submitLoading}
            viewMode={false}
            resolveOptions={resolveOptions}
            initialValues={wizardInitialValues}
            onFinish={handleFinish}
            showSaveButton={false}
            renderSectionContent={renderSectionContent}
            onValidateBeforeNext={onValidateBeforeNext}
            finishLabel={finishLabel}
            nextLabel="Siguiente"
            prevLabel="Anterior"
          />
        ) : null}
      </Spin>
    </PageTemplate>
  );
};

export default DocentesForm;
