# Champ multipart vide transformé en 0 et compteur de parts

- Date : 2026-11-18
- Catégorie : serveur
- Source : projet pilote (olau)

## Erreur

Un champ numérique optionnel arrive vide dans une requête `multipart/form-data`. Le bodyparser (`convertEmptyStringsToNull`, actif par défaut) le convertit en `null`. Le schéma VineJS le déclare `.nullable()` avec `.transform((v) => Number(v))` : VineJS exécute la transformation sur `null`, `Number(null)` vaut `0`, et le service reçoit `0` au lieu de « absent ». Le test qui appelle le service directement passe ; la vraie requête HTTP échoue.

Séparément, `maxFields` est réglé sur le nombre de champs texte, et une requête qui porte aussi des fichiers est rejetée.

## Correction

- Considérer qu'un champ multipart vide arrive en `null`.
- Préférer `vine.number().nullable()` à une transformation maison.
- Une transformation sur un champ `.nullable()` traite `null` explicitement : `(v) => (v === null ? null : Number(v))`.
- `maxFields` compte toutes les parts, champs et fichiers. Le dimensionner sur le formulaire complet.

## Règle

`hb.forms-server-validation` : VineJS serveur reste la seule source. Il valide la forme réelle de la requête, voir `forms.md#validation`.

## Vérification

- Test fonctionnel par une vraie requête HTTP multipart, champ absent, vide et rempli.
- Test avec le nombre maximal de fichiers et tous les champs remplis.
