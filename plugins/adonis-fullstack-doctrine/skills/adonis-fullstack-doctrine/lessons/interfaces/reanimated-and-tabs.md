# Reanimated et navigation entre onglets

- Date : 2026-11-18
- Catégorie : interfaces
- Source : projet pilote (olau)

## Erreur

Une animation Reanimated reçoit `Easing` importé de `react-native` : le dev client plante au démarrage (« The easing function is not a worklet »). Une barre d'onglets personnalisée utilise `dismissTo` entre navigateurs Tabs imbriqués (constaté avec expo-router 58) : en release, l'appui est reçu mais aucune route ne change.

## Correction

- Importer `Easing` depuis `react-native-reanimated`.
- Pour aller vers un onglet frère : `router.navigate` vers la racine de l'onglet.

## Règle

`hb.mobile-expo` : `expo-router` et les bibliothèques Expo, avec leurs propres primitives.

## Vérification

- Ouvrir la route animée dans un dev client Android.
- En release, changer d'onglet et confirmer la route cible.
