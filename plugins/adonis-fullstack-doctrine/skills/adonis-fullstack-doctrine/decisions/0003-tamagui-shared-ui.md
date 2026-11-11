# 0003 — Tamagui partagé, sans thème imposé

- Date : 2026-11-07
- Source : décision utilisateur « on reste sur Tamagui »
- Statut : acceptée

## Contexte

Mantine et Gluestack ciblent un seul runtime : le web pour le premier, le natif pour le second. Partager des composants entre les deux est alors interdit.

Tamagui 3 cible les deux runtimes. Il supprime la raison technique de cette interdiction.

## Décision

Tamagui 3 est l'unique bibliothèque de composants. `packages/ui` contient :

- les primitives ;
- les composants réellement partagés et feature-agnostic ;
- le provider, les tokens, les variantes et le motion.

Les applications importent uniquement depuis `@scope/ui`, jamais depuis `tamagui`.

La doctrine fournit le **mécanisme** de thème, pas les valeurs. Aucune palette, police ou identité n'est imposée.

## Conséquences

- Mantine, Gluestack, NativeWind, react-native-paper et shadcn sont interdits comme défaut.
- Une seule instance Tamagui vit dans `packages/ui`.
- Les composants métier restent dans l'application.
- CSS Modules uniquement en échappatoire web.
- Signal peut servir d'exemple de thème, sans être normatif.
