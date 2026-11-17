# 0009 — Une brique partagée par rôle d'interface, aucune valeur visuelle littérale

- Date : 2026-11-17
- Source : correction utilisateur (Olau, audit de normalisation du style)
- Statut : acceptée

## Contexte

Sur Olau, le style a dérivé entre écrans et entre web et natif, alors que Tamagui et un package `ui` partagé étaient en place. Pour un même rôle, l'audit a relevé :

- boutons icône en cercle ici, en `quiet` ailleurs ;
- pastilles d'icône de tête recomposées à la main en 36, 40 ou 44 px, carrées ou rondes ;
- titres de section en 19/25, 19/26, 19/28 et 20/28 ;
- états vides tantôt titre et phrase, tantôt notice, tantôt texte nu ;
- rayons, couleurs, ombres et espacements écrits en dur ;
- chevrons de tailles et couleurs variées ;
- une rangée de notification différente sur web et natif.

La correction a demandé un audit complet et trois lots. Les règles existantes (`hb.ui-imports`, `ed.ui-theme`) garantissaient une seule bibliothèque, pas une seule forme par rôle. `adv.small-duplication` (« extraire à la troisième occurrence ») a même encouragé les recompositions locales.

L'utilisateur exige une règle forte pour que cela n'arrive plus.

## Décision

- `hb.ui-role-brick` (hard blocker) : chaque rôle d'interface récurrent a **une** brique dans `packages/ui`, utilisée à l'identique sur web et natif. Exemples de rôles : action de ligne, retour, tête de ligne, titre de section, état vide, chevron, compteur, chargement, notice. Un écran ne recompose jamais un rôle à partir de primitives. Un rôle nouveau commence par sa brique. Pour un rôle d'interface, la première occurrence suffit : `adv.small-duplication` ne s'applique pas.
- `hb.ui-no-visual-literals` (hard blocker) : aucune couleur, rayon, ombre, taille de police ni espacement littéral hors des tokens de `packages/ui`. Les exceptions (palette de dessin, impression) sont déclarées dans le registre d'exceptions.
- `ed.ui-style-guard` (enforced default) : le projet tient un catalogue des rôles (rôle → brique et variante) dans sa règle d'interface. Son gate `verify` refuse automatiquement les littéraux visuels et les recompositions connues. La revue rattache chaque élément nouveau à son rôle avant de valider.
- Le doctor ajoute la vérification `ui.literals`, qui avertit sur les couleurs hexadécimales et les rayons numériques dans les applications.

## Conséquences

- Une divergence de forme pour un même rôle est un défaut bloquant, pas une préférence.
- Les maquettes et les relectures nomment la brique de chaque élément.
- Le coût initial d'une brique est payé dès le premier écran ; la dérive coûte un audit.

## Règles affectées

- `hb.ui-role-brick` (nouvelle)
- `hb.ui-no-visual-literals` (nouvelle)
- `ed.ui-style-guard` (nouvelle)
- `adv.small-duplication` (exclut les rôles d'interface)

## Vérification

- `evaluation.test.mjs` : les trois règles sont sélectionnées pour une tranche `tamagui-component` ou `react-component`.
- `doctor.test.mjs` : un littéral hexadécimal dans `apps/web/src` avertit `ui.literals` ; un projet propre passe.
