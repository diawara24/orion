import { environment } from '@env/environment';

const apiBaseUrl = environment.apiBaseUrl.replace(/\/$/, '');
const publicAuthEndpoints = ['/auth/login', '/auth/register'];

export function isOrionApiRequest(url: string): boolean {
  return url === apiBaseUrl || url.startsWith(`${apiBaseUrl}/`);
}

export function isPublicAuthRequest(url: string): boolean {
  const requestPath = url.split('?')[0];
  return publicAuthEndpoints.some((endpoint) => requestPath.endsWith(endpoint));
}
