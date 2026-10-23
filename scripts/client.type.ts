import type { StreamableHTTPClientTransportOptions } from '@modelcontextprotocol/client'

import type { clientErrors } from '@prisme/publish-skill/internal/client.config.ts'

export type SkillErrorCode = keyof typeof clientErrors

export type SourceIssue = {
  readonly path: string
  readonly code: string
}

export type RemoteFailure = {
  readonly code: string
  readonly message: string
  readonly requestId: string
  readonly issues: readonly { readonly path: string; readonly code: string }[]
}

export type SkillRequest =
  | { readonly operation: 'schema'; readonly serverUrl: string }
  | {
      readonly operation: 'validate' | 'publish'
      readonly serverUrl: string
      readonly yaml: string
    }

export type SkillResult =
  | { readonly operation: 'schema'; readonly schema: Record<string, unknown> }
  | { readonly operation: 'validate'; readonly valid: true; readonly title: string }
  | { readonly operation: 'publish'; readonly id: string; readonly url: string }

export type ClientOptions = {
  readonly fetch?: StreamableHTTPClientTransportOptions['fetch']
}
