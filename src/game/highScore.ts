const BEST_WAVE_KEY = "bestWave";

export function loadBestWave(): number {
  const saved = localStorage.getItem(BEST_WAVE_KEY);

  if (saved === null) {
    return 0;
  }

  return Number(saved);
}

export function saveBestWave(wave: number) {
  localStorage.setItem(BEST_WAVE_KEY, String(wave));
}
