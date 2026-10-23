export const sourceConfig = {
  entry: 'project.yaml',
  projectFormat: 'prisme/project@1',
  presentationFormat: 'prisme/presentation@2',
  maxDepth: 64,
  maxNodes: 200_000,
  maxFiles: 2048,
} as const satisfies SourceConfig

import type { SourceConfig } from '@prisme/publish-skill/internal/source/source.config.type.ts'
