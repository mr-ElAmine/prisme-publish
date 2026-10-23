import {
  type CallToolResult,
  Client,
  StreamableHTTPClientTransport,
} from '@modelcontextprotocol/client'
import { clientConfig } from '@prisme/publish-skill/internal/client.config.ts'
import { SkillError } from '@prisme/publish-skill/internal/client.error.ts'
import {
  httpUrlSchema,
  publicationSchema,
  remoteFailureSchema,
  resourceSchema,
  validationSchema,
} from '@prisme/publish-skill/internal/client.schema.ts'
import type {
  ClientOptions,
  SkillRequest,
  SkillResult,
} from '@prisme/publish-skill/internal/client.type.ts'
import { err, ok, Result, ResultAsync, safeTry } from 'neverthrow'

function toolFailure(
  result: CallToolResult,
  code: 'VALIDATION_FAILED' | 'PUBLICATION_FAILED',
): SkillError {
  for (const item of result.content ?? []) {
    if (item.type !== 'text') continue
    const decoded = Result.fromThrowable(
      (): unknown => JSON.parse(item.text),
      () => undefined,
    )()
    if (decoded.isErr()) continue
    const details = remoteFailureSchema.safeParse(decoded.value)
    if (details.success) return new SkillError(code, { remote: details.data.error })
  }
  return new SkillError(code)
}

async function readSchema(client: Client): Promise<Result<SkillResult, SkillError>> {
  try {
    const resource = await client.readResource(
      { uri: clientConfig.schemaUri },
      { timeout: clientConfig.timeoutMs },
    )
    for (const content of resource.contents) {
      if (!('text' in content) || content.uri !== clientConfig.schemaUri) continue
      const decoded: unknown = JSON.parse(content.text)
      const schema = resourceSchema.safeParse(decoded)
      if (schema.success) return ok({ operation: 'schema', schema: schema.data })
    }
    return err(new SkillError('SCHEMA_READ_FAILED'))
  } catch (cause) {
    return err(new SkillError('SCHEMA_READ_FAILED', { cause }))
  }
}

function validate(client: Client, yaml: string) {
  return ResultAsync.fromThrowable(
    () =>
      client.callTool(
        { name: clientConfig.tools.validate, arguments: { yaml } },
        {
          timeout: clientConfig.timeoutMs,
        },
      ),
    (cause) => new SkillError('VALIDATION_FAILED', { cause }),
  )().andThen((result) => {
    if (result.isError) return err(toolFailure(result, 'VALIDATION_FAILED'))
    const validation = validationSchema.safeParse(result.structuredContent)
    return validation.success ? ok(validation.data) : err(new SkillError('INVALID_RESPONSE'))
  })
}

function publish(client: Client, yaml: string) {
  // Une erreur de transport après cet appel ne prouve pas l’absence d’un fichier publié.
  return ResultAsync.fromThrowable(
    () =>
      client.callTool(
        { name: clientConfig.tools.publish, arguments: { yaml } },
        {
          timeout: clientConfig.timeoutMs,
        },
      ),
    (cause) => new SkillError('PUBLICATION_UNCERTAIN', { cause }),
  )().andThen((result) => {
    if (result.isError) return err(toolFailure(result, 'PUBLICATION_FAILED'))
    const publication = publicationSchema.safeParse(result.structuredContent)
    return publication.success ? ok(publication.data) : err(new SkillError('PUBLICATION_UNCERTAIN'))
  })
}

async function execute(
  client: Client,
  request: SkillRequest,
): Promise<Result<SkillResult, SkillError>> {
  if (request.operation === 'schema') return readSchema(client)
  return safeTry(async function* () {
    const validation = yield* validate(client, request.yaml)
    if (request.operation === 'validate')
      return ok({ operation: 'validate' as const, ...validation })

    const publication = yield* publish(client, request.yaml)
    return ok({ operation: 'publish' as const, ...publication })
  })
}

export async function runPrisme(
  request: SkillRequest,
  options: ClientOptions = {},
): Promise<Result<SkillResult, SkillError>> {
  if (!httpUrlSchema.safeParse(request.serverUrl).success) {
    return err(new SkillError('INVALID_SERVER_URL'))
  }
  const url = URL.parse(request.serverUrl)
  if (!url) return err(new SkillError('INVALID_SERVER_URL'))

  if (
    request.operation !== 'schema' &&
    Buffer.byteLength(request.yaml, 'utf8') > clientConfig.maxYamlBytes
  ) {
    return err(new SkillError('SOURCE_TOO_LARGE'))
  }

  const client = new Client(clientConfig.identity, { versionNegotiation: { mode: 'auto' } })
  const transport = new StreamableHTTPClientTransport(url, {
    ...(options.fetch ? { fetch: options.fetch } : {}),
    reconnectionOptions: clientConfig.reconnection,
  })

  try {
    const connection = await ResultAsync.fromPromise(
      client.connect(transport),
      (cause) => new SkillError('CONNECTION_FAILED', { cause }),
    )
    if (connection.isErr()) return err(connection.error)
    return await execute(client, request)
  } finally {
    // La fermeture du transport ne transforme pas un succès confirmé en publication à réessayer.
    await ResultAsync.fromPromise(
      client.close(),
      (cause) => new SkillError('CONNECTION_FAILED', { cause }),
    )
  }
}
