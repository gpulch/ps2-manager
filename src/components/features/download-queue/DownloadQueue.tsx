import { useDownloadQueue } from '../../../hooks/useDownloadQueue';
import { Button } from '../../../ui/Button';
import { formatFileSize } from '../../../utils/format';
import './DownloadQueue.css';

type Props = {
  libraryRoot: string | null;
};

export const DownloadQueue = ({ libraryRoot }: Props) => {
  const {
    queue,
    cancelDownload,
    clearCompleted,
    retryDownload,
    removeFromQueue,
    pendingCount,
    completedCount,
    failedCount,
  } = useDownloadQueue(libraryRoot);

  if (queue.length === 0) {
    return (
      <div className="download-queue empty">
        <p>No downloads in queue</p>
      </div>
    );
  }

  return (
    <div className="download-queue">
      <div className="queue-header">
        <h3>Download Queue</h3>
        <div className="queue-stats">
          <span className="stat stat-pending">⏳ {pendingCount} pending</span>
          <span className="stat stat-completed">
            ✅ {completedCount} completed
          </span>
          {failedCount > 0 && (
            <span className="stat stat-failed">❌ {failedCount} failed</span>
          )}
        </div>
        {completedCount > 0 && (
          <Button size="sm" variant="ghost" onClick={clearCompleted}>
            Clear Completed
          </Button>
        )}
      </div>

      <div className="queue-list">
        {queue.map((item) => (
          <div key={item.id} className={`queue-item queue-item-${item.status}`}>
            <div className="item-info">
              <div className="item-name">{item.name}</div>
              <div className="item-details">
                <span>{formatFileSize(item.size)}</span>
                <span>{item.format.toUpperCase()}</span>
                {item.status === 'downloading' && (
                  <span className="item-progress">
                    {item.progress.toFixed(1)}%
                  </span>
                )}
              </div>
            </div>

            {item.status === 'downloading' && (
              <div className="item-progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            )}

            {item.error && (
              <div className="item-error">Error: {item.error}</div>
            )}

            <div className="item-actions">
              {item.status === 'pending' && (
                <>
                  <span className="item-status">Waiting...</span>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => removeFromQueue(item.id)}
                  >
                    Remove
                  </Button>
                </>
              )}

              {item.status === 'downloading' && (
                <>
                  <span className="item-status">Downloading...</span>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => cancelDownload(item.id)}
                  >
                    Cancel
                  </Button>
                </>
              )}

              {item.status === 'completed' && (
                <span className="item-status success">✅ Completed</span>
              )}

              {item.status === 'failed' && (
                <>
                  <span className="item-status error">❌ Failed</span>
                  <Button size="sm" onClick={() => retryDownload(item.id)}>
                    Retry
                  </Button>
                </>
              )}

              {item.status === 'cancelled' && (
                <span className="item-status">🚫 Cancelled</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
