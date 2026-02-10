import { invoke } from '@tauri-apps/api/core';
import type { GameMetadata } from '../types/metadata';

export const fetchGameMetadata = async (
  gameTitle: string,
  gameId?: string,
): Promise<GameMetadata> => {
  console.log('[fetchGameMetadata]', gameTitle);

  try {
    const metadata = await invoke<GameMetadata>('fetch_game_metadata', {
      gameTitle,
      gameId: gameId || null,
    });

    console.log('   ✅ Metadata fetched:', metadata);
    return metadata;
  } catch (error) {
    console.error('   ❌ Failed to fetch metadata:', error);
    throw error;
  }
};

export const batchFetchMetadata = async (
  games: Array<{ title: string; id?: string }>,
): Promise<Record<string, GameMetadata>> => {
  console.log('[batchFetchMetadata]', games.length, 'games');

  try {
    const gamesParam = games.map((g) => [g.title, g.id || null]);
    const results = await invoke<Record<string, GameMetadata>>(
      'batch_fetch_metadata',
      {
        games: gamesParam,
      },
    );

    console.log(
      '   ✅ Batch fetch complete:',
      Object.keys(results).length,
      'succeeded',
    );
    return results;
  } catch (error) {
    console.error('   ❌ Batch fetch failed:', error);
    throw error;
  }
};
