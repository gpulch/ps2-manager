import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';
import { Button } from '../../../ui/Button';
import { Input } from '../../../ui/Input';

type CddaInfo = {
  has_audio: boolean;
  audio_tracks: number;
  total_audio_mb: number;
  warning_message: string | null;
};

export const CddaDetector = () => {
  const [isoPath, setIsoPath] = useState('');
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<CddaInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectIsoFile = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [{ name: 'ISO Files', extensions: ['iso'] }],
      });

      if (selected) {
        setIsoPath(selected);
        setResult(null);
        setError(null);
      }
    } catch (err) {
      setError(String(err));
    }
  };

  const detectAudio = async () => {
    if (!isoPath) return;

    setChecking(true);
    setError(null);

    try {
      const cddaInfo = await invoke<CddaInfo>('detect_cdda', {
        isoPath,
      });
      setResult(cddaInfo);
    } catch (err) {
      setError(String(err));
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="card" style={{ marginTop: '16px' }}>
      <h3>CDDA Audio Detection</h3>
      <p style={{ opacity: 0.8, marginBottom: '16px' }}>
        Detect CD Digital Audio tracks in ISO files (may not work properly in
        OPL)
      </p>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <Input
          value={isoPath}
          placeholder="Select an ISO file..."
          readOnly
          style={{ flex: 1 }}
        />
        <Button onClick={selectIsoFile}>Browse...</Button>
      </div>

      {isoPath && (
        <Button
          onClick={detectAudio}
          disabled={checking}
          style={{ marginBottom: '16px' }}
        >
          {checking ? 'Analyzing...' : 'Detect Audio Tracks'}
        </Button>
      )}

      {result && (
        <div
          className="card"
          style={{
            background: result.has_audio
              ? 'rgba(255, 193, 7, 0.1)'
              : 'rgba(57, 255, 20, 0.1)',
            border: `2px solid ${result.has_audio ? 'var(--ui-warning)' : 'var(--neo-accent-3)'}`,
            padding: '16px',
          }}
        >
          <h4
            style={{
              margin: '0 0 12px 0',
              color: result.has_audio
                ? 'var(--ui-warning)'
                : 'var(--neo-accent-3)',
            }}
          >
            {result.has_audio ? 'Audio Detected' : 'No Audio Detected'}
          </h4>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontSize: '14px',
            }}
          >
            <div>
              <strong>Audio Tracks:</strong> {result.audio_tracks}
            </div>
            <div>
              <strong>Audio Data:</strong> {result.total_audio_mb.toFixed(2)} MB
            </div>
          </div>

          {result.warning_message && (
            <div
              style={{
                marginTop: '16px',
                padding: '12px',
                background: 'rgba(255, 193, 7, 0.1)',
                borderLeft: '3px solid var(--ui-warning)',
                borderRadius: '4px',
              }}
            >
              <strong>Warning:</strong>
              <p style={{ margin: '8px 0 0 0' }}>{result.warning_message}</p>
            </div>
          )}

          {!result.has_audio && (
            <p style={{ marginTop: '12px', color: 'var(--neo-accent-3)' }}>
              This ISO contains only data. Should work perfectly with OPL.
            </p>
          )}
        </div>
      )}

      {error && (
        <div
          className="card"
          style={{
            background: 'rgba(255, 61, 61, 0.1)',
            border: '2px solid #ff3d3d',
            padding: '16px',
            color: '#ff3d3d',
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      <div
        className="card"
        style={{
          background: 'rgba(76, 194, 255, 0.05)',
          padding: '12px',
          marginTop: '16px',
          fontSize: '13px',
        }}
      >
        <strong>About CDDA:</strong>
        <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
          <li>CDDA = CD Digital Audio (music tracks on game discs)</li>
          <li>OPL may not play audio tracks properly</li>
          <li>Games with CDDA need special handling or different formats</li>
          <li>Most PS2 games don't use CDDA and will work fine</li>
        </ul>
      </div>
    </div>
  );
};
