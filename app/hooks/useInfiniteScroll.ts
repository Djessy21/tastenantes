import { useState, useEffect, useCallback, useRef } from "react";

interface UseInfiniteScrollOptions {
  threshold?: number;
  initialPage?: number;
  enabled?: boolean;
}

/**
 * Hook personnalisé pour gérer le scroll infini
 */
export function useInfiniteScroll({
  threshold = 200,
  initialPage = 1,
  enabled = true,
}: UseInfiniteScrollOptions = {}) {
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);

  // Fonction pour réinitialiser la pagination
  const reset = useCallback(() => {
    setPage(initialPage);
    setHasMore(true);
  }, [initialPage]);

  // Référence à attacher au dernier élément de la liste
  const lastElementRef = useCallback(
    (node: Element | null) => {
      if (!enabled) return;
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            setPage((prevPage) => prevPage + 1);
          }
        },
        { rootMargin: `0px 0px ${threshold}px 0px` }
      );

      if (node) observer.current.observe(node);
    },
    [loading, hasMore, threshold, enabled]
  );

  // Nettoyer l'observer lors du démontage du composant
  useEffect(() => {
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, []);

  return {
    page,
    loading,
    setLoading,
    hasMore,
    setHasMore,
    lastElementRef,
    reset,
  };
}
