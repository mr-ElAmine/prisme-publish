import type { StreamableHTTPReconnectionOptions } from '@modelcontextprotocol/client'

export const clientConfig = {
  identity: { name: 'prisme-publish-skill', version: '0.1.0' },
  defaultServerUrl: 'https://prisme-377884923048.europe-west9.run.app/mcp',
  schemaUri: 'prisme://schemas/presentation',
  tools: { validate: 'validate_presentation', publish: 'publish_presentation' },
  timeoutMs: 60_000,
  maxYamlBytes: 2 * 1024 * 1024,
  reconnection: {
    maxRetries: 0,
    initialReconnectionDelay: 1000,
    maxReconnectionDelay: 1000,
    reconnectionDelayGrowFactor: 1,
  } satisfies StreamableHTTPReconnectionOptions,
} as const

export const clientErrors = {
  INVALID_SERVER_URL: 'Indiquer une URL MCP HTTP(S) complète, sans identifiants ni fragment.',
  FILE_READ_FAILED: 'Le fichier YAML local ne peut pas être lu.',
  SOURCE_TOO_LARGE: 'Le fichier YAML dépasse la limite du client local.',
  SOURCE_INVALID: 'Le YAML local ou son manifeste est invalide.',
  SOURCE_REFERENCE_INVALID: 'Une référence YAML sort du dossier du projet ou n’est pas autorisée.',
  SOURCE_DUPLICATE: 'Un style partagé est déclaré plusieurs fois.',
  CONNECTION_FAILED: 'Connexion au serveur MCP impossible. Aucune publication lancée.',
  SCHEMA_READ_FAILED: 'Le contrat de présentation ne peut pas être lu sur ce MCP.',
  VALIDATION_FAILED: 'Le MCP a refusé la validation. Aucune publication lancée.',
  INVALID_RESPONSE: 'Le MCP a renvoyé un résultat non conforme. Aucune publication lancée.',
  PUBLICATION_FAILED: 'Le MCP a signalé un échec de publication.',
  PUBLICATION_UNCERTAIN:
    'La publication a été envoyée mais son résultat est incertain. Ne pas relancer automatiquement : un HTML peut déjà exister.',
} as const
