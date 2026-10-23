# Prisme — skill de publication

Préparer une présentation en YAML, la valider puis publier son HTML via le serveur
MCP Prisme. Ce dépôt public contient uniquement le skill autonome, pas le backend
ni les présentations de ses utilisateurs.

## Installation

Avec Node.js 24 installé :

```sh
npx skills add mr-ElAmine/prisme-publish --skill prisme-publish --agent codex --global
```

Aucun compte GitHub, accès au projet Prisme, pnpm ou `.env` n'est nécessaire.
Pour un autre agent compatible, changer `--agent` ou laisser l'installateur proposer
ses destinations. Le client précompilé inclut ses dépendances et le serveur commun
est déjà configuré. `--server` ou `PRISME_MCP_URL` permettent d'en choisir un autre.

## Utilisation

Dans l'agent :

> Utilise le skill prisme-publish pour préparer une présentation de mon parcours
> avec des données fictives, la valider puis la publier. Donne-moi le lien.
> Aucun test du front.

La publication doit être explicitement demandée. Les présentations sont publiques
par leur lien : ne jamais envoyer de secrets ou de données personnelles. Conserver
les YAML sources dans son propre projet. Les maquettes sont figées ; le lecteur
permet de naviguer entre leurs étapes.

Lire le [guide d'installation](references/installation.md), les
[règles de structure](references/project-structure.md) et la
[composition des blocs](references/yaml-composition.md) pour les détails.

Les notices des dépendances embarquées accompagnent le client dans `runtime/`.
