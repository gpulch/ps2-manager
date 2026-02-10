/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from 'react';
import type { ReactNode } from 'react';
import { open } from '@tauri-apps/plugin-dialog';
import { useToast } from '../ui/Toast';
import { getStoredValue, setStoredValue } from '../utils/storage';
import {
  validateLibraryFolder,
  validateGenericFolder,
  checkWriteableFolder,
  formatValidationWarnings,
} from '../utils/validation';
import { initializeOplStructure } from '../actions/opl';

export type SourceMode = 'disk' | 'library';

export type SourceContextValue = {
  activeSource: SourceMode;
  selectedRoot: string | null;
  libraryRoot: string | null;
  cheatsRoot: string | null;
  setSource: (m: SourceMode) => Promise<void>;
  setSelectedRoot: (r: string | null) => void;
  chooseLibraryRoot: () => Promise<void>;
  chooseCheatsRoot: () => Promise<void>;
  useLibraryForCheats: () => Promise<void>;
  currentRoot: () => string | null;
  currentCheatRoot: () => string | null;
  storeReady: boolean;
};

const Ctx = createContext<SourceContextValue | null>(null);

export const useSourceContext = (): SourceContextValue => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('SourceContext not available');
  return ctx;
};

export const SourceProvider = ({ children }: { children: ReactNode }) => {
  const [activeSource, setActiveSource] = useState<SourceMode>('disk');
  const [selectedRoot, setSelectedRoot] = useState<string | null>(null);
  const [libraryRoot, setLibraryRoot] = useState<string | null>(null);
  const [cheatsRoot, setCheatsRoot] = useState<string | null>(null);
  const [storeReady, setStoreReady] = useState(false);
  const toast = useToast();

  const currentRoot = useCallback(
    (): string | null => (activeSource === 'disk' ? selectedRoot : libraryRoot),
    [activeSource, selectedRoot, libraryRoot],
  );

  const currentCheatRoot = useCallback(
    (): string | null => cheatsRoot ?? currentRoot(),
    [cheatsRoot, currentRoot],
  );

  const setSource = useCallback(async (mode: SourceMode): Promise<void> => {
    setActiveSource(mode);
    await setStoredValue('activeSource', mode);
  }, []);

  const chooseLibraryRoot = useCallback(async (): Promise<void> => {
    const folder = await open({ directory: true, multiple: false });
    if (!folder || Array.isArray(folder)) return;

    try {
      const result = await validateLibraryFolder(folder);

      if (!result?.ok) {
        const message = formatValidationWarnings(result?.warnings);
        toast.show(message, 'warning');
        return;
      }

      try {
        const isWriteable = await checkWriteableFolder(folder);
        if (!isWriteable) {
          toast.show(
            'Library folder is not writeable; some features may be limited.',
            'warning',
          );
        }
      } catch (error) {
        console.warn('Failed to check folder writeability:', error);
      }

      // Check if folder is empty or has no ISOs - offer to initialize OPL structure
      const hasEmptyWarning = result.warnings?.some(
        (w) => w.includes('empty') || w.includes('No .iso files'),
      );

      if (hasEmptyWarning) {
        try {
          // Initialize OPL structure automatically for empty folders
          await initializeOplStructure(folder);
          toast.show(
            'Library folder selected and OPL structure created (DVD, CD, ART, CFG, CHT, VMC)',
            'success',
            4000,
          );
        } catch (error) {
          console.warn('Failed to initialize OPL structure:', error);
          toast.show(
            'Library folder selected - ready for downloads!',
            'success',
          );
        }
      } else {
        toast.show('Library folder selected', 'success');
      }

      setLibraryRoot(folder);
      await setStoredValue('libraryRoot', folder);
    } catch (error) {
      console.warn('Validation failed', error);
      toast.show('Library validation failed', 'danger');
    }
  }, [toast]);

  const chooseCheatsRoot = useCallback(async (): Promise<void> => {
    const folder = await open({ directory: true, multiple: false });
    if (!folder || Array.isArray(folder)) return;

    try {
      const result = await validateGenericFolder(folder);

      if (!result?.ok) {
        const message = formatValidationWarnings(result?.warnings);
        toast.show(message, 'warning');
        return;
      }

      const isWriteable = await checkWriteableFolder(folder);
      if (!isWriteable) {
        toast.show(
          'Selected folder is not writeable. Please choose another folder.',
          'danger',
        );
        return;
      }

      setCheatsRoot(folder);
      await setStoredValue('cheatsRoot', folder);
      toast.show('Cheats folder selected', 'success');
    } catch (error) {
      console.warn('Validation failed', error);
      toast.show('Cheats folder validation failed', 'danger');
    }
  }, [toast]);

  const useLibraryForCheats = useCallback(async (): Promise<void> => {
    if (!libraryRoot) return;
    setCheatsRoot(libraryRoot);
    await setStoredValue('cheatsRoot', libraryRoot);
  }, [libraryRoot]);

  useEffect(() => {
    const loadStoredSettings = async (): Promise<void> => {
      try {
        const [source, lastRoot, libRoot, cheatRoot] = await Promise.all([
          getStoredValue<string>('activeSource'),
          getStoredValue<string>('lastRoot'),
          getStoredValue<string>('libraryRoot'),
          getStoredValue<string>('cheatsRoot'),
        ]);

        if (source === 'library') setActiveSource('library');
        if (lastRoot) setSelectedRoot(lastRoot);
        if (libRoot) setLibraryRoot(libRoot);
        if (cheatRoot) setCheatsRoot(cheatRoot);
      } finally {
        setStoreReady(true);
      }
    };

    loadStoredSettings();
  }, []);

  const value = useMemo(
    () => ({
      activeSource,
      selectedRoot,
      libraryRoot,
      cheatsRoot,
      setSource,
      setSelectedRoot,
      chooseLibraryRoot,
      chooseCheatsRoot,
      useLibraryForCheats,
      currentRoot,
      currentCheatRoot,
      storeReady,
    }),
    [
      activeSource,
      selectedRoot,
      libraryRoot,
      cheatsRoot,
      storeReady,
      setSource,
      chooseLibraryRoot,
      chooseCheatsRoot,
      useLibraryForCheats,
      currentRoot,
      currentCheatRoot,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};
