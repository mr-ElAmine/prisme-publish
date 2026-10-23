import { clientErrors } from '@prisme/publish-skill/internal/client.config.ts'
import type {
  RemoteFailure,
  SkillErrorCode,
  SourceIssue,
} from '@prisme/publish-skill/internal/client.type.ts'

export class SkillError extends Error {
  readonly code: SkillErrorCode
  readonly remote: RemoteFailure | undefined
  readonly file: string | undefined
  readonly issues: readonly SourceIssue[]

  constructor(
    code: SkillErrorCode,
    options: {
      readonly cause?: unknown
      readonly remote?: RemoteFailure
      readonly file?: string
      readonly issues?: readonly SourceIssue[]
    } = {},
  ) {
    super(clientErrors[code], { cause: options.cause })
    this.name = 'SkillError'
    this.code = code
    this.remote = options.remote
    this.file = options.file
    this.issues = options.issues ?? []
  }
}

export function skillDiagnostic(error: SkillError) {
  return {
    error: {
      code: error.code,
      message: error.message,
      publicationMayExist: error.code === 'PUBLICATION_UNCERTAIN',
      ...(error.remote ? { remote: error.remote } : {}),
      ...(error.file ? { file: error.file } : {}),
      ...(error.issues.length ? { issues: error.issues } : {}),
    },
  }
}
