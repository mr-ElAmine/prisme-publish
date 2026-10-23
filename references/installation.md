# Installer et distribuer le skill Prisme

Une installation par poste suffit pour tous les projets. Node.js 24 est requis ;
aucun pnpm, backend local, Docker, Terraform, gcloud ou identifiant Google n'est
nécessaire pour utiliser le skill. Le client MCP précompilé inclut ses dépendances.

## Installer depuis GitHub

```sh
npx skills add mr-ElAmine/prisme-publish --skill prisme-publish --agent codex --global
```

Pour un autre agent pris en charge par `skills`, changer `--agent` ; sans cette
option, l'installateur propose ses destinations. Sans `--global`, l'installation
est limitée au projet courant. Aucun script post-installation n'est nécessaire :
`runtime/prisme.cjs` est déjà présent dans le dossier GitHub.

Le dépôt [mr-ElAmine/prisme-publish](https://github.com/mr-ElAmine/prisme-publish)
est public : aucun compte GitHub ni accès au projet Prisme privé n'est nécessaire.
Il possède son propre historique et ne distribue que le skill. Aucun jeton n'est
nécessaire pour appeler le MCP ; ne jamais en ajouter aux YAML ou à la distribution.

L'installateur indique le dossier installé. Utiliser ce chemin, sans supposer un
profil personnel ni installer une seconde copie homonyme. Le dossier entier est
nécessaire, pas seulement `SKILL.md`. Pour une version fixe, utiliser une URL GitHub
de la forme `https://github.com/mr-ElAmine/prisme-publish/tree/COMMIT`,
avec un SHA approuvé à la place de `COMMIT`, comme source de la même commande.

Une nouvelle version est disponible seulement après son push autorisé dans ce dépôt
public. Le dépôt privé Prisme et les présentations ne doivent jamais y être poussés.

## Serveur prêt à utiliser

Sans configuration, le skill appelle notre serveur commun :

```text
https://prisme-377884923048.europe-west9.run.app/mcp
```

Il n'y a aucun `.env` à créer, aucune dépendance à télécharger au premier appel
et aucun enregistrement MCP global. Le client ne lit pas les `.env` existants.
Pour changer de serveur, ajouter `--server <url>` à la commande du helper ou définir
`PRISME_MCP_URL` dans son environnement. Priorité : `--server`, variable du processus,
puis serveur Prisme préconfiguré. Une valeur invalide bloque l'appel sans repli.
La même configuration s'applique à toutes les présentations.

## Utiliser le skill

Dans l'agent, demander par exemple :

> Utilise le skill prisme-publish pour préparer une présentation de mon parcours
> avec des données fictives. Garde les YAML dans docs/prisme/parcours, valide puis
> publie et donne-moi le lien. Aucun test du front.

Le skill suit le workflow de `SKILL.md`. L'installation n'autorise aucun appel
distant ni publication ; la publication exige une demande explicite. Le HTML
est public par son lien : ne pas envoyer de secrets ou de données personnelles.
Les YAML sources restent dans le projet de travail, pas dans le dossier du skill.

Pour exécuter le helper depuis un terminal, `PRISME_SKILL_DIR` désigne le chemin
réel renvoyé par l'installateur, vers le dossier contenant `SKILL.md` :

```sh
node "$PRISME_SKILL_DIR/runtime/prisme.cjs" --help
node "$PRISME_SKILL_DIR/runtime/prisme.cjs" schema
node "$PRISME_SKILL_DIR/runtime/prisme.cjs" validate --file /chemin/absolu/mon-projet
```

`--help` est local ; `schema` et `validate` contactent le serveur sans publier.
Les références de `project.yaml` sont assemblées en mémoire avant l'envoi.

## Archive et maintenance

Une archive `prisme-publish.tar.gz` contient le même dossier autonome et sa somme
SHA-256 accompagne la distribution. Vérifier leur provenance et la somme avant
extraction. L'intégrité ne prouve pas l'identité de l'auteur. L'archive inclut
le runtime et ses notices de dépendances, jamais `.env` ou `node_modules`.

Les fichiers de `runtime/` sont générés et livrés versionnés. Les sources TypeScript
de `scripts/` sont fournies pour inspection, pas pour demander une compilation à
l'installation. La compilation esbuild et les contrôles de correspondance sont
effectués dans l'environnement de maintenance, hors de cette distribution.
Ne pas éditer le bundle à la main.

Ce dépôt n'inclut pas les outils de déploiement, accès cloud ou workflows du backend.
Une mise à jour publique du skill doit être explicitement autorisée et vérifiée
avant son push. Installer le skill ne déploie rien et ne publie pas sur npm.

[CLI skills — installation et accès privés](https://github.com/vercel-labs/skills/blob/main/docs/commands.md)

[Documentation officielle des skills Codex](https://learn.chatgpt.com/docs/build-skills)
