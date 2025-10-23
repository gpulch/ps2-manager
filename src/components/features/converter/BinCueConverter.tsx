import { useState } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { open } from '@tauri-apps/plugin-dialog'
import { Button } from '../../../ui/Button'
import { Input } from '../../../ui/Input'

type ConversionInfo = {
  bin_path: string
  bin_size: number
  needs_conversion: boolean
  output_size: number
  format: string
}

export const BinCueConverter = () => {
  const [cuePath, setCuePath] = useState('')
  const [info, setInfo] = useState<ConversionInfo | null>(null)
  const [converting, setConverting] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const selectCueFile = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [{ name: 'CUE Files', extensions: ['cue'] }]
      })
      
      if (selected) {
        setCuePath(selected)
        setResult(null)
        setError(null)
        
        // Get conversion info
        try {
          const conversionInfo = await invoke<ConversionInfo>('get_conversion_info', {
            cuePath: selected
          })
          setInfo(conversionInfo)
        } catch (err) {
          setError(String(err))
          setInfo(null)
        }
      }
    } catch (err) {
      setError(String(err))
    }
  }
  
  const convertToIso = async () => {
    if (!cuePath) return
    
    try {
      const destPath = await open({
        directory: false,
        multiple: false,
        defaultPath: cuePath.replace('.cue', '.iso')
      })
      
      if (!destPath) return
      
      setConverting(true)
      setError(null)
      
      const outputPath = await invoke<string>('convert_bin_to_iso', {
        cuePath,
        destinationPath: destPath
      })
      
      setResult(`✅ Converted successfully!\nOutput: ${outputPath}`)
    } catch (err) {
      setError(String(err))
    } finally {
      setConverting(false)
    }
  }
  
  return (
    <div className="card" style={{ marginTop: '16px' }}>
      <h3>🔄 BIN/CUE to ISO Converter</h3>
      <p style={{ opacity: 0.8, marginBottom: '16px' }}>
        Convert PlayStation 2 BIN/CUE images to ISO format for use with OPL
      </p>
      
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <Input 
          value={cuePath} 
          placeholder="Select a CUE file..."
          readOnly
          style={{ flex: 1 }}
        />
        <Button onClick={selectCueFile}>
          Browse...
        </Button>
      </div>
      
      {info && (
        <div className="card" style={{ background: 'rgba(76, 194, 255, 0.05)', padding: '16px' }}>
          <h4 style={{ margin: '0 0 12px 0' }}>Conversion Info</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
            <div><strong>BIN File:</strong> {info.bin_path}</div>
            <div><strong>Format:</strong> {info.format}</div>
            <div><strong>Input Size:</strong> {(info.bin_size / 1048576).toFixed(2)} MB</div>
            <div><strong>Output Size:</strong> {(info.output_size / 1048576).toFixed(2)} MB</div>
            <div><strong>Needs Conversion:</strong> {info.needs_conversion ? 'Yes' : 'No (already ISO)'}</div>
          </div>
          
          {info.needs_conversion ? (
            <Button 
              onClick={convertToIso} 
              disabled={converting}
              style={{ marginTop: '16px' }}
            >
              {converting ? '⏳ Converting...' : '🔄 Convert to ISO'}
            </Button>
          ) : (
            <p style={{ marginTop: '16px', color: 'var(--neo-accent-3)' }}>
              ✅ This file is already in ISO format. You can copy it directly.
            </p>
          )}
        </div>
      )}
      
      {result && (
        <div className="card" style={{ 
          background: 'rgba(57, 255, 20, 0.1)', 
          border: '2px solid var(--neo-accent-3)',
          padding: '16px',
          marginTop: '16px'
        }}>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{result}</pre>
        </div>
      )}
      
      {error && (
        <div className="card" style={{ 
          background: 'rgba(255, 61, 61, 0.1)', 
          border: '2px solid #ff3d3d',
          padding: '16px',
          marginTop: '16px',
          color: '#ff3d3d'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      
      <div className="card" style={{ 
        background: 'rgba(76, 194, 255, 0.05)', 
        padding: '12px',
        marginTop: '16px',
        fontSize: '13px'
      }}>
        <strong>💡 How it works:</strong>
        <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
          <li>Select a .cue file from your BIN/CUE image</li>
          <li>The converter finds the associated .bin file</li>
          <li>If needed, converts RAW sectors (2352 bytes) to ISO (2048 bytes)</li>
          <li>Output ISO can be used directly with OPL</li>
        </ul>
      </div>
    </div>
  )
}
