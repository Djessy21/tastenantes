"use client";

interface ScrollStatusProps {
  currentCount: number;
  hasMore: boolean;
  loading: boolean;
  totalLoaded?: number;
}

export default function ScrollStatus({
  currentCount,
  hasMore,
  loading,
  totalLoaded,
}: ScrollStatusProps) {
  return (
    <div className="text-center py-2 text-xs text-gray-500">
      {loading ? (
        <span>Chargement en cours...</span>
      ) : hasMore ? (
        <span>
          {currentCount} éléments affichés
          {totalLoaded ? ` sur ${totalLoaded} chargés` : ""}
          <br />
          <span className="italic">Faites défiler pour voir plus</span>
        </span>
      ) : (
        <span>
          {currentCount} éléments affichés
          {totalLoaded ? ` sur ${totalLoaded} chargés` : ""}
          <br />
          <span className="font-medium">Vous avez tout vu !</span>
        </span>
      )}
    </div>
  );
}
