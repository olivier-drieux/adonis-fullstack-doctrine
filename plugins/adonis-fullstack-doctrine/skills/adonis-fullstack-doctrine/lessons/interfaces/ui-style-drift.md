# Le style dérive quand un rôle se recompose à chaque écran

- Date : 2026-11-17
- Catégorie : interfaces
- Source : correction utilisateur (projet pilote)

## Erreur

Tamagui et `packages/ui` étaient en place, mais chaque écran recomposait ses éléments récurrents avec des primitives et des valeurs en dur. Pour un même rôle, l'audit a trouvé : pastilles d'icône de 36, 40 ou 44 px, rondes ou carrées ; titres de section de 19/25 à 20/28 ; états vides en titre + phrase, en notice ou en texte nu ; rayons, couleurs et ombres littéraux ; rangée de notification différente sur web et natif. Trois lots ont été nécessaires pour corriger.

## Correction

- Une brique par rôle dans `packages/ui` (`IconTile`, `EmptyState`, `Subheading`, `ListRow`…), remplaçant toutes les recompositions.
- Littéraux remplacés par les tokens de même valeur.
- Catalogue rôle → brique écrit dans la règle d'interface du projet, garde automatique dans `verify`.

## Règle

`hb.ui-role-brick`, `hb.ui-no-visual-literals`, `ed.ui-style-guard` (décision 0009).

## Vérification

- Doctor : `ui.literals` passe ou ne signale que des exceptions déclarées.
- Revue : chaque élément d'une capture est rattaché à sa brique.
