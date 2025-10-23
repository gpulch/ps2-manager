# Integration Examples

How to integrate new features into your PS2 Manager workflows.

---

## 📥 Download Queue

### Adding Downloads to Queue

```typescript
import { useDownloadQueue } from '../hooks/useDownloadQueue'

const MyComponent = () => {
  const { addToQueue } = useDownloadQueue(libraryRoot)
  
  const downloadGame = (game: RemoteGame) => {
    addToQueue({
      name: game.name,
      url: game.download_url,
      size: game.size,
      format: game.format
    })
  }
  
  return <button onClick={() => downloadGame(selectedGame)}>Add to Queue</button>
}
```

### Displaying Queue

```typescript
import { DownloadQueue } from '../components'

const LibraryPage = () => {
  return (
    <div>
      <h2>My Library</h2>
      {/* Your library content */}
      
      {/* Download queue at bottom */}
      <DownloadQueue libraryRoot={libraryRoot} />
    </div>
  )
}
```

---

## 🔄 BIN/CUE Converter

### Standalone Converter

```typescript
import { BinCueConverter } from '../components'

const ToolsPage = () => {
  return (
    <div>
      <h2>Conversion Tools</h2>
      <BinCueConverter />
    </div>
  )
}
```

### Programmatic Conversion

```typescript
import { invoke } from '@tauri-apps/api/core'

const convertImage = async (cuePath: string, destPath: string) => {
  try {
    // Check if conversion is needed
    const info = await invoke('get_conversion_info', { cuePath })
    console.log('Conversion info:', info)
    
    // Perform conversion
    const result = await invoke('convert_bin_to_iso', {
      cuePath,
      destinationPath: destPath
    })
    
    console.log('Converted:', result)
  } catch (error) {
    console.error('Conversion failed:', error)
  }
}
```

---

## 🎵 CDDA Detection

### Standalone Detector

```typescript
import { CddaDetector } from '../components'

const ToolsPage = () => {
  return (
    <div>
      <h2>Analysis Tools</h2>
      <CddaDetector />
    </div>
  )
}
```

### Automatic Detection on Import

```typescript
import { invoke } from '@tauri-apps/api/core'

const checkGameAudio = async (isoPath: string) => {
  try {
    const cddaInfo = await invoke('detect_cdda', { isoPath })
    
    if (cddaInfo.has_audio) {
      // Warn user
      alert(cddaInfo.warning_message)
    }
    
    return cddaInfo
  } catch (error) {
    console.error('CDDA detection failed:', error)
  }
}

// Use when adding games
const addGameToLibrary = async (isoPath: string) => {
  // Check for audio
  const audio = await checkGameAudio(isoPath)
  
  // Add to library with warning flag
  await addGame({
    path: isoPath,
    hasAudio: audio?.has_audio || false
  })
}
```

---

## 🎨 UI Components

### Feature Cards

```typescript
import { FeatureCard } from '../components'

const Dashboard = () => {
  return (
    <div className="feature-grid">
      <FeatureCard
        icon="/disk-icon.svg"
        title="Download Queue"
        description="Manage multiple ISO downloads"
        badge="NEW"
        onClick={() => navigate('/downloads')}
      />
      
      <FeatureCard
        icon="/game-icon.svg"
        title="BIN/CUE Converter"
        description="Convert images to ISO format"
        onClick={() => navigate('/converter')}
      />
      
      <FeatureCard
        icon="/controller-icon.svg"
        title="CDDA Detection"
        description="Check for audio tracks"
        onClick={() => navigate('/cdda')}
      />
    </div>
  )
}
```

### Stat Cards

```typescript
import { StatCard } from '../components'

const StatsPanel = ({ queue }) => {
  return (
    <div className="stat-grid">
      <StatCard
        label="Downloads"
        value={queue.length}
        icon="/download-icon.svg"
        color="blue"
        trend="up"
        subtitle="+3 this session"
      />
      
      <StatCard
        label="Pending"
        value={queue.filter(i => i.status === 'pending').length}
        color="magenta"
      />
      
      <StatCard
        label="Completed"
        value={queue.filter(i => i.status === 'completed').length}
        color="green"
      />
    </div>
  )
}
```

---

## 🔗 Complete Integration Example

### Tools Page with All Features

```typescript
import { useState } from 'react'
import { 
  BinCueConverter, 
  CddaDetector, 
  DownloadQueue,
  FeatureCard 
} from '../components'

const ToolsPage = () => {
  const [activeTab, setActiveTab] = useState<'queue' | 'converter' | 'cdda'>('queue')
  
  return (
    <div>
      <h1>Tools & Utilities</h1>
      
      {/* Feature overview */}
      <div className="feature-grid">
        <FeatureCard
          icon="/download-icon.svg"
          title="Download Queue"
          description="Manage downloads"
          badge={activeTab === 'queue' ? 'ACTIVE' : undefined}
          onClick={() => setActiveTab('queue')}
        />
        
        <FeatureCard
          icon="/disk-icon.svg"
          title="BIN/CUE Converter"
          description="Convert to ISO"
          badge={activeTab === 'converter' ? 'ACTIVE' : undefined}
          onClick={() => setActiveTab('converter')}
        />
        
        <FeatureCard
          icon="/game-icon.svg"
          title="CDDA Detection"
          description="Check audio tracks"
          badge={activeTab === 'cdda' ? 'ACTIVE' : undefined}
          onClick={() => setActiveTab('cdda')}
        />
      </div>
      
      {/* Active tool */}
      {activeTab === 'queue' && <DownloadQueue libraryRoot={libraryRoot} />}
      {activeTab === 'converter' && <BinCueConverter />}
      {activeTab === 'cdda' && <CddaDetector />}
    </div>
  )
}

export default ToolsPage
```

---

## 📦 Export Pattern

### Component Index

```typescript
// src/components/features/tools/index.ts
export { BinCueConverter } from './BinCueConverter'
export { CddaDetector } from './CddaDetector'
export { DownloadQueue } from './DownloadQueue'

// Usage
import { BinCueConverter, CddaDetector } from '../components/features/tools'
```

### Hook Pattern

```typescript
// src/hooks/index.ts
export { useDownloadQueue } from './useDownloadQueue'
export { useCoverOps } from './useCoverOps'

// Usage
import { useDownloadQueue, useCoverOps } from '../hooks'
```

---

## 🎯 Best Practices

### 1. Error Handling

```typescript
const safeConvert = async (cuePath: string) => {
  try {
    const result = await invoke('convert_bin_to_iso', { cuePath, destinationPath })
    toast.success('Conversion complete!')
    return result
  } catch (error) {
    toast.error(`Conversion failed: ${error}`)
    console.error(error)
    return null
  }
}
```

### 2. Loading States

```typescript
const [converting, setConverting] = useState(false)

const convert = async () => {
  setConverting(true)
  try {
    await convertImage(cuePath, destPath)
  } finally {
    setConverting(false)
  }
}

return <Button disabled={converting}>
  {converting ? 'Converting...' : 'Convert'}
</Button>
```

### 3. User Feedback

```typescript
import { ToastContainer } from '../components'

// In root component
<ToastContainer />

// Use anywhere
import { toast } from '../hooks/useToast'

toast.success('Download added to queue!')
toast.error('Conversion failed')
toast.warning('Audio tracks detected')
toast.info('Processing...')
```

---

## 🚀 Quick Start

### Add All Features to Existing App

1. **Import components:**
   ```typescript
   import { DownloadQueue, BinCueConverter, CddaDetector } from './components'
   ```

2. **Add to your layout:**
   ```typescript
   <DownloadQueue libraryRoot={libraryRoot} />
   ```

3. **Use hooks:**
   ```typescript
   const { addToQueue } = useDownloadQueue(libraryRoot)
   ```

4. **Call backend:**
   ```typescript
   await invoke('convert_bin_to_iso', { cuePath, destinationPath })
   await invoke('detect_cdda', { isoPath })
   ```

---

**All features are ready to use!** 🎮✨
