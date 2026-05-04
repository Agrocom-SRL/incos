/**
 * Modal alta / edición de curso en la oferta del paralelo (misma config que paraleloCursoOfertaFields).
 */

import { useCallback, useEffect, useMemo } from 'react';
import { App, Form, Modal, Space } from 'antd';
import { FormSection } from '@molecules';
import { Button } from '@atoms';
import { createParaleloCursoOfertaFields } from '../config/paraleloCursoOfertaFields';

const DEFAULT_COLOR_HEX = '#1890ff';

const ParaleloCursoOfertaModal = ({
    open,
    onClose,
    isEdit,
    cursoEdit,
    missingSubjects,
    /** Tras guardar exitoso (p. ej. recargar oferta) */
    onSaved,
    initialAsignaturaPlanId,
}) => {
    const { message } = App.useApp();
    const [form] = Form.useForm();

    const section = useMemo(() => {
        const { datosCurso } = createParaleloCursoOfertaFields({ isEdit });
        return datosCurso;
    }, [isEdit]);

    const resolveOptions = useCallback(
        (key) => {
            if (key !== 'asignaturasPlanPendientes') return [];
            if (isEdit && cursoEdit?.asignaturaPlanId != null) {
                const id = Number(cursoEdit.asignaturaPlanId);
                return [
                    {
                        value: id,
                        label: `${cursoEdit.materiaSigla || '—'} — ${cursoEdit.materiaNombre || 'Materia'}`,
                    },
                ];
            }
            return (missingSubjects || []).map((m) => ({
                value: Number(m.asignaturaPlanId),
                label: `${m.materiaSigla || '—'} — ${m.materiaNombre || `Plan #${m.asignaturaPlanId}`}`,
            }));
        },
        [isEdit, cursoEdit, missingSubjects],
    );

    useEffect(() => {
        if (!open) return;
        if (isEdit && cursoEdit) {
            form.setFieldsValue({
                asignaturaPlanId: Number(cursoEdit.asignaturaPlanId),
                cupoMinimo: cursoEdit.cupoMinimo ?? 10,
                cupoMaximo: cursoEdit.cupoMaximo ?? 35,
                colorHex: cursoEdit.colorHex || DEFAULT_COLOR_HEX,
            });
            return;
        }
        if (!isEdit) {
            const apNum =
                initialAsignaturaPlanId != null && initialAsignaturaPlanId !== ''
                    ? Number(initialAsignaturaPlanId)
                    : NaN;
            form.setFieldsValue({
                asignaturaPlanId: Number.isFinite(apNum) ? apNum : undefined,
                cupoMinimo: 10,
                cupoMaximo: 35,
                colorHex: DEFAULT_COLOR_HEX,
            });
        }
    }, [open, isEdit, cursoEdit, initialAsignaturaPlanId, form]);

    const handleOk = () => {
        form.validateFields()
            .then(() => {
                message.success('Datos listos (pendiente de conectar POST / PUT).');
                onSaved?.();
                onClose();
            })
            .catch(() => {});
    };

    const title = isEdit ? `Editar curso #${cursoEdit?.cursoId ?? ''}` : 'Nuevo curso del paralelo';

    return (
        <Modal
            title={title}
            open={open}
            onCancel={onClose}
            destroyOnHidden
            width={640}
            footer={
                <Space>
                    <Button variant="default" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button variant="primary" onClick={handleOk}>
                        Guardar
                    </Button>
                </Space>
            }
            styles={{
                body: {
                    marginTop: 24,
                },
            }}
        >
            <Form form={form} layout="horizontal" preserve={false}>
                <FormSection title={section.title} fields={section.fields} form={form} resolveOptions={resolveOptions} />
            </Form>
        </Modal>
    );
};

export default ParaleloCursoOfertaModal;
