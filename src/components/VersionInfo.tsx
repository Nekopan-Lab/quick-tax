import { useEffect, useState } from 'react';

interface VersionData {
  version: string;
  buildNumber: number;
  buildTime: string;
}

export function VersionInfo() {
  const [versionData, setVersionData] = useState<VersionData | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Add cache busting to ensure we get the latest version
    const fetchVersion = () => {
      fetch(`/version.json?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      })
        .then(res => res.json())
        .then(data => setVersionData(data))
        .catch(err => console.error('[Version] Failed to fetch version info:', err));
    };

    fetchVersion();

    // Re-fetch when the page becomes visible (e.g., after PWA update)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchVersion();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', fetchVersion);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', fetchVersion);
    };
  }, []);

  if (!versionData) return null;

  const buildDate = new Date(versionData.buildTime);
  const formattedDate = buildDate.toLocaleString();

  return (
    <div className="relative inline-block text-xs text-gray-400">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="hover:text-gray-600 transition-colors"
      >
        v{versionData.version}
      </button>
      {showDetails && (
        <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 whitespace-nowrap">
          <div className="text-gray-600">
            <div>Version: {versionData.version}</div>
            <div>Built: {formattedDate}</div>
          </div>
        </div>
      )}
    </div>
  );
}