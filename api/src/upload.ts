import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { supabase } from './config/supabase';

// Limites de tamanho de arquivo
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
export const MAX_DOCUMENT_SIZE = 25 * 1024 * 1024; // 25 MB

// Whitelist de MIME types e extensões permitidas
const ALLOWED_MIME_TYPES = new Set([
  // Imagens
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  // Documentos
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]);

const ALLOWED_EXTENSIONS = new Set([
  'jpg', 'jpeg', 'png', 'webp', 'gif',
  'pdf', 'doc', 'docx'
]);

// Configuração de Armazenamento em Memória para processamento antes do upload
const storage = multer.memoryStorage();

// Filtro de arquivos estrito contra extensões perigosas (.exe, .sh, .php, .html, .svg com scripts, etc.)
const fileFilter: multer.Options['fileFilter'] = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return cb(new Error(`Extensão de arquivo '.${ext}' não é permitida por razões de segurança.`));
  }

  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    return cb(new Error(`Tipo MIME '${file.mimetype}' não é permitido.`));
  }

  cb(null, true);
};

export const upload = multer({
  storage,
  limits: {
    fileSize: MAX_DOCUMENT_SIZE,
    files: 1
  },
  fileFilter
});

export type StorageBucketType = 'public-assets' | 'private-documents';

interface UploadOptions {
  file: Express.Multer.File;
  bucket?: StorageBucketType;
  folder?: string;
  isPrivate?: boolean;
}

export interface UploadResult {
  url?: string;
  path: string;
  bucket: StorageBucketType;
  isPrivate: boolean;
  fileName: string;
  size: number;
  mimeType: string;
}

/**
 * Envia arquivo com segurança para o Supabase Storage
 * Segrega entre bucket público (public-assets) e bucket privado (private-documents)
 */
export async function uploadToStorage(options: UploadOptions): Promise<UploadResult> {
  const { file, isPrivate = false, folder = 'general' } = options;

  const bucket: StorageBucketType = isPrivate ? 'private-documents' : 'public-assets';

  // Sanitização de nome de arquivo e geração de identificador criptográfico único
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  const randomHex = crypto.randomBytes(16).toString('hex');
  const safeFileName = `${Date.now()}-${randomHex}.${ext}`;
  const cleanFolder = folder.replace(/[^a-zA-Z0-9-_]/g, '');
  const storagePath = `${cleanFolder}/${safeFileName}`;

  // Validação de tamanho por tipo de arquivo
  if (file.mimetype.startsWith('image/') && file.size > MAX_IMAGE_SIZE) {
    throw new Error(`Imagem excede o limite máximo permitido de ${MAX_IMAGE_SIZE / (1024 * 1024)}MB.`);
  }

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(storagePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false
    });

  if (error) {
    console.error(`[STORAGE]: Erro ao enviar para bucket '${bucket}':`, error);
    // Tenta fallback para bucket 'media' caso o bucket novo ainda não tenha sido criado manualmente no Supabase
    if (error.message?.includes('Bucket not found') || (error as any).statusCode === '404') {
      const fallbackBucket = 'media';
      const { data: fbData, error: fbError } = await supabase.storage
        .from(fallbackBucket)
        .upload(storagePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false
        });

      if (fbError) {
        throw new Error(`Falha no armazenamento: ${fbError.message}`);
      }

      if (!isPrivate) {
        const { data: publicData } = supabase.storage.from(fallbackBucket).getPublicUrl(storagePath);
        return {
          url: publicData.publicUrl,
          path: storagePath,
          bucket: 'public-assets',
          isPrivate: false,
          fileName: safeFileName,
          size: file.size,
          mimeType: file.mimetype
        };
      }
    }
    throw new Error(`Erro no upload: ${error.message}`);
  }

  if (!isPrivate) {
    const { data: publicData } = supabase.storage
      .from(bucket)
      .getPublicUrl(storagePath);

    return {
      url: publicData.publicUrl,
      path: storagePath,
      bucket,
      isPrivate: false,
      fileName: safeFileName,
      size: file.size,
      mimeType: file.mimetype
    };
  }

  return {
    path: storagePath,
    bucket,
    isPrivate: true,
    fileName: safeFileName,
    size: file.size,
    mimeType: file.mimetype
  };
}

/**
 * Gera URL temporária e assinada para acesso a documentos privados
 * Validade padrão: 30 minutos (1800 segundos)
 */
export async function getSignedDocumentUrl(
  storagePath: string,
  expiresInSeconds: number = 1800,
  bucket: StorageBucketType = 'private-documents'
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(storagePath, expiresInSeconds);

  if (error || !data?.signedUrl) {
    console.error('[STORAGE]: Erro ao gerar Signed URL:', error);
    throw new Error('Não foi possível gerar o link seguro de acesso ao arquivo.');
  }

  return data.signedUrl;
}

// Compatibilidade com código legado
export async function uploadToSupabase(file: Express.Multer.File): Promise<string> {
  const res = await uploadToStorage({ file, isPrivate: false });
  return res.url || '';
}
