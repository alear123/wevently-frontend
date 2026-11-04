import { useState, useMemo, useEffect, useRef } from 'react';

/**
 * Hook de ordenamiento reutilizable con ciclo asc -> desc -> neutral -> asc.
 * @param {Array} items - Lista base (ya filtrada) a ordenar.
 * @param {Object} options
 * @param {string|null} [options.initialKey=null]
 * @param {('asc'|'desc'|null)} [options.initialDirection=null]
 * @param {string} [options.locale='es']
 * @param {string} [options.sensitivity='base']
 * @param {Function} [options.resetPage] - Callback opcional para resetear paginación cuando cambia el sort.
 * @returns {{sortConfig: {key:string|null, direction:'asc'|'desc'|null}, sortedItems: Array, handleSort: Function, clearSort: Function}}
 */
export default function useSort(
  items,
  { initialKey = null, initialDirection = null, locale = 'es', sensitivity = 'base', resetPage, storageKey } = {}
) {
  // Carga inicial desde localStorage (solo client-side)
  const loadedFromStorage = useRef(false);
  const [sortConfig, setSortConfig] = useState(() => {
    if (typeof window !== 'undefined' && storageKey) {
      try {
        const raw = localStorage.getItem(storageKey);
        if (raw) {
          const parsed = JSON.parse(raw);
            if (parsed && (parsed.key === null || typeof parsed.key === 'string')) {
              return { key: parsed.key, direction: parsed.direction };
            }
        }
      } catch (e) {
        // noop
      }
    }
    return { key: initialKey, direction: initialDirection };
  });
  loadedFromStorage.current = true;

  // Persistir cambios
  useEffect(() => {
    if (!storageKey || typeof window === 'undefined') return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(sortConfig));
    } catch (e) {
      // noop
    }
  }, [sortConfig, storageKey]);

  const sortedItems = useMemo(() => {
    if (!sortConfig.key) return items;
    const sorted = [...items].sort((a, b) => {
      const va = a[sortConfig.key];
      const vb = b[sortConfig.key];
      if (va == null && vb == null) return 0;
      if (va == null) return 1; // valores nulos al final
      if (vb == null) return -1;
      // Si ambos son numéricos reales, orden numérico
      const na = typeof va === 'number' ? va : (typeof va === 'string' && va.trim() !== '' && !isNaN(Number(va)) ? Number(va) : null);
      const nb = typeof vb === 'number' ? vb : (typeof vb === 'string' && vb.trim() !== '' && !isNaN(Number(vb)) ? Number(vb) : null);
      if (na != null && nb != null) return na - nb;
      return String(va).localeCompare(String(vb), locale, { sensitivity });
    });
    if (sortConfig.direction === 'desc') sorted.reverse();
    return sorted;
  }, [items, sortConfig, locale, sensitivity]);

  const handleSort = (key) => {
    setSortConfig(prev => {
      let next;
      if (prev.key !== key) next = { key, direction: 'asc' };
      else if (prev.direction === 'asc') next = { key, direction: 'desc' };
      else if (prev.direction === 'desc') next = { key: null, direction: null };
      else next = { key, direction: 'asc' };
      if (resetPage) resetPage();
      return next;
    });
  };

  const clearSort = () => setSortConfig({ key: null, direction: null });

  return { sortConfig, sortedItems, handleSort, clearSort };
}
