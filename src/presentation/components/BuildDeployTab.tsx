'use client';
import { DeployPanel, ToolingPanel } from './BuildDeploy';

export function BuildDeployPanels() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <ToolingPanel />
      <DeployPanel />
    </div>
  );
}
