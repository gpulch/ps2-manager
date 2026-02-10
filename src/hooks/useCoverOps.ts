import { useState, useCallback, useMemo } from 'react';
import type { GameInfo } from '../types';
import { useToast } from '../ui/Toast';
import {
  autoFetchCover,
  deleteCover as deleteCoverAction,
} from '../actions/covers';

const updateGameCoverStatus = (
  games: GameInfo[],
  gameId: string,
  hasCover: boolean,
  coverPath: string | null,
): GameInfo[] =>
  games.map((game) =>
    game.id === gameId
      ? { ...game, has_cover: hasCover, cover_path: coverPath }
      : game,
  );

const getGamesWithoutCovers = (games: GameInfo[]): GameInfo[] =>
  games.filter((game) => !game.has_cover && game.id);

const formatFetchProgress = (
  current: number,
  total: number,
  currentId?: string,
): string =>
  currentId ? `${current}/${total}: ${currentId}` : `${current}/${total} done`;

export const useCoverOps = ({
  games,
  setGames,
  currentRoot,
}: {
  games: GameInfo[];
  setGames: (updater: (prev: GameInfo[]) => GameInfo[]) => void;
  currentRoot: () => string | null;
}) => {
  const [fetchingCovers, setFetchingCovers] = useState(false);
  const [fetchProgress, setFetchProgress] = useState<string | null>(null);
  const toast = useToast();

  const deleteCover = useCallback(
    async (id?: string): Promise<void> => {
      const root = currentRoot();
      console.log('[deleteCover]', { root, id });
      if (!root || !id) {
        console.log('  Missing root or id');
        return;
      }
      await deleteCoverAction(root, id);
      console.log('  Backend delete successful');
      setGames((prev) => updateGameCoverStatus(prev, id, false, null));
      console.log('  Game state updated');
      toast.show(`Cover deleted for ${id}`, 'info', 2000);
    },
    [currentRoot, setGames, toast],
  );

  const autoFetchCoverFor = useCallback(
    async (id?: string, title?: string, silent = false): Promise<void> => {
      const root = currentRoot();
      if (!root || !id) return;

      try {
        const dest = await autoFetchCover(root, id, title ?? null, true);
        console.log('Cover fetch successful:', { id, dest });
        setGames((prev) => {
          const updated = updateGameCoverStatus(prev, id, true, dest);
          console.log('   → Updated game state for', id);
          return updated;
        });
        if (!silent) {
          toast.show(`Cover fetched for ${id}`, 'success', 3000);
        }
      } catch (error) {
        if (!silent) {
          const errorMsg = String(error);
          if (errorMsg.includes('no cover found')) {
            toast.show(
              `No cover found for ${id}. Try manual upload or check if game ID is correct.`,
              'warning',
              5000,
            );
          } else {
            toast.show(
              `Failed to fetch cover for ${id}: ${errorMsg}`,
              'danger',
              5000,
            );
          }
        }
        throw error; // Re-throw so batch operation can count failures
      }
    },
    [currentRoot, setGames, toast],
  );

  // Memoize games without covers to avoid recalculation
  const missingCovers = useMemo(() => getGamesWithoutCovers(games), [games]);

  const autoFetchMissingCovers = useCallback(async (): Promise<void> => {
    const root = currentRoot();
    if (!root) {
      toast.show('Please select a library or disk first', 'warning');
      return;
    }

    if (missingCovers.length === 0) {
      toast.show('No games with missing covers found', 'info');
      return;
    }

    setFetchingCovers(true);
    setFetchProgress('');
    toast.show(
      `Fetching ${missingCovers.length} missing cover${missingCovers.length > 1 ? 's' : ''}...`,
      'info',
      2000,
    );

    try {
      let successCount = 0;
      let failCount = 0;

      for (const game of missingCovers) {
        setFetchProgress(
          formatFetchProgress(
            successCount + failCount,
            missingCovers.length,
            game.id,
          ),
        );
        try {
          // Use silent=true to suppress individual toasts during batch operation
          await autoFetchCoverFor(game.id, game.title_guess, true);
          successCount++;
        } catch (error) {
          failCount++;
          console.warn(`Failed to fetch cover for ${game.id}:`, error);
        }
      }

      setFetchProgress(null);

      // Show ONE summary toast at the end
      if (successCount > 0 && failCount === 0) {
        toast.show(
          `Successfully fetched all ${successCount} cover${successCount > 1 ? 's' : ''}`,
          'success',
          5000,
        );
      } else if (successCount > 0 && failCount > 0) {
        toast.show(
          `Fetched ${successCount} of ${missingCovers.length} covers (${failCount} not found in GameTDB)`,
          'warning',
          6000,
        );
      } else {
        toast.show(
          `No covers found. Games may not be in GameTDB database or check IDs format.`,
          'danger',
          6000,
        );
      }
    } finally {
      setFetchingCovers(false);
    }
  }, [currentRoot, missingCovers, autoFetchCoverFor, toast]);

  return {
    deleteCover,
    autoFetchCoverFor,
    autoFetchMissingCovers,
    fetchingCovers,
    fetchProgress,
  };
};
