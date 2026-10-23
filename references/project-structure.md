# Écrire une présentation en plusieurs fichiers

Lire ce guide pour créer ou modifier un dossier de présentation détaillée. Le dossier
est une source locale ; le MCP ne reçoit ni ses chemins ni une archive de fichiers.
Copier et adapter `assets/project/` du skill pour commencer. Le YAML autonome reste
adapté à une petite présentation textuelle, mais pas à un tunnel détaillé.

## Répartition des responsabilités

```text
mon-projet/
  project.yaml                    identité, références et ordre des pages
  theme/
    tokens.yaml                   couleurs et valeurs communes du projet
    defaults.yaml                 apparence racine commune
  styles/
    primitives.yaml               texte, lignes, piles, champs
    navigation.yaml               apparence de la navbar
    cart.yaml                     apparence du panier
    reservation/
      participants.yaml           particularités visuelles de cette étape
  blocks/
    navigation/navbar.yaml        une seule définition de la navbar
    cart/cart.yaml                un seul panier paramétré
    layout/reservation-page.yaml  gabarit commun, avec des slots
    forms/input-field.yaml        motif de champ réutilisable
  pages/
    reservation/
      participants/
        page.yaml                 cadre, titre, description et assemblage
        departure.yaml            partie « aéroport » de la page
        travelers.yaml            partie « voyageurs »
        counters/adults.yaml      un compteur, si ce détail mérite son propre bloc
      payment/
        page.yaml
        payment-form.yaml
        parts/payment-methods.yaml
```

Les noms métier et la profondeur s’adaptent au besoin. Séparer une responsabilité
identifiable, pas chaque `Div`. Un sous-dossier contient ses propres fichiers utiles,
sans dossier vide, copies de styles ou découpage imposé par un nombre de lignes.
Un contenu spécifique à une étape peut vivre à côté de son `page.yaml` ; un motif
réutilisé entre étapes va dans `blocks/`.

## Manifeste local

```yaml
format: prisme/project@1
id: exemple
title: Un parcours de réservation
description: Maquettes figées, données fictives.
tokens: theme/tokens.yaml
defaults: theme/defaults.yaml
styles:
  - styles/common.yaml
blocks:
  navbar: blocks/navbar.yaml
  cart: blocks/cart.yaml
  screen: blocks/screen.yaml
sections:
  - id: journey
    title: Le parcours
    pages:
      - pages/web.yaml
      - pages/mobile.yaml
```

Ce manifeste correspond au modèle copiable du skill. Dans un projet plus détaillé,
ajouter les fichiers nécessaires aux listes et au dictionnaire, sans changer le moteur.
`lots` est optionnel : chaque entrée décrit `id`, `number` positif ou `null` pour
« Plus tard », `title` et `color`. Un lot n’est pas une section ni une étape.

| Champ              | Contenu                                                                                      |
| ------------------ | -------------------------------------------------------------------------------------------- |
| `format`           | `prisme/project@1` identifie la source locale, pas le format envoyé au serveur.              |
| `id`               | Identifiant du dossier ; le lecteur utilise le titre et les identifiants des sections/pages. |
| `tokens`           | Chemin optionnel d’un dictionnaire de constantes.                                            |
| `defaults`         | Chemin optionnel d’une apparence racine (`css`, `compact`, `states`).                        |
| `styles`           | Liste de bibliothèques, sans nom de style déclaré deux fois.                                 |
| `blocks`           | Dictionnaire `nom-utilisé-dans-use: fichier.yaml`.                                           |
| `sections[].pages` | Liste ordonnée des pages de cette section.                                                   |

Tous les chemins sont relatifs à la racine contenant `project.yaml`, même pour un
bloc situé dans un sous-dossier. Utiliser des références explicites à des `.yaml` :
aucun glob, URL distante, chemin personnel, import React ou résolution automatique
depuis l’archive. Les liens symboliques qui sortent de cette racine sont refusés.
Un fichier absent bloque la préparation ; aucun contenu n’est inventé pour le remplacer.

## Contenu de chaque fichier

- **Tokens** : une simple table `brand: "#317a54"`, sans `format` supplémentaire.
- **Defaults** : une apparence telle que `css: { font-size: 14 }`, sans enveloppe.
- **Styles** : `format: prisme/styles@1`, puis `styles: { nom: { css: ... } }`.
- **Bloc** : `format: prisme/block@1`, `parameters` optionnel, `content` en liste.
- **Page** : `format: prisme/page@2`, `id`, `title`, `description`, `label`, `frame`
  et `data.content`. Les contenus et props utilisent le contrat distant courant.

Exemple de page qui assemble un gabarit partagé :

```yaml
format: prisme/page@2
id: web
title: La page web
description: État actuel du parcours.
label: Maquette figée avec données fictives.
frame:
  variant: browser
  theme: light
  url: exemple.fr/parcours
data:
  content:
    - use: screen
      id: web
      with:
        title: Votre parcours
        amount: 120 €
```

Le cadre peut aussi être `phone`, avec `finish` et `showDynamicIsland`. Ce ne sont
que des habillages du contenu local : aucune page externe n’est chargée.

## Assemblage et communication

Le helper accepte aussi bien le dossier que son `project.yaml` dans `--file`.
Il lit seulement les références déclarées, les garde en mémoire, fusionne les
bibliothèques puis produit un `prisme/presentation@2` autonome : les pages deviennent
`sections[].steps[]` et les définitions de blocs restent mutualisées. Il n’écrit pas
un deuxième gros YAML à maintenir. Le serveur développe ensuite les blocs et valide
les props ; aucun accès au poste du collaborateur n’est nécessaire côté serveur.

Pour ce mode, la somme UTF-8 des fichiers lus et le YAML assemblé sont chacun bornés
à **2 Mio**, avec au plus 2 048 fichiers. Un fichier partagé n’est lu qu’une fois.
Les alias YAML, tags inconnus, clés dupliquées et documents multiples sont refusés.
Un YAML autonome transmis seul est conservé à l’identique.

Suivre [le workflow MCP](publication.md) pour les commandes, l’autorisation de
publication et les limites. Ne jamais envoyer `project.yaml` brut directement
aux outils du serveur.

Un diagnostic local donne un code, un fichier relatif et, pour les problèmes de
schéma, un chemin de propriété. Corriger la source concernée puis revalider, sans
élargir le contrat ni supprimer les contrôles pour contourner le refus.

Lire [yaml-composition.md](yaml-composition.md) pour les paramètres, slots, tokens,
styles et la propagation entre blocs. Cette séparation de fichiers ne crée pas une
syntaxe d’inclusion YAML : toutes les références de fichiers restent dans le manifeste.
