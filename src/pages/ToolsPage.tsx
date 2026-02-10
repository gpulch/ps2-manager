import { useState } from 'react';
import { BinCueConverter } from '../components/features/converter/BinCueConverter';
import { CddaDetector } from '../components/features/cdda/CddaDetector';
import { DownloadQueue } from '../components/features/download-queue/DownloadQueue';
import { FeatureCard } from '../ui/FeatureCard';
import { useSourceContext } from '../contexts/SourceContext';

export const ToolsPage = () => {
  const { libraryRoot } = useSourceContext();
  const [activeTab, setActiveTab] = useState<
    'queue' | 'converter' | 'cdda' | null
  >(null);

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ marginBottom: '24px' }}>Tools & Utilities</h1>

      <p style={{ opacity: 0.8, marginBottom: '32px' }}>
        Advanced tools for managing your PS2 game collection
      </p>

      {/* Feature cards grid */}
      <div className="feature-grid" style={{ marginBottom: '32px' }}>
        <FeatureCard
          icon="/download-icon.svg"
          title="Download Queue"
          description="Manage multiple ISO downloads sequentially with progress tracking"
          badge={activeTab === 'queue' ? 'ACTIVE' : 'NEW'}
          onClick={() => setActiveTab(activeTab === 'queue' ? null : 'queue')}
        />

        <FeatureCard
          icon="/disk-icon.svg"
          title="BIN/CUE Converter"
          description="Convert PlayStation 2 BIN/CUE images to ISO format for OPL"
          badge={activeTab === 'converter' ? 'ACTIVE' : 'NEW'}
          onClick={() =>
            setActiveTab(activeTab === 'converter' ? null : 'converter')
          }
        />

        <FeatureCard
          icon="/game-icon.svg"
          title="CDDA Detection"
          description="Detect CD Digital Audio tracks that may not work in OPL"
          badge={activeTab === 'cdda' ? 'ACTIVE' : 'NEW'}
          onClick={() => setActiveTab(activeTab === 'cdda' ? null : 'cdda')}
        />
      </div>

      {/* Active tool panel */}
      {activeTab === 'queue' && (
        <div className="tool-panel">
          <DownloadQueue libraryRoot={libraryRoot} />
        </div>
      )}

      {activeTab === 'converter' && (
        <div className="tool-panel">
          <BinCueConverter />
        </div>
      )}

      {activeTab === 'cdda' && (
        <div className="tool-panel">
          <CddaDetector />
        </div>
      )}

      {!activeTab && (
        <div
          className="card"
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: 'rgba(76, 194, 255, 0.05)',
            border: '2px dashed var(--neo-border)',
          }}
        >
          <h3 style={{ marginBottom: '12px', opacity: 0.6 }}>
            Select a tool above to get started
          </h3>
          <p style={{ opacity: 0.5 }}>
            Click on any card to open the corresponding tool
          </p>
        </div>
      )}
    </div>
  );
};
