/**
 * URL de vista previa: archivo local (blob, instantáneo) o ruta guardada en servidor.
 */
import { useEffect, useMemo } from 'react';

const resolveLocalFile = (fileList) => {
  const item = fileList?.[0];
  if (!item) return null;
  if (item.originFileObj instanceof File) return item.originFileObj;
  if (item instanceof File) return item;
  return null;
};

export const useImageUploadPreviewUrl = (fileList, resolveStoredUrl) => {
  const localFile = resolveLocalFile(fileList);

  // URL derivada del archivo local (sin estado propio); el effect solo revoca
  // el recurso externo al cambiar de archivo o desmontar.
  const blobUrl = useMemo(
    () => (localFile instanceof File ? URL.createObjectURL(localFile) : null),
    [localFile],
  );

  useEffect(() => {
    if (!blobUrl) return undefined;
    return () => URL.revokeObjectURL(blobUrl);
  }, [blobUrl]);

  if (blobUrl) {
    return blobUrl;
  }

  const stored = fileList?.[0]?.url;
  if (typeof stored === 'string' && stored) {
    return stored;
  }

  if (typeof resolveStoredUrl === 'function') {
    return resolveStoredUrl() ?? null;
  }

  return null;
};
