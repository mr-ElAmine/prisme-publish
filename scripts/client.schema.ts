import { clientConfig } from '@prisme/publish-skill/internal/client.config.ts'
import { SkillError } from '@prisme/publish-skill/internal/client.error.ts'
import { err, ok, type Result } from 'neverthrow'
import { z } from 'zod'

export const httpUrlSchema = z.url().refine((value) => {
  const url = URL.parse(value)
  return (
    url && ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password && !url.hash
  )
})

export const validationSchema = z.object({
  valid: z.literal(true),
  title: z.string(),
})
export const publicationSchema = z.object({ id: z.uuid(), url: httpUrlSchema })
export const resourceSchema = z.record(z.string(), z.unknown())

export const remoteFailureSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    requestId: z.string(),
    issues: z.array(z.object({ path: z.string(), code: z.string() })),
  }),
})

export function resolveServerUrl(
  explicit: string | undefined,
  variables: Readonly<Record<string, string | undefined>>,
): Result<string, SkillError> {
  const value = explicit ?? variables.PRISME_MCP_URL ?? clientConfig.defaultServerUrl
  const result = httpUrlSchema.safeParse(value)
  return result.success ? ok(result.data) : err(new SkillError('INVALID_SERVER_URL'))
}
