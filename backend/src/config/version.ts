/**
 * Deployment / build metadata for B021.
 * Overridable via env at container build or runtime.
 */
export const APP_VERSION = process.env.APP_VERSION ?? '2.6.0';
export const APP_NAME = 'regintel-api';
export const API_CONTRACT_VERSION = 'v1';

export type BuildMetadata = {
  name: string;
  version: string;
  apiContract: string;
  gitSha: string;
  gitRef: string;
  buildTime: string;
  nodeVersion: string;
  deploymentId: string;
  environment: string;
};

export function getBuildMetadata(): BuildMetadata {
  return {
    name: APP_NAME,
    version: APP_VERSION,
    apiContract: API_CONTRACT_VERSION,
    gitSha: process.env.GIT_SHA ?? process.env.GITHUB_SHA ?? 'local',
    gitRef: process.env.GIT_REF ?? process.env.GITHUB_REF ?? 'local',
    buildTime: process.env.BUILD_TIME ?? 'unknown',
    nodeVersion: process.version,
    deploymentId:
      process.env.DEPLOYMENT_ID ?? process.env.HOSTNAME ?? `pid-${process.pid}`,
    environment: process.env.NODE_ENV ?? 'development',
  };
}
