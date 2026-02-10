import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';
import type { GameMetadata } from '../types/metadata';
import { fetchGameMetadata } from '../actions/metadata';

type Props = {
  gameTitle: string;
  gameId?: string;
  onClose: () => void;
};

export const GameDetailsPanel = ({ gameTitle, gameId, onClose }: Props) => {
  const [metadata, setMetadata] = useState<GameMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    const loadMetadata = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchGameMetadata(gameTitle, gameId);
        setMetadata(data);
      } catch (err) {
        setError(String(err));
        toast.show('Failed to load game metadata', 'danger', 3000);
      } finally {
        setLoading(false);
      }
    };

    loadMetadata();
  }, [gameTitle, gameId, toast]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          borderRadius: '12px',
          maxWidth: '900px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {loading && (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <div
              style={{ fontSize: '24px', marginBottom: '16px', opacity: 0.5 }}
            >
              Loading...
            </div>
            <h3 style={{ margin: 0 }}>Loading game information...</h3>
            <p style={{ opacity: 0.6, marginTop: '8px' }}>
              Fetching data from RAWG database
            </p>
          </div>
        )}

        {error && !loading && (
          <div
            style={{
              padding: '40px',
              textAlign: 'center',
              maxWidth: '600px',
              margin: '0 auto',
            }}
          >
            <div
              style={{ fontSize: '24px', marginBottom: '16px', opacity: 0.5 }}
            >
              ✗
            </div>
            <h3 style={{ margin: 0, color: '#F44336' }}>
              Failed to load metadata
            </h3>
            <p style={{ opacity: 0.7, marginTop: '8px', marginBottom: '16px' }}>
              {error}
            </p>

            {error.includes('API key') && (
              <div
                style={{
                  padding: '16px',
                  backgroundColor: '#FFF3E0',
                  border: '1px solid #FF9800',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  textAlign: 'left',
                  fontSize: '14px',
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: '8px' }}>
                  How to fix:
                </div>
                <ol style={{ margin: 0, paddingLeft: '20px' }}>
                  <li>
                    Get a free API key at{' '}
                    <a
                      href="https://rawg.io/apidocs"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#FF9800' }}
                    >
                      rawg.io/apidocs
                    </a>
                  </li>
                  <li>
                    Set the environment variable:{' '}
                    <code
                      style={{
                        background: '#f5f5f5',
                        padding: '2px 6px',
                        borderRadius: '3px',
                      }}
                    >
                      RAWG_API_KEY
                    </code>
                  </li>
                  <li>Restart the app</li>
                </ol>
                <div
                  style={{ marginTop: '8px', fontSize: '12px', opacity: 0.7 }}
                >
                  See the README for setup instructions
                </div>
              </div>
            )}

            <Button onClick={onClose}>Close</Button>
          </div>
        )}

        {metadata && !loading && (
          <>
            {/* Header with background image */}
            {metadata.background_image && (
              <div
                style={{
                  height: '250px',
                  backgroundImage: `url(${metadata.background_image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'relative',
                  borderRadius: '12px 12px 0 0',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background:
                      'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.8) 100%)',
                    borderRadius: '12px 12px 0 0',
                  }}
                />
                <button
                  onClick={onClose}
                  style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    background: 'rgba(0, 0, 0, 0.7)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    fontSize: '24px',
                    color: '#fff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  ×
                </button>
              </div>
            )}

            <div style={{ padding: '24px' }}>
              {/* Title and Basic Info */}
              <div style={{ marginBottom: '24px' }}>
                <h1
                  style={{
                    margin: 0,
                    fontSize: '32px',
                    fontWeight: 700,
                    marginBottom: '12px',
                  }}
                >
                  {metadata.title}
                </h1>

                <div
                  style={{
                    display: 'flex',
                    gap: '16px',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                  }}
                >
                  {metadata.release_date && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <span>Released:</span>
                      <span style={{ fontWeight: 600 }}>
                        {new Date(metadata.release_date).getFullYear()}
                      </span>
                    </div>
                  )}

                  {metadata.metacritic_score && (
                    <div
                      style={{
                        padding: '4px 12px',
                        borderRadius: '16px',
                        backgroundColor:
                          metadata.metacritic_score >= 75
                            ? '#4CAF50'
                            : metadata.metacritic_score >= 50
                              ? '#FF9800'
                              : '#F44336',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '14px',
                      }}
                    >
                      Metacritic: {metadata.metacritic_score}
                    </div>
                  )}

                  {metadata.esrb_rating && (
                    <div
                      style={{
                        padding: '4px 12px',
                        borderRadius: '16px',
                        backgroundColor: '#9C27B0',
                        color: '#fff',
                        fontWeight: 600,
                        fontSize: '14px',
                      }}
                    >
                      {metadata.esrb_rating}
                    </div>
                  )}
                </div>

                {/* Genres */}
                {metadata.genres.length > 0 && (
                  <div
                    style={{
                      marginTop: '12px',
                      display: 'flex',
                      gap: '8px',
                      flexWrap: 'wrap',
                    }}
                  >
                    {metadata.genres.map((genre, idx) => (
                      <span
                        key={idx}
                        style={{
                          padding: '4px 12px',
                          backgroundColor: '#E3F2FD',
                          color: '#1976D2',
                          borderRadius: '16px',
                          fontSize: '13px',
                          fontWeight: 600,
                        }}
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              {metadata.description && (
                <div style={{ marginBottom: '24px' }}>
                  <h3
                    style={{
                      fontSize: '18px',
                      fontWeight: 600,
                      marginBottom: '8px',
                    }}
                  >
                    Description
                  </h3>
                  <p style={{ lineHeight: 1.6, opacity: 0.9 }}>
                    {metadata.description}
                  </p>
                </div>
              )}

              {/* Features Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px',
                  marginBottom: '24px',
                }}
              >
                {/* Multiplayer */}
                {metadata.multiplayer !== null && (
                  <div
                    style={{
                      padding: '16px',
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',

                      borderRadius: '8px',
                      border: `2px solid ${metadata.multiplayer ? '#4CAF50' : '#E0E0E0'}`,
                    }}
                  >
                    <div
                      style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        marginBottom: '8px',
                        opacity: 0.7,
                      }}
                    >
                      {metadata.multiplayer ? 'Multi' : 'Solo'}
                    </div>
                    <div style={{ fontWeight: 700 }}>
                      {metadata.multiplayer ? 'Multiplayer' : 'Single Player'}
                    </div>
                  </div>
                )}

                {/* Co-op */}
                {metadata.coop && (
                  <div
                    style={{
                      padding: '16px',
                      backgroundColor: '#FFF3E0',
                      borderRadius: '8px',
                      border: '2px solid #FF9800',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        marginBottom: '8px',
                        opacity: 0.7,
                      }}
                    >
                      Co-op
                    </div>
                    <div style={{ fontWeight: 700 }}>Co-op Available</div>
                  </div>
                )}
              </div>

              {/* Developers & Publishers */}
              <div style={{ marginBottom: '24px' }}>
                {metadata.developers.length > 0 && (
                  <div style={{ marginBottom: '12px' }}>
                    <strong>
                      Developer{metadata.developers.length > 1 ? 's' : ''}:
                    </strong>{' '}
                    {metadata.developers.join(', ')}
                  </div>
                )}

                {metadata.publishers.length > 0 && (
                  <div>
                    <strong>
                      Publisher{metadata.publishers.length > 1 ? 's' : ''}:
                    </strong>{' '}
                    {metadata.publishers.join(', ')}
                  </div>
                )}
              </div>

              {/* Links */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {metadata.metacritic_url && (
                  <Button
                    onClick={() =>
                      window.open(metadata.metacritic_url!, '_blank')
                    }
                    size="sm"
                  >
                    View on Metacritic
                  </Button>
                )}

                {metadata.website && (
                  <Button
                    onClick={() => window.open(metadata.website!, '_blank')}
                    variant="secondary"
                    size="sm"
                  >
                    Official Website
                  </Button>
                )}

                <Button onClick={onClose} variant="secondary" size="sm">
                  Close
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
