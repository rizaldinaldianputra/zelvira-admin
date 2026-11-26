/**
 * Resolves an image URL based on whether it is an absolute link or a relative path from the storage provider.
 * 
 * @param path The image path or full URL
 * @returns The resolved URL string
 */
export function formatImageUrl(path: string | null | undefined): string {
  if (!path) return '';

  const isProd = process.env.NODE_ENV === 'production';
  const defaultStorageUrl = isProd
    ? 'https://s3.zelvira.co.id'
    : 'http://localhost:9000';
  let storageUrl = process.env.NEXT_PUBLIC_STORAGE_URL || defaultStorageUrl;

  // Sanitize misconfigured or legacy storage domains in env
  if (storageUrl.includes('storage.zelvira.my.id')) {
    storageUrl = storageUrl.replace('storage.zelvira.my.id', 's3.zelvira.co.id');
  } else if (storageUrl.includes('storage.zelvira.my.id')) {
    storageUrl = storageUrl.replace('storage.zelvira.my.id', 's3.zelvira.co.id');
  } else if (storageUrl.includes('s3.zelvira.co.id')) {
    storageUrl = storageUrl.replace('s3.zelvira.co.id', 's3.zelvira.co.id');
  }

  const cleanStorageUrl = storageUrl.endsWith('/') ? storageUrl.slice(0, -1) : storageUrl;

  // Handle data URLs directly
  if (path.startsWith('data:')) {
    return path;
  }

  // REPAIR LOGIC: If path contains legacy, misconfigured, or internal storage endpoints
  const legacyOrInternalEndpoints = [
    'storage.zelvira.my.id:9000',
    'storage.zelvira.my.id',
    'storage.zelvira.my.id',
    's3.zelvira.co.id',
    'zelixa-minio:9000',
    'zelvira-minio:9000',
    'minio:9000',
    'localhost:9000',
    '127.0.0.1:9000',
  ];
  const matchedEndpoint = legacyOrInternalEndpoints.find(endpoint => path.includes(endpoint));

  if (matchedEndpoint) {
    const parts = path.split(matchedEndpoint);
    if (parts.length > 1) {
      const cleanPath = parts[1].startsWith('/') ? parts[1] : `/${parts[1]}`;
      return `${cleanStorageUrl}${cleanPath.replace(/\.$/, '')}`;
    }
  }

  // If it's already an absolute public URL (like Google or placeholder), return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // Prepend storage URL to relative paths
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  return `${cleanStorageUrl}${cleanPath}`;
}
