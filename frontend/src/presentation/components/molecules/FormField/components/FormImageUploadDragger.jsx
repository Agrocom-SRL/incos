/**
 * Upload de imagen: preview a pantalla completa + capa clickeable encima (sin depender del layout interno de Ant Upload).
 * Form.Item con valuePropName="fileList" inyecta la prop fileList (no value).
 */
import { useCallback } from 'react';
import { App, Form, Upload, Typography } from 'antd';
import { InboxOutlined, UploadOutlined } from '@ant-design/icons';
import { buildCarreraImageUrl } from '@application-configuracion/academico/utils/buildCarreraImageUrl';
import { useImageUploadPreviewUrl } from '../hooks/useImageUploadPreviewUrl';

const { Dragger } = Upload;
const { Text } = Typography;

const IMAGE_EXT_RE = /\.(jpe?g|png|webp|gif|bmp|tiff?|svg|avif|heic|heif)$/i;

const isImageFile = (file) => {
  if (!file) return false;
  if (file.type?.startsWith('image/')) return true;
  return IMAGE_EXT_RE.test(file.name || '');
};

const DEFAULT_ACCEPT = 'image/*,.jpg,.jpeg,.png,.webp,.gif,.bmp,.tiff,.tif,.svg,.avif,.heic,.heif';

const fileListFromUploadEvent = (e) => {
  if (Array.isArray(e)) return e;
  return e?.fileList;
};

const enrichFileListWithPreview = (nextList) => {
  if (!Array.isArray(nextList) || nextList.length === 0) {
    return [];
  }
  return nextList.slice(0, 1).map((file) => {
    const origin = file.originFileObj ?? file;
    if (origin instanceof File) {
      return {
        ...file,
        originFileObj: origin,
        status: 'done',
        percent: 100,
      };
    }
    return file;
  });
};

const resolveControlledFileList = (fileListProp, value) => {
  if (Array.isArray(fileListProp)) return fileListProp;
  if (Array.isArray(value)) return value;
  return [];
};

const FormImageUploadDragger = ({
  fileList: fileListProp,
  value,
  onChange,
  disabled,
  readOnly,
  field,
  form,
}) => {
  const { message } = App.useApp();
  const d = disabled || readOnly;
  const fileList = resolveControlledFileList(fileListProp, value);
  const previewField = field.previewField || 'imagenRuta';
  const watchedPath = Form.useWatch(form ? previewField : [], form);
  const storedPath = form ? watchedPath : null;
  const hasLocalFile = Boolean(fileList[0]);
  // Por defecto resuelve rutas de Carrera (`uploads/carreras/...`); otros
  // consumidores (p. ej. QR de cuenta, que ya guarda una URL completa) pasan
  // `field.buildPreviewUrl` propio en vez de acoplarse a Carrera.
  const resolvePreviewUrl = field.buildPreviewUrl || buildCarreraImageUrl;

  const previewUrl = useImageUploadPreviewUrl(
    fileList,
    hasLocalFile ? null : () => resolvePreviewUrl(storedPath),
  );
  const hasPreview = Boolean(previewUrl);

  // `field.acceptAnyFile`: opt-in aditivo para campos de documento (PDF/DOC además
  // de imagen); el filtro fino lo pone `field.accept`. Sin la prop, se conserva la
  // validación histórica de solo-imagen (carreras, QR de cuenta).
  const handleBeforeUpload = useCallback(
    (file) => {
      if (!field.acceptAnyFile && !isImageFile(file)) {
        message.error('Seleccione un archivo de imagen (JPG, PNG, WEBP, GIF, etc.)');
        return Upload.LIST_IGNORE;
      }
      return false;
    },
    [message, field.acceptAnyFile],
  );

  const handleChange = useCallback(
    ({ fileList: next }) => {
      onChange?.(enrichFileListWithPreview(next));
    },
    [onChange],
  );

  return (
    <div
      className={`form-image-upload${hasPreview ? ' form-image-upload--has-preview' : ''}`}
    >
      {hasPreview ? (
        <img
          key={previewUrl}
          src={previewUrl}
          alt={field.previewAlt || 'Vista previa de la imagen'}
          className="form-image-upload__preview-img"
        />
      ) : null}

      <div className="form-image-upload__layer">
        <div className="form-image-upload__content" aria-hidden={false}>
          <p className="form-image-upload__icon">
            {hasPreview ? <UploadOutlined /> : <InboxOutlined />}
          </p>
          <p className="form-image-upload__title">
            {hasPreview
              ? field.uploadTitleChange || 'Cambiar imagen'
              : field.uploadTitle || 'Arrastre y suelte la imagen aquí'}
          </p>
          <p className="form-image-upload__hint">
            o <span className="form-image-upload__link">haga clic para seleccionar</span>
          </p>
          <Text className="form-image-upload__formats">
            {field.formatsHint || 'Formatos: JPG, PNG, WEBP, GIF, BMP, TIFF y más'}
          </Text>
        </div>

        <Dragger
          className="form-image-upload__hit"
          maxCount={field.maxCount ?? 1}
          beforeUpload={handleBeforeUpload}
          accept={field.accept || DEFAULT_ACCEPT}
          fileList={fileList}
          onChange={handleChange}
          disabled={d}
          showUploadList={false}
        >
          <span className="form-image-upload__hit-target" aria-label="Seleccionar imagen" />
        </Dragger>
      </div>
    </div>
  );
};

export { fileListFromUploadEvent };
export default FormImageUploadDragger;
