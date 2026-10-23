import { SkillError, skillDiagnostic } from '@prisme/publish-skill/internal/client.error.ts'
import { resolveServerUrl } from '@prisme/publish-skill/internal/client.schema.ts'
import { runPrisme } from '@prisme/publish-skill/internal/client.ts'
import type { SkillRequest } from '@prisme/publish-skill/internal/client.type.ts'
import { readPresentationSource } from '@prisme/publish-skill/internal/source/index.ts'
import { Command } from 'commander'

function report(error: SkillError): void {
  console.error(JSON.stringify(skillDiagnostic(error)))
  process.exitCode = 1
}

async function run(
  operation: SkillRequest['operation'],
  options: { server?: string; file?: string },
) {
  const server = resolveServerUrl(options.server, process.env)
  if (server.isErr()) return report(server.error)

  let request: SkillRequest = { operation: 'schema', serverUrl: server.value }
  if (operation !== 'schema') {
    if (!options.file) return report(new SkillError('FILE_READ_FAILED'))
    const source = await readPresentationSource(options.file)
    if (source.isErr()) return report(source.error)
    request = { operation, serverUrl: server.value, yaml: source.value }
  }

  const result = await runPrisme(request)
  if (result.isErr()) return report(result.error)
  console.log(JSON.stringify({ server: server.value, ...result.value }))
}

const program = new Command()
  .name('prisme-publish')
  .description('Client local du MCP Prisme, sans authentification.')
for (const operation of ['schema', 'validate', 'publish'] as const) {
  const command = program
    .command(operation)
    .option('--server <url>', 'URL complète du MCP ; sinon PRISME_MCP_URL puis le serveur Prisme')
  if (operation !== 'schema')
    command.requiredOption('--file <path>', 'YAML autonome, project.yaml ou dossier de projet')
  command.action(async (options: { server?: string; file?: string }) => run(operation, options))
}

program.parseAsync(process.argv).catch((cause: unknown) => {
  const failure =
    cause instanceof SkillError ? cause : new SkillError('CONNECTION_FAILED', { cause })
  report(failure)
})
