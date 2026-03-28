// Version history hook — saves named snapshots of diagram state
import { useState, useCallback } from 'react';

const MAX_VERSIONS = 20;

export function useVersionHistory() {
  const [versions, setVersions] = useState([]);

  const saveVersion = useCallback((name, state) => {
    const version = {
      id: `v-${Date.now()}`,
      name: name || `Version ${versions.length + 1}`,
      timestamp: new Date().toISOString(),
      items: JSON.parse(JSON.stringify(state.items)),
      connections: JSON.parse(JSON.stringify(state.connections)),
      boundaries: JSON.parse(JSON.stringify(state.boundaries)),
      itemCount: state.items.length,
      connectionCount: state.connections.length,
    };
    setVersions(prev => {
      const updated = [version, ...prev];
      return updated.slice(0, MAX_VERSIONS);
    });
    return version;
  }, [versions.length]);

  const restoreVersion = useCallback((versionId) => {
    const version = versions.find(v => v.id === versionId);
    if (!version) return null;
    return {
      items: JSON.parse(JSON.stringify(version.items)),
      connections: JSON.parse(JSON.stringify(version.connections)),
      boundaries: JSON.parse(JSON.stringify(version.boundaries)),
    };
  }, [versions]);

  const deleteVersion = useCallback((versionId) => {
    setVersions(prev => prev.filter(v => v.id !== versionId));
  }, []);

  const clearVersions = useCallback(() => {
    setVersions([]);
  }, []);

  return { versions, saveVersion, restoreVersion, deleteVersion, clearVersions };
}
