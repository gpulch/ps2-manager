import { convertFileSrc } from '@tauri-apps/api/core';
import { useEffect, useState } from 'react';
import type { GameInfo } from '../../types';
import { Button } from '../../ui/Button';
import { formatFileSize } from '../../utils';
import {
  isIsoPresent,
  copyIsoToOpl,
  deleteIsoFromOpl,
} from '../../actions/transfer';
import { GameDetailsPanel } from '../GameDetailsPanel';

const regionInfo = (id?: string): { flag: string; label: string } => {
  if (!id) return { flag: '—', label: '—' };
  const p = id.slice(0, 4).toUpperCase();
  const map: Record<string, { flag: string; label: string }> = {
    SLUS: { flag: 'US', label: 'US' },
    SCUS: { flag: 'US', label: 'US' },
    SLES: { flag: 'EU', label: 'EU' },
    SCES: { flag: 'EU', label: 'EU' },
    SCED: { flag: 'EU', label: 'EU' },
    SLED: { flag: 'EU', label: 'EU' },
    SLPS: { flag: 'JP', label: 'JP' },
    SLPM: { flag: 'JP', label: 'JP' },
    SCPS: { flag: 'JP', label: 'JP' },
    SCAJ: { flag: 'AS', label: 'Asia' },
    SLAJ: { flag: 'AS', label: 'Asia' },
    SCKA: { flag: 'KR', label: 'KR' },
    SLKA: { flag: 'KR', label: 'KR' },
    TCES: { flag: 'EU', label: 'EU' },
    TLES: { flag: 'EU', label: 'EU' },
    TCPS: { flag: 'JP', label: 'JP' },
  };
  return map[p] ?? { flag: '—', label: p };
};

type Props = {
  games: GameInfo[];
  onDelete: (id?: string) => void;
  onFetch: (id?: string, title?: string) => void;
  oplRoot?: string | null;
};

const Row = ({
  g,
  onDelete,
  onFetch,
  oplRoot,
  onShowDetails,
  onPreviewCover,
}: {
  g: GameInfo;
  onDelete: (id?: string) => void;
  onFetch: (id?: string, title?: string) => void;
  oplRoot?: string | null;
  onShowDetails: (game: GameInfo) => void;
  onPreviewCover: (coverPath: string, title: string) => void;
}) => {
  const [present, setPresent] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      if (!oplRoot) {
        setPresent(null);
        return;
      }
      try {
        const ok = await isIsoPresent(oplRoot, g.file_name, g.size);
        if (!cancelled) setPresent(!!ok);
      } catch {
        if (!cancelled) setPresent(false);
      }
    };
    check();
    return () => {
      cancelled = true;
    };
  }, [oplRoot, g.file_name, g.size]);

  const doCopy = async () => {
    if (!oplRoot) return;
    setBusy(true);
    try {
      await copyIsoToOpl(g.path, oplRoot);
      setPresent(true);
    } finally {
      setBusy(false);
    }
  };

  const doDelete = async () => {
    if (!oplRoot) return;
    setBusy(true);
    try {
      await deleteIsoFromOpl(oplRoot, g.file_name);
      setPresent(false);
    } finally {
      setBusy(false);
    }
  };

  const r = regionInfo(g.id);
  return (
    <tr key={g.path}>
      <td>{g.id ?? '-'}</td>
      <td>{`${r.flag} ${r.label}`}</td>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>{g.title_guess ?? '-'}</span>
          {g.title_guess && (
            <button
              onClick={() => onShowDetails(g)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '16px',
                padding: '2px 6px',
                opacity: 0.6,
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.6')}
              title="View game details"
            >
              i
            </button>
          )}
        </div>
      </td>
      <td>
        {g.has_cover && g.cover_path ? (
          <div
            style={{
              position: 'relative',
              width: '80px',
              height: '80px',
              cursor: 'pointer',
            }}
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
            onClick={() =>
              onPreviewCover(g.cover_path!, g.title_guess || g.id || 'Unknown')
            }
          >
            <img
              src={convertFileSrc(g.cover_path)}
              alt={g.title_guess || 'Cover'}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '4px',
                border: '1px solid #ddd',
                transition: 'transform 0.2s, box-shadow 0.2s',
                transform: hovering ? 'scale(1.05)' : 'scale(1)',
                boxShadow: hovering ? '0 4px 12px rgba(0,0,0,0.3)' : 'none',
              }}
              onError={(e) => {
                console.error('Failed to load cover:', g.cover_path);
                e.currentTarget.style.display = 'none';
              }}
            />
            {hovering && (
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  console.log('[deleteCover] clicked for:', g.id);
                  if (
                    window.confirm(`Delete cover for ${g.title_guess || g.id}?`)
                  ) {
                    try {
                      await onDelete(g.id);
                      console.log('  Delete completed');
                    } catch (e) {
                      console.error('  Delete failed:', e);
                      alert(`Failed to delete cover: ${e}`);
                    }
                  }
                }}
                style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  border: 'none',
                  backgroundColor: 'rgba(244, 67, 54, 0.9)',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                  lineHeight: '1',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                }}
                title="Delete cover"
              >
                ×
              </button>
            )}
          </div>
        ) : (
          <Button
            onClick={() => {
              console.log('[fetchCover] clicked for:', g.id);
              onFetch(g.id, g.title_guess || undefined);
            }}
          >
            Fetch
          </Button>
        )}
      </td>
      <td>{g.kind}</td>
      <td>{formatFileSize(g.size)}</td>
      <td>{g.warnings.join(', ')}</td>
      <td>
        {oplRoot ? (
          <div className="row" style={{ gap: 8 }}>
            <span>
              {present === null ? '…' : present ? '✓ On disk' : '— Not on disk'}
            </span>
            {present ? (
              <Button
                size="sm"
                variant="danger"
                onClick={doDelete}
                disabled={busy}
              >
                Delete
              </Button>
            ) : (
              <Button size="sm" onClick={doCopy} disabled={busy}>
                Copy
              </Button>
            )}
          </div>
        ) : (
          <span>—</span>
        )}
      </td>
    </tr>
  );
};

export const GamesTable = ({ games, onDelete, onFetch, oplRoot }: Props) => {
  const [selectedGame, setSelectedGame] = useState<GameInfo | null>(null);
  const [previewCover, setPreviewCover] = useState<{
    path: string;
    title: string;
  } | null>(null);

  // Close preview on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && previewCover) {
        setPreviewCover(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewCover]);

  return (
    <>
      {games.length === 0 ? (
        <div>No games scanned yet.</div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th className="th-left">ID</th>
              <th className="th-left">Region</th>
              <th className="th-left">Title</th>
              <th className="th-left">Cover</th>
              <th className="th-left">Type</th>
              <th className="th-left">Size</th>
              <th className="th-left">Warnings</th>
              <th className="th-left">Disk</th>
            </tr>
          </thead>
          <tbody>
            {games.map((g) => (
              <Row
                key={g.path}
                g={g}
                onDelete={onDelete}
                onFetch={onFetch}
                oplRoot={oplRoot}
                onShowDetails={setSelectedGame}
                onPreviewCover={(path, title) =>
                  setPreviewCover({ path, title })
                }
              />
            ))}
          </tbody>
        </table>
      )}

      {selectedGame && (
        <GameDetailsPanel
          gameTitle={selectedGame.title_guess || 'Unknown'}
          gameId={selectedGame.id}
          onClose={() => setSelectedGame(null)}
        />
      )}

      {previewCover && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9998,
            padding: '20px',
            cursor: 'pointer',
          }}
          onClick={() => setPreviewCover(null)}
        >
          <div
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewCover(null)}
              style={{
                position: 'absolute',
                top: '-40px',
                right: '0',
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '32px',
                cursor: 'pointer',
                padding: '4px 12px',
                fontWeight: 'bold',
                opacity: 0.8,
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.8')}
              title="Close (ESC)"
            >
              ×
            </button>
            <img
              src={convertFileSrc(previewCover.path)}
              alt={previewCover.title}
              style={{
                maxWidth: '100%',
                maxHeight: '90vh',
                objectFit: 'contain',
                borderRadius: '8px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
              }}
            />
            <div
              style={{
                marginTop: '16px',
                color: 'white',
                fontSize: '18px',
                fontWeight: 600,
                textAlign: 'center',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
              }}
            >
              {previewCover.title}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
