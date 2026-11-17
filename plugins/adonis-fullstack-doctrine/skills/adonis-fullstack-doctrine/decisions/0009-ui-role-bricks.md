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

- `hb.ui-role-brick` (hard blocker) : chaque rôle d'interface identifiable et appelé à revenir a **une** brique dans `packages/ui`, utilisée à l'identique sur toutes les plateformes du profil. La brique reste présentationnelle (`hb.ui-shared-boundary`) : elle reçoit des props, sans logique métier. Exemples de rôles : action de ligne, retour, tête de ligne, titre de section, état vide, chevron, compteur, chargement, notice. Un écran ne recompose jamais un rôle à partir de primitives. Un rôle nouveau commence par sa brique. Pour un rôle d'interface, la première occurrence suffit : `adv.small-duplication` ne s'applique pas.
- `hb.ui-no-visual-literals` (hard blocker) : aucune couleur, rayon, ombre, taille de police ni espacement littéral hors des tokens de `packages/ui`. Les exceptions (palette de dessin, impression) sont déclarées dans `.doctrine-exceptions.json` du projet, avec raison et date.
- `ed.ui-style-guard` (enforced default) : le projet tient un catalogue des rôles (rôle → brique et variante) dans sa règle d'interface. Son gate `verify` refuse automatiquement les littéraux visuels et les recompositions connues. La revue rattache chaque élément nouveau à son rôle avant de valider.
- Le doctor ajoute la vérification `ui.literals`. Elle signale, dans `apps/*` et `packages/*` hors `ui`, les couleurs hexadécimales et fonctions de couleur, ainsi que les rayons, tailles de police et interlignes numériques non nuls (raccourcis `br`, `fos`, `lh` et valeurs en chaîne compris). Elle ignore les commentaires, `url(#…)`, `to=`/`href=` et les sélecteurs. Le détail et les limites sont dans `tamagui.md#roles`.
- `ui.literals` reste au niveau `warn`, bien que la règle soit un hard blocker. C'est une heuristique par expressions régulières : elle produit des faux positifs (ancre ou sélecteur non prévu, `#abc` pris pour une couleur) et des oublis (`line-height` CSS, valeurs calculées, ombres, espacements). Un `fail` bloquerait des projets conformes sur un faux positif. Le blocage effectif appartient au gate `verify` du projet (`ed.ui-style-guard`), qui connaît ses briques et ses exceptions.
- Une exception à `hb.ui-no-visual-literals` liste ses fichiers (`files`, globs). Le doctor n'exclut que ces fichiers et continue de contrôler les autres. Sans `files`, l'exception couvre toute la règle, ce qui est à éviter.
- Les deux règles bloquantes sont chargées avec les tranches `tamagui-component` et `react-component`, comme `hb.ui-imports`, et non à chaque tranche.

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

- `evaluation.test.mjs` : les trois règles sont sélectionnées pour une tranche `tamagui-component` ou `react-component`. La tranche `testing` sélectionne `ed.ui-style-guard`.
- `doctor.test.mjs` : commentaires, `href="#…"`, `href='/x#…'`, `to="#…"`, `url(#…)`, `url('#…')`, `querySelector('#…')`, `getElementById` et `borderRadius={0}` passent. Avertissent : un `#hex`, `borderRadius={12}`, `br={12}`, `fos={19}`, `fontSize="19"`, `fontSize: 19`, `borderRadius: 0.5`, `lineHeight={28}` et un `rgba(` en CSS module. Les tokens de `packages/ui` sont ignorés. Une exception avec `files` n'exclut que les fichiers listés, une exception sans `files` donne `exception`.
- Leçon `lessons/interfaces/ui-style-drift.md`.
