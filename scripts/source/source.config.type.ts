export type SourceConfig = {
  readonly entry: string
  readonly projectFormat: 'prisme/project@1'
  readonly presentationFormat: 'prisme/presentation@2'
  readonly maxDepth: number
  readonly maxNodes: number
  readonly maxFiles: number
}
