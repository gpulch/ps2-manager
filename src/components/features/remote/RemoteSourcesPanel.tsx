import { useState, useEffect, useMemo } from 'react';
import { listen } from '@tauri-apps/api/event';
import type { RemoteGame, DownloadProgress } from '../../../types/remote';
import {
  fetchArchiveOrgGames,
  downloadRemoteIsoWithProgress,
} from '../../../actions/remote';
import { Button } from '../../../ui/Button';
import { Input } from '../../../ui/Input';
import { Select } from '../../../ui/Select';
import { ProgressBar } from '../../shared/ProgressBar';
import { LoadingOverlay } from '../../shared/LoadingOverlay';
import { formatFileSize } from '../../../utils';

type SortField = 'name' | 'size';
type SortOrder = 'asc' | 'desc';

const ITEMS_PER_PAGE = 20;

type Props = {
  libraryRoot: string | null;
  onDownloadComplete: () => void;
};

export const RemoteSourcesPanel = ({
  libraryRoot,
  onDownloadComplete,
}: Props) => {
  const [sourceUrl, setSourceUrl] = useState(
    'https://archive.org/download/playstation2_essentials',
  );
  const [games, setGames] = useState<RemoteGame[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [progress, setProgress] = useState<DownloadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const ESSENTIALS_URL = 'https://archive.org/download/playstation2_essentials';
  type Mirror = { label: string; url: string };
  const [mirrors, setMirrors] = useState<Mirror[]>(() => {
    try {
      const raw = localStorage.getItem('ps2_remote_mirrors');
      return raw ? (JSON.parse(raw) as Mirror[]) : [];
    } catch {
      return [];
    }
  });
  const persistMirrors = (next: Mirror[]) => {
    setMirrors(next);
    try {
      localStorage.setItem('ps2_remote_mirrors', JSON.stringify(next));
    } catch {}
  };

  // Search, sort, and pagination state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const unlisten = listen<DownloadProgress>(
      'remote-download-progress',
      (event) => {
        const p = event.payload;
        setProgress((prev) => {
          const downloaded = Math.max(prev?.downloaded ?? 0, p.downloaded);
          const total = Math.max(prev?.total ?? 0, p.total);
          return { ...p, downloaded, total };
        });

        if (p.status === 'completed') {
          setError(null);
          setTimeout(() => {
            setDownloading(null);
            setProgress(null);
            onDownloadComplete();
          }, 500);
        } else if (p.status === 'failed') {
          setDownloading(null);
          setProgress(null);
          setError('Download failed. Please try again.');
        }
      },
    );

    return () => {
      unlisten
        .then((fn) => fn())
        .catch(() => {
          // Ignore cleanup errors
        });
    };
  }, [onDownloadComplete]);

  // Filter, sort, and paginate games
  const { filteredGames, paginatedGames, totalPages } = useMemo(() => {
    // Filter by search query
    let filtered = games.filter((game) =>
      game.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;

      if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === 'size') {
        const sizeA = a.size ?? 0;
        const sizeB = b.size ?? 0;
        comparison = sizeA - sizeB;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    // Paginate
    const total = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginated = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return {
      filteredGames: filtered,
      paginatedGames: paginated,
      totalPages: total,
    };
  }, [games, searchQuery, sortField, sortOrder, currentPage]);

  const fetchGames = async (urlOverride?: string): Promise<void> => {
    const targetUrl = urlOverride ?? sourceUrl;
    if (!targetUrl) return;

    setLoading(true);
    setError(null);
    setCurrentPage(1); // Reset to page 1 when fetching new games
    try {
      const result = await fetchArchiveOrgGames(targetUrl);
      setGames(result);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  const fetchFrom = async (url: string): Promise<void> => {
    setSourceUrl(url);
    await fetchGames(url);
  };

  const downloadGame = async (game: RemoteGame): Promise<void> => {
    if (!libraryRoot) {
      setError('Please select a library folder first');
      return;
    }

    setDownloading(game.name);
    setProgress(null);
    setError(null);

    try {
      // Download will run in background thread
      await downloadRemoteIsoWithProgress(
        game.download_url,
        libraryRoot,
        game.name,
      );
      // Note: completion is handled by the event listener
    } catch (err) {
      setError(String(err));
      setDownloading(null);
      setProgress(null);
    }
  };

  return (
    <>
      <LoadingOverlay show={loading} message="Fetching games from Archive.org">
        <p>This may take a few seconds...</p>
      </LoadingOverlay>

      <div className="section">
        <h3>Remote ISO Sources</h3>

        <div className="row toolbar">
          <Button onClick={() => fetchFrom(ESSENTIALS_URL)} disabled={loading}>
            PS2 Essentials Archive
          </Button>
          {mirrors.map((m, idx) => (
            <Button
              key={`${m.label}-${idx}`}
              variant="secondary"
              onClick={() => fetchFrom(m.url)}
              disabled={loading}
            >
              {m.label}
            </Button>
          ))}
        </div>

        <div className="row toolbar" style={{ gap: '8px' }}>
          <Input
            placeholder="Archive.org collection URL"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            style={{ flex: 1 }}
          />
          <Button onClick={() => fetchGames()} disabled={loading || !sourceUrl}>
            {loading ? 'Loading...' : 'Fetch Games'}
          </Button>
        </div>

        {/* Mirror management */}
        <div
          className="row toolbar"
          style={{ gap: '8px', alignItems: 'center' }}
        >
          <Input
            placeholder="Add mirror label (e.g., Community Mirror)"
            value={''}
            onChange={() => {
              /* controlled by prompt below */
            }}
            style={{ display: 'none' }}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const label = window
                .prompt('Mirror label (e.g., Community Mirror)')
                ?.trim();
              if (!label) return;
              const url = window
                .prompt('Mirror URL (Archive.org collection URL)')
                ?.trim();
              if (!url) return;
              persistMirrors([...mirrors, { label, url }]);
            }}
          >
            + Add Mirror
          </Button>
          {mirrors.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => persistMirrors([])}
            >
              Clear Mirrors
            </Button>
          )}
        </div>

        {error && (
          <div
            className="section"
            style={{
              background: 'rgba(255, 61, 61, 0.1)',
              border: '2px solid var(--ui-danger)',
              borderRadius: '8px',
              padding: '16px',
            }}
          >
            <p
              style={{
                margin: '0 0 8px 0',
                fontSize: '14px',
                fontWeight: 'bold',
                color: 'var(--ui-danger)',
              }}
            >
              Error
            </p>
            <code style={{ fontSize: '13px', wordBreak: 'break-word' }}>
              {error}
            </code>

            {(error.includes('incomplete') || error.includes('mismatch')) && (
              <p
                style={{ margin: '12px 0 0 0', fontSize: '12px', opacity: 0.9 }}
              >
                <strong>Tip:</strong> The download was interrupted. The
                incomplete file has been automatically removed. You can try
                again.
              </p>
            )}

            {error.includes('already exists') && (
              <p
                style={{ margin: '12px 0 0 0', fontSize: '12px', opacity: 0.9 }}
              >
                <strong>Tip:</strong> Delete the existing file in your Library
                folder and try again.
              </p>
            )}
          </div>
        )}

        {progress && downloading && (
          <div className="section">
            <ProgressBar
              value={progress.downloaded}
              max={progress.total}
              label={`Downloading: ${downloading}`}
              showPercentage={true}
            />
            <div
              className="row justify-between"
              style={{ fontSize: '12px', opacity: 0.7, marginTop: '8px' }}
            >
              <span>{formatFileSize(progress.downloaded)}</span>
              <span>{formatFileSize(progress.total)}</span>
            </div>
            <div
              style={{
                textAlign: 'center',
                marginTop: '8px',
                fontSize: '12px',
                opacity: 0.8,
              }}
            >
              <em>
                ⚠️ Download in progress - The app remains usable during download
              </em>
            </div>
          </div>
        )}

        {games.length > 0 && (
          <div className="section">
            <h4>
              Available Games ({filteredGames.length} of {games.length})
            </h4>

            {/* Search and Sort Controls */}
            <div
              className="row toolbar"
              style={{ gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}
            >
              <Input
                placeholder="Search games..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1); // Reset to page 1 when searching
                }}
                style={{ flex: '1 1 300px', minWidth: '200px' }}
              />
              <Select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as SortField)}
                uiSize="md"
              >
                <option value="name">Sort by Name</option>
                <option value="size">Sort by Size</option>
              </Select>
              <Select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                uiSize="md"
              >
                <option value="asc">↑ Ascending</option>
                <option value="desc">↓ Descending</option>
              </Select>
            </div>

            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th className="th-left">Name</th>
                    <th className="th-left">Size</th>
                    <th className="th-left">Format</th>
                    <th className="th-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedGames.map((game) => (
                    <tr key={game.download_url}>
                      <td>
                        <code className="code-mini">{game.name}</code>
                      </td>
                      <td>
                        {game.size ? formatFileSize(game.size) : 'Unknown'}
                      </td>
                      <td>{game.format.toUpperCase()}</td>
                      <td>
                        <Button
                          size="sm"
                          onClick={() => downloadGame(game)}
                          disabled={downloading !== null || !libraryRoot}
                        >
                          {downloading === game.name
                            ? 'Downloading...'
                            : 'Download'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div
                className="row toolbar"
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: '16px',
                  gap: '8px',
                }}
              >
                <Button
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                >
                  ← Previous
                </Button>
                <span style={{ fontSize: '14px', fontWeight: 500 }}>
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next →
                </Button>
              </div>
            )}
          </div>
        )}

        {!libraryRoot && (
          <div className="section" style={{ color: 'var(--neo-accent-2)' }}>
            Please select a library folder in Settings before downloading games.
          </div>
        )}

        {downloading && (
          <div
            className="section"
            style={{
              background: 'rgba(76, 194, 255, 0.1)',
              border: '2px solid var(--neo-accent)',
              borderRadius: '8px',
              padding: '16px',
              textAlign: 'center',
            }}
          >
            <p style={{ margin: 0, fontSize: '14px', fontWeight: 500 }}>
              <strong>Download in progress</strong>
            </p>
            <p style={{ margin: '8px 0 0 0', fontSize: '12px', opacity: 0.8 }}>
              You can continue using the application normally
            </p>
          </div>
        )}
      </div>
    </>
  );
};
