/**
 * Formulario de docente — sin identidad visual (color se asigna al vincular materias).
 */

import { Alert, Spin } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useDocentesFormContext } from '@application-docentes/hooks';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { Button } from '@atoms';
import { WizardForm } from '@organisms';
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
