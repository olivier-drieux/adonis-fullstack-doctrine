# 0008 — Transport, cache et façade du client mobile

- Date : 2026-11-07
- Source : retour d'expérience
- Statut : acceptée

## Contexte

La règle `hb.api-client-single` disait qu'un seul client Tuyau et un seul `QueryClient` étaient autorisés. L'application de la règle a montré qu'elle confondait trois niveaux :

- le transport HTTP (`createApiClient` ou `createTuyau`) ;
- le cache (`QueryClient`) ;
- la façade typée (`createTuyauReactQueryClient`).

Un projet peut avoir **un** transport, **un** cache, et plusieurs façades. L'intention de la règle est respectée ; sa lettre ne l'est pas. Le risque réel est la duplication de la façade, pas une incohérence de cache.

## Décision

- `hb.api-client-single` reste un hard blocker, mais vise uniquement le transport et le cache.
- `ed.api-facade-single` est ajouté comme enforced default : une façade partagée via `useApi(client)` ou un contexte.
- Le doctor rend deux vérifications distinctes : `api.transport` et `api.facade`.
- Une façade par feature est un avertissement, pas un échec bloquant.

## Conséquences

- Un projet avec un transport et un cache est conforme au hard blocker ; plusieurs façades déclenchent un avertissement.
- Aucun changement de code n'est requis pour satisfaire la règle.
- Le template mobile partage un seul `QueryClient` et une seule façade.
- La référence `mobile.md#api-client` explique les trois niveaux.

## Vérification

- `evaluation.test.mjs` vérifie que les deux règles sont sélectionnées ensemble.
- `doctor.test.mjs` vérifie les cas 1 transport / 1 cache, 2 transports, plusieurs façades, et l'exclusion des tests.
