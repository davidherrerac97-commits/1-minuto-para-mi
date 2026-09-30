const SESSION_STORAGE_KEY = 'huv_minutos_cuidados_sesion';

let inMemoryMinutes = 0;

export function getSessionCareMinutes(): number {
  if (typeof window === 'undefined') return inMemoryMinutes;
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (raw !== null) {
      const parsed = parseInt(raw, 10);
      return isNaN(parsed) ? inMemoryMinutes : parsed;
    }
    return inMemoryMinutes;
  } catch {
    return inMemoryMinutes;
  }
}

export function incrementSessionCareMinutes(): number {
  const current = getSessionCareMinutes();
  const updated = current + 1;
  inMemoryMinutes = updated;

  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem(SESSION_STORAGE_KEY, updated.toString());
    } catch {
      // Fallback to inMemoryMinutes silently if sessionStorage is restricted
    }
  }

  return updated;
}
