# Prisme

Prisme permet de créer et partager des présentations de parcours et d’interfaces
depuis votre agent IA. Le contenu est décrit en YAML, puis validé et publié par
le serveur MCP Prisme.

## Installation

Node.js 24 requis.

```sh
npx skills add mr-ElAmine/prisme-publish --skill prisme-publish --agent codex --global
```

## Configuration

Le serveur Prisme est préconfiguré. Pour utiliser un autre serveur, définir
`PRISME_MCP_URL` ou passer l’option `--server` au client.

[Documentation](references/installation.md) · [Format YAML](references/project-structure.md)
