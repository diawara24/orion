import { HttpErrorResponse } from '@angular/common/http';

/** Format d'erreur commun à l'application, indépendant du client API généré. */
export interface ApiError {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  code?: string;
  errors?: Record<string, string>;
}

// Le corps d'une erreur HTTP peut être du texte, null ou un objet JSON.
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// Remplace les valeurs absentes ou vides par un texte exploitable par l'interface.
function readString(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim().length > 0 ? value : fallback;
}

// Les détails de validation ne sont conservés que s'ils associent chaque champ à un texte.
function readStringRecord(value: unknown): Record<string, string> | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const entries = Object.entries(value);
  return entries.every(([, entry]) => typeof entry === 'string')
    ? Object.fromEntries(entries) as Record<string, string>
    : undefined;
}

/** Convertit une erreur HTTP ou JavaScript en un format stable pour l'application. */
export function toApiError(error: unknown): ApiError {
  if (error instanceof HttpErrorResponse) {
    const body = isRecord(error.error) ? error.error : {};
    const errors = readStringRecord(body['errors']);

    // Angular utilise le statut 0 lorsqu'aucune réponse HTTP n'a été reçue (par exemple, réseau indisponible).
    return {
      type: readString(body['type'], 'about:blank'),
      title: readString(body['title'], error.status === 0 ? 'Erreur réseau' : 'Erreur HTTP'),
      status: error.status,
      detail: readString(
        body['detail'],
        error.status === 0 ? 'Impossible de joindre le serveur.' : 'Une erreur inattendue est survenue.'
      ),
      instance: readString(body['instance'], 'about:blank'),
      ...(typeof body['code'] === 'string' ? { code: body['code'] } : {}),
      ...(errors ? { errors } : {})
    };
  }

  // En dehors d'une réponse HTTP, conserver le message de l'exception s'il existe.
  const detail = error instanceof Error && error.message
    ? error.message
    : 'Une erreur inconnue est survenue.';

  return {
    type: 'about:blank',
    title: 'Erreur inconnue',
    status: 0,
    detail,
    instance: 'about:blank'
  };
}

