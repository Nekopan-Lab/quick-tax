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
    fetch('/version.json')
      .then(res => res.json())
      .then(data => setVersionData(data))
      .catch(err => console.error('[Version] Failed to fetch version info:', err));
  }, []);

  if (!versionData) return null;

  const buildDate = new Date(versionData.buildTime);
  const formattedDate = buildDate.toLocaleString();

  return (
    <div className="fixed bottom-20 right-4 text-xs text-gray-400">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="hover:text-gray-600 transition-colors"
      >
        v{versionData.version}
      </button>
      {showDetails && (
        <div className="absolute bottom-full right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 whitespace-nowrap">
          <div className="text-gray-600">
            <div>Version: {versionData.version}</div>
            <div>Build: #{versionData.buildNumber}</div>
            <div>Built: {formattedDate}</div>
          </div>
        </div>
      )}
    </div>
  );
}