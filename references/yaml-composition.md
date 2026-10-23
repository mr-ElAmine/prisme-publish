# Blocs, variables et règles de composition

Lire après le guide de structure pour écrire les définitions et les variantes des
pages. Le schéma lu auprès du MCP reste la source des capacités disponibles. Le
modèle du skill est un exemple, pas une preuve de validation sur ce serveur.

## Quatre mécanismes distincts

| Mécanisme                         | Portée et utilisation                                                                                  |
| --------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `tokens` / `{ token: brand }`     | Constantes globales du projet, texte ou nombre fini ; principalement couleurs et dimensions partagées. |
| `styles` / `props.styles`         | Apparences nommées, combinables par une liste de références.                                           |
| `parameters` / `{ param: title }` | Variables locales d’un bloc, typées et fournies par `with`.                                            |
| Paramètre `slot`                  | Liste de nœuds ou références de blocs à insérer dans une composition.                                  |

Un marqueur remplace une **valeur entière**. `text: { param: title }` fonctionne ;
`text: "Bonjour ${title}"`, `${brand}`, `${ENV}`, une expression JS ou une condition
ne sont pas évalués. Préparer une chaîne complète ou plusieurs nœuds. Un token est
une valeur littérale, pas une chaîne de références à d’autres tokens.

## Définir un bloc et l’appeler

```yaml
format: prisme/block@1
parameters:
  title:
    type: string
  content:
    type: slot
    default: []
content:
  - type: Div
    props:
      id: panel
      styles: panel
      content:
        - type: Typography
          props:
            id: title
            as: h2
            text:
              param: title
        - param: content
```

Le manifeste associe par exemple `panel` au chemin de ce fichier. La bibliothèque
de styles doit également déclarer `panel` pour cet exemple. L’appel est un nœud
`use`, jamais un faux `type: panel` :

```yaml
- use: panel
  id: summary
  with:
    title: Votre récapitulatif
    content:
      - type: Typography
        props:
          id: explanation
          as: p
          text: Montants fictifs, aucun paiement possible.
```

Types disponibles : `string`, `number`, `boolean`, `slot`. Sans `default`, la valeur
est obligatoire. Les types ne sont pas convertis : `"2"` n’est pas le nombre `2`.
Les noms inconnus dans `with` sont refusés. Les paramètres ne sont pas globaux et
ne sont jamais accessibles implicitement dans un autre bloc.

Pour transmettre une variable à un bloc enfant, la passer explicitement :

```yaml
- use: cart
  id: summary
  with:
    amount:
      param: amount
```

Un slot fourni remplace entièrement le slot par défaut. L’omettre conserve le défaut ;
passer `[]` le vide. Les contenus fournis doivent être des nœuds complets ou des
références valides. Ne pas y laisser une référence à un paramètre privé du bloc
appelé. Un slot par défaut peut, lui, utiliser les paramètres scalaires déclarés
dans son bloc. L’ordre de déclaration de ces scalaires n’est pas significatif.

## Styles et priorité

```yaml
format: prisme/styles@1
styles:
  panel:
    css:
      display: flex
      flex-direction: column
      gap: 16
      background:
        token: surface
    compact:
      gap: 8
```

Déclarer `surface` dans le dictionnaire de tokens pour cet exemple. Un nœud peut
utiliser `styles: panel` ou `styles: [panel, selected]`, puis une exception locale
dans `css`. Les références sont fusionnées **de gauche à droite**, puis les valeurs
locales prennent priorité. Les propriétés de `compact` et de chaque état sont
fusionnées de la même façon. Une surcharge remplace une propriété, pas tout le style.

`defaults` fournit l’apparence racine commune ; `data.root.props` est la surcharge
racine d’une page. Les propriétés `css` se fusionnent, mais `compact` et `states`
racine sont remplacés lorsqu’ils sont explicitement fournis. Ne pas confondre cette
règle avec la fusion des références `props.styles` sur les nœuds.

Utiliser les propriétés CSS natives en kebab-case. Les nombres deviennent des px
pour les propriétés dimensionnelles ; les unités et valeurs sans dimension sont
validées par le moteur. `compact` cible le conteneur de page à 560 px ou moins,
pas directement la largeur de la fenêtre. États autorisés : `hover`, `focusVisible`,
`disabled`, `checked`, `invalid`, `before`, `after`.

Une différence durable mérite un style nommé ; ne pas recopier tout le style de
base pour changer une bordure. Les palettes appartiennent au projet. Ne pas imposer
les couleurs de Prisme à une représentation d’un autre site.

## Primitives et identifiants

- `Div` expose `as`, `attrs`, les apparences et `content`. Flex/grid, lignes et
  colonnes se décrivent dans ses styles, sans inventer un composant Row/Column.
- `Typography` expose `text`, `as`, `attrs` et les apparences.
- `Icon` expose `name`, `size`, `strokeWidth`, un éventuel `label` et les apparences.
  Le schéma déclare les noms disponibles ; ne pas inventer une icône inconnue.
- `Image` est un emplacement gris avec une icône et un `label`, pas un asset distant.

Un bouton figé est `Div` avec `as: button`, `attrs.type: button` et des enfants.
Un champ passe par `Div` avec `as: input` et `attrs.defaultValue`/`readOnly` ; pas
d’événement ou d’état React dans le YAML. Une `Typography` avec `as: label` peut
viser ce contrôle avec `attrs.htmlFor`. Conserver les contraintes HTML et les noms
accessibles, même pour une maquette.

Chaque nœud a un `props.id`, chaque appel un `id` d’instance. Les identifiants sont
uniques dans leur portée et restent courts. Le moteur préfixe ceux des blocs et
met à jour `htmlFor`, `aria-labelledby`, `aria-describedby` et les groupes de champs.
Ne pas écrire ces préfixes techniques à la main. Les boucles de références sont refusées.

## Exemple de contrats Isra

Ces noms décrivent le projet Isra, pas des composants codés en dur dans le moteur :

| Bloc                | Paramètres et différences à fournir                                                              |
| ------------------- | ------------------------------------------------------------------------------------------------ |
| `navbar`            | Aucun : une seule définition pour toutes les pages.                                              |
| `reservation-page`  | `step` (texte), `content` (slot requis), `cart` (slot avec panier par défaut).                   |
| `travel-heading`    | `step` (texte affiché dans la maquette).                                                         |
| `cart`              | `amount` (défaut `2 400 €`), slots `prefix`, `quote`, `actions`, `modify`.                       |
| `cart-quote`        | `amount` requis.                                                                                 |
| `cart-actions`      | `label` (défaut « Réserver »), `back` (slot avec bouton précédent par défaut).                   |
| `section-heading`   | `icon`, `title`, `description` requis.                                                           |
| `input-field`       | `label` requis ; `type` vaut `text`, `value` vaut une chaîne vide par défaut.                    |
| `placeholder-field` | Mêmes paramètres, avec `placeholder` requis.                                                     |
| `labeled-field`     | `label`, `control` requis ; `target` vaut `control`, `labelStyle` vaut `field-label` par défaut. |

Exemples : `quote: []` masque le détail du devis ; `actions: []` retire les actions
du panier ; `modify: []` retire sa note de modification. `back: []` retire le retour
illustré du panier. Ces slots ne changent **jamais** la navigation du lecteur Prisme.
Le footer et les raccourcis restent pilotés par les sections/pages du manifeste.

## Gardes à respecter

Pas de HTML/JavaScript brut, import React, callback, requête, URL CSS, fonte externe,
sélecteur arbitraire ou outil exécuté depuis les données. Les contrôles des maquettes
sont figés. Garder le contenu et les cas métier, sans les remplacer par des exemples
génériques sous prétexte de mutualisation.

La taille des sources ne prédit pas celle des données développées : multiplier des
blocs augmente aussi les budgets du moteur. Lire les limites du serveur et valider
le YAML assemblé ; un appel invalide ne doit pas conduire à une publication.
