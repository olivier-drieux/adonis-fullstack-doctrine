# Texte responsive masqué par un effet

- Date : 2026-11-18
- Catégorie : interfaces
- Source : projet pilote (olau)

## Erreur

Un en-tête garde l'icône d'un lien et masque son texte sous un breakpoint, mais le masquage dépend d'un effet ou d'une valeur `useMedia` lue après le premier rendu. Le premier rendu affiche le texte complet, puis le retire : le titre voisin est comprimé, puis la mise en page saute (CLS mobile de 0,094 mesuré).

## Correction

- Masquer par CSS (media query, prop média Tamagui), pas dans un effet.
- Le premier rendu est déjà le rendu final ; seul le style varie selon la largeur.
- Le nom accessible reste complet.

## Règle

`ed.ui-web-styling` : style déclaratif, sans correction de mise en page après le rendu.

## Vérification

- Audit à 390 et 1280 px, entrée directe et navigation Inertia : CLS nul.
- Aucun texte qui apparaît puis disparaît au chargement.
