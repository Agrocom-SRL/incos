/**
 * InscripcionesNueva - Página para inscribir estudiante nuevo
 * 
 * Single Responsibility: Renderizar la UI de inscripción consumiendo datos del Provider
 * 
 * Atomic Design: Page
 * - Solo consume datos del contexto (Provider)
 * - No contiene lógica, solo renderiza
 * - Pasa HEADER al Template (estructura)
 * - Pasa contenido al Template (wizard/form se agregará en pasos siguientes)
 * 
 * Arquitectura:
 * Page → Template (header) + Organism (wizard/form)
 * - Template maneja: estructura/layout (header, content, sidebar, bottom)
 * - Organism maneja: funcionalidad (wizard, pasos, validación, guardado)
 * 
 * Nota: Esta es una versión base que se irá completando por pasos
 */

import { useEffect, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { App } from 'antd';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { WizardForm } from '@organisms';
import {
  InscripcionesCarreraStepContent,
  InscripcionesPeriodoParalelosStepContent,
  InscripcionesPeriodoMateriasStepContent,
} from '@inscripciones/components/organisms';
import { useInscripcionesNuevaContext } from '@application-inscripciones/hooks';
import { downloadFile } from '@application/utils/fileDownload';

const InscripcionesNueva = () => {
  const location = useLocation();
  const { message } = App.useApp();

  const context = useInscripcionesNuevaContext();
  // editData: desde contexto (cuando se entra por /inscripciones/:id/editar) o desde location.state (cuando se entra por /inscripciones/nueva con state)
  const editData = context.editData ?? (location.state?.mode === 'editar' ? location.state : null);

  const {
    pageTitle,
    breadcrumbItems,
    wizardSteps,
  } = context;

  // Handlers y estados del formulario (desde useInscripcionNuevaFormHandlers - spread de formHandlers)
  // Incluye: form (creado y registrado automáticamente), handleFinish, handleSave, loading, error, etc.
  const {
    form,
    loading = false,
    error = null,
    handleFinish,
    handleSave,
    inscripcionResult,
  } = context;

  // Descargar automáticamente el formulario cuando la inscripción se complete exitosamente
  useEffect(() => {
    if (inscripcionResult?.success && inscripcionResult?.data?.formularioInscripcion) {
      const { filePath, fileName } = inscripcionResult.data.formularioInscripcion;
      if (filePath && fileName) {
        // Delay más largo para asegurar que el archivo esté disponible
        // La generación puede tomar tiempo (Word + conversión a PDF)
        setTimeout(() => {
          try {
            downloadFile(filePath, fileName);
          } catch (err) {
            console.error('Error al descargar el formulario de inscripción:', err);
          }
        }, 3000); // 3 segundos para dar tiempo a la generación completa
      }
    }
  }, [inscripcionResult]);

  // Búsqueda de estudiantes, carreras, periodos, paralelos y materias (step 1 carrera, step 2 periodo/materias, step 3 paralelos)
  const {
    studentSearch,
    carrerasData,
    periodosData,
    paralelosData,
    materiasByPeriodsData,
    selectedMateriaIdsByPeriod,
    onToggleMaterias,
    onSelectParalelo,
  } = context;

  // Pasos (stepIndex 0-based): 0=Estudiante, 1=Carrera, 2=Periodo y materias, 3=Paralelo
  // Lanzamiento: ANTIGUO (CONTINUIDAD/REINGRESO) → step 3 (Periodo y materias); NUEVO → step 4 (Paralelo)
  const initialStep = useMemo(() => {
    const isNuevoByTipo = (tipo) => String(tipo ?? '').toUpperCase() === 'NUEVO';
    if (editData) {
      return isNuevoByTipo(editData.tipoInscripcion) ? 3 : 2; // NUEVO → Paralelo (4); ANTIGUO → Periodo y materias (3)
    }
    const hasStudent = studentSearch?.selectedStudent && !studentSearch?.loading;
    if (hasStudent && carrerasData?.selectedCarrera) {
      const tipo = studentSearch.selectedStudent?.tipoAdmision ?? studentSearch.selectedStudent?.tipoInscripcion;
      return isNuevoByTipo(tipo) ? 3 : 2;
    }
    if (hasStudent) return 1;
    return 0;
  }, [editData, studentSearch?.selectedStudent, studentSearch?.loading, carrerasData?.selectedCarrera]);

  // Pre-cargar valores iniciales del formulario en modo edición
  // Nota: Los paralelos se pre-seleccionan automáticamente mediante los hooks
  // Solo necesitamos pre-cargar la carrera en el formulario
  const initialValues = useMemo(() => {
    if (!editData) {
      return {};
    }

    const values = {};

    // Pre-cargar carrera si está disponible
    if (editData.carreraId && carrerasData?.carreras) {
      const carrera = carrerasData.carreras.find(c => c.id === Number(editData.carreraId));
      if (carrera) {
        values.carrera = carrera.id;
      }
    }

    return values;
  }, [editData, carrerasData?.carreras]);

  // Efecto para establecer valores iniciales en el formulario cuando estén disponibles
  useEffect(() => {
    if (editData && form && editData.carreraId && carrerasData?.carreras && carrerasData.carreras.length > 0) {
      const carrera = carrerasData.carreras.find(c => c.id === Number(editData.carreraId));
      if (carrera) {
        form.setFieldsValue({ carrera: carrera.id });
      }
    }
  }, [editData, form, carrerasData?.carreras]);

  // Validación antes de avanzar al siguiente paso
  // IMPORTANTE: stepNumber es 1-based según la numeración visual del wizard:
  // Paso 1: Estudiante a inscribir (no requiere validación, solo búsqueda)
  // Paso 2: Seleccionar Carrera → stepNumber === 2
  // Paso 3: Periodo y materias → stepNumber === 3
  // Paso 4: Paralelo → stepNumber === 4
  const handleValidateBeforeNext = useCallback((stepNumber, formInstance) => {
    return new Promise((resolve, reject) => {
      // Paso 2: Validar que hay carrera seleccionada
      if (stepNumber === 2) {
        const carreraId = formInstance?.getFieldValue('carrera') ?? carrerasData?.selectedCarrera?.id;
        if (!carreraId) {
          message.error('Por favor seleccione una carrera antes de continuar.');
          reject(new Error('Carrera no seleccionada'));
          return;
        }
        resolve();
        return;
      }

      // Paso 3: Validar que hay periodos seleccionados y materias por periodo
      // IMPORTANTE: NO validar paralelos aquí, eso es para el paso 4
      if (stepNumber === 3) {
        const selectedPeriodIds = periodosData?.selectedPeriodIds ?? [];
        
        // Validar periodos seleccionados
        if (!selectedPeriodIds.length) {
          message.error('Por favor seleccione al menos un periodo académico antes de continuar.');
          reject(new Error('Periodos no seleccionados'));
          return;
        }

        // Validar materias seleccionadas por periodo
        const tipoAdmision = studentSearch?.selectedStudent?.tipoAdmision;
        const isNuevo = tipoAdmision === 'NUEVO';
        
        // Para estudiantes nuevos, las materias se auto-seleccionan, solo validar periodos
        // NO validar paralelos aquí - eso se hace en el paso 3
        if (!isNuevo) {
          const periodosSinMaterias = selectedPeriodIds.filter((periodId) => {
            const materiasDelPeriodo = selectedMateriaIdsByPeriod?.[periodId] ?? [];
            return materiasDelPeriodo.length === 0;
          });

          if (periodosSinMaterias.length > 0) {
            const periodosNombres = periodosSinMaterias
              .map((pid) => {
                const periodo = periodosData?.periodos?.find((p) => p.id === pid);
                return periodo?.nombre ?? `Periodo ${pid}`;
              })
              .join(', ');
            message.error(`Por favor seleccione al menos una materia para: ${periodosNombres}`);
            reject(new Error('Materias no seleccionadas'));
            return;
          }
        }
        
        // Paso 3 validado correctamente - NO validar paralelos aquí
        resolve();
        return;
      }

      // Paso 4: Validar que hay paralelos seleccionados por periodo
      // IMPORTANTE: Esta validación SOLO debe ejecutarse cuando stepNumber === 4
      if (stepNumber === 4) {
        const selectedPeriodIds = periodosData?.selectedPeriodIds ?? [];
        const selectedParalelosByPeriod = paralelosData?.selectedParalelosByPeriod ?? {};
        const paralelosLoading = paralelosData?.loading ?? false;
        const paralelosAvailable = (paralelosData?.paralelos ?? []).length > 0;

        if (!selectedPeriodIds.length) {
          message.error('No hay periodos seleccionados. Por favor regrese al paso anterior.');
          reject(new Error('Periodos no seleccionados'));
          return;
        }

        // Si los paralelos aún se están cargando, esperar
        if (paralelosLoading) {
          message.warning('Cargando paralelos disponibles. Por favor espere...');
          reject(new Error('Paralelos cargando'));
          return;
        }

        // Si no hay paralelos disponibles, informar al usuario
        if (!paralelosAvailable) {
          message.error('No hay paralelos disponibles para los periodos seleccionados. Por favor regrese al paso anterior y seleccione otros periodos.');
          reject(new Error('No hay paralelos disponibles'));
          return;
        }

        // Validar que cada periodo tiene un paralelo seleccionado
        const periodosSinParalelo = selectedPeriodIds.filter((periodId) => {
          return !selectedParalelosByPeriod[periodId]?.id;
        });

        if (periodosSinParalelo.length > 0) {
          const periodosNombres = periodosSinParalelo
            .map((pid) => {
              const periodo = periodosData?.periodos?.find((p) => p.id === pid);
              return periodo?.nombre ?? `Periodo ${pid}`;
            })
            .join(', ');
          message.error(`Por favor seleccione un paralelo para: ${periodosNombres}`);
          reject(new Error('Paralelos no seleccionados'));
          return;
        }

        resolve();
        return;
      }

      // Otros pasos: permitir avanzar sin validación adicional
      resolve();
    });
  }, [carrerasData?.selectedCarrera, periodosData, selectedMateriaIdsByPeriod, paralelosData?.selectedParalelosByPeriod, paralelosData?.loading, paralelosData?.paralelos, studentSearch?.selectedStudent?.tipoAdmision]);

  // Contenido custom por paso
  // IMPORTANTE: stepIndex es 0-based según la estructura del array de pasos:
  // Paso visual 1 (Estudiante) → stepIndex = 0
  // Paso visual 2 (Carrera) → stepIndex = 1
  // Paso visual 3 (Periodo y materias) → stepIndex = 2
  // Paso visual 4 (Paralelo) → stepIndex = 3
  const renderSectionContent = useCallback(
    (stepIndex, sectionKey, section, form) => {
      // Paso visual 2: Seleccionar Carrera (stepIndex = 1). En edición, estudiante y carrera son solo lectura.
      if (stepIndex === 1 && sectionKey === 'carrera') {
        return (
          <InscripcionesCarreraStepContent
            key={sectionKey}
            form={form}
            section={section}
            carreras={carrerasData?.carreras ?? []}
            carrerasLoading={carrerasData?.loading ?? false}
            carrerasError={carrerasData?.error ?? null}
            selectedStudent={studentSearch?.selectedStudent ?? null}
            onCarreraChange={(carrera) => context.onSelectCarrera?.(carrera?.id)}
            readOnly={!!editData}
          />
        );
      }
      // Paso visual 3: Periodo y materias (stepIndex = 2). En edición NUEVO solo se edita paralelo (este paso es solo lectura).
      if (stepIndex === 2 && sectionKey === 'periodoYMaterias') {
        return (
          <InscripcionesPeriodoMateriasStepContent
            key={sectionKey}
            form={form}
            section={section}
            periodosData={periodosData}
            materiasByPeriodsData={materiasByPeriodsData}
            selectedMateriaIdsByPeriod={selectedMateriaIdsByPeriod}
            onToggleMaterias={onToggleMaterias}
            studentSearch={studentSearch}
            resolveOptions={() => []}
            readOnly={editData?.tipoInscripcion === 'NUEVO'}
            isEditModeAntiguo={!!editData && editData.tipoInscripcion !== 'NUEVO'}
          />
        );
      }
      // Paso visual 4: Paralelo (stepIndex = 3)
      if (stepIndex === 3 && sectionKey === 'paralelos') {
        return (
          <InscripcionesPeriodoParalelosStepContent
            key={sectionKey}
            form={form}
            section={section}
            periodosData={periodosData}
            paralelosData={paralelosData}
            carrerasData={carrerasData}
            onSelectParalelo={onSelectParalelo}
            resolveOptions={() => []}
          />
        );
      }
      return null;
    },
    [
      editData,
      carrerasData?.carreras,
      carrerasData?.loading,
      carrerasData?.error,
      carrerasData,
      studentSearch?.selectedStudent,
      context.onSelectCarrera,
      periodosData,
      paralelosData,
      materiasByPeriodsData,
      selectedMateriaIdsByPeriod,
      onToggleMaterias,
      onSelectParalelo,
    ]
  );

  return (
    <PageTemplate
      header={
        <PageHeader
          title={pageTitle}
          breadcrumbItems={breadcrumbItems}
        />
      }
      sidebar={null}
    >
      {/* Contenido principal - Wizard de inscripción */}
      <WizardForm
        steps={wizardSteps}
        loading={loading}
        viewMode={false}
        resolveOptions={() => []}
        initialValues={initialValues}
        form={form}
        onFinish={handleFinish}
        onSave={handleSave}
        showSaveButton={false}
        initialStep={initialStep}
        renderSectionContent={renderSectionContent}
        onValidateBeforeNext={handleValidateBeforeNext}
      />
    </PageTemplate>
  );
};

export default InscripcionesNueva;
