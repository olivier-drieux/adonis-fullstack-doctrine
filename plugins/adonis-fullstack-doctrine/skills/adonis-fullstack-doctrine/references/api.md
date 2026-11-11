# API — AdonisJS 7

## Surfaces

Chaque route est classée par **rôle**, pas par préfixe d'URL.

| Surface | Usage | Auth | CSRF |
| --- | --- | --- | --- |
| `web` | Pages Inertia | session `web` | actif |
| `api.internal` | JSON même origine depuis le navigateur | session `web` | actif |
| `api.external` | Mobile, CLI, machine | tokens `api` | inactif |
| `webhooks` | Fournisseurs tiers | signature | inactif |
| `runtime` | Santé, MCP, ponts opérateur | middleware dédié | inactif |
| `public` | Liens tokenisés anonymes | token/signature | inactif |

Un contrôleur ne traverse jamais deux surfaces. Chaque surface a son fichier de routes et sa chaîne de middleware.

```text
start/routes.ts              web
start/routes/api_internal.ts
start/routes/api_external.ts
start/routes/webhooks.ts
start/routes/runtime.ts
start/routes/public.ts
```

Déclarer les fichiers non-web dans `adonisrc.ts` via `preloads`.

## Tuyau

Le registre est généré dans `packages/api-client/src`. Toute route ajoutée, renommée ou supprimée exige :

1. régénération du registre ;
2. commit du registre dans la même modification ;
3. vérification que le nombre de routes a changé si la route a changé.

```bash
pnpm --filter api generate:api-client
```

Un registre périmé passe le typecheck sur une machine chaude mais casse un clone neuf et le build Docker.

## Errors

Contrat stable :

```json
{ "code": "REVISION_CONFLICT", "message": "La version a changé." }
```

- `201` création, `200` mise à jour, `204` suppression.
- `403` interdit, `404` introuvable, `409` conflit, `422` validation.
- Jamais de stack, de message d'exception brut, de payload ou de token dans la réponse.
- Les décisions métier ne parsent jamais un texte humain ou fournisseur.

## Inventory

Avant toute refonte de routes :

1. lire `start/routes.ts` et tous ses imports ;
2. énumérer chaque route montée ;
3. la classer par rôle ;
4. produire un tableau écrit ;
5. mettre à jour toute matrice de routes versionnée dans le même changement.

Une route oubliée est une faille ou un 404 silencieux.

## Webhooks

- Vérifier la signature ou le secret **avant** tout traitement.
- En production, un secret absent signifie refus.
- Les événements dupliqués ou hors ordre sont no-op quand ils ne progressent pas.
- Le rejet est observable (log redacted, métrique), sans jeter une exception qui masque la cause.
- Tester la signature absente, invalide, valide, et le rejeu.

## Feature order

Ordre de construction :

1. `packages.adonisjs.com` ;
2. env/config ;
3. migration ;
4. modèle ;
5. validateur ;
6. policy ;
7. service ;
8. transformer ;
9. effets de bord ;
10. contrôleur ;
11. routes ;
12. tests ;
13. UI.

## Naming

- Contrôleurs : `controllers.Posts` via `#generated/controllers`, pas `controllers.PostsController`.
- Un validateur par action.
- Un service par cas d'usage.
- Une policy par ressource.
- Routes nommées : `posts.store`, `posts.show`.

## Services

Le contrôleur valide, délègue, transforme et répond. Le service orchestre :

- écritures ;
- transactions explicites ;
- effets de bord ;
- jobs.

Les I/O externes restent hors transaction quand c'est possible. Un job dépendant est dispatché **après** le commit de la transaction qui revendique la ligne.

## Transformers

Le transformer est la frontière de sérialisation :

```ts
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class ProjectTransformer extends BaseTransformer<Project> {
  toObject() {
    return this.pick(this.resource, ['id', 'name', 'status', 'updatedAt'])
  }
}
```

- Allow-list explicite, jamais un modèle brut.
- Les agrégats viennent de `this.resource.$extras`.
- Une surface plus sensible reçoit un transformer plus étroit.
- Aucun champ chiffré n'est exposé sans besoin du destinataire.

## Policies

Une policy par ressource, refus par défaut (`403`). Vérifier la ressource parente avant de résoudre l'enfant. Revalider les prédicats sensibles dans la transaction de mutation.

## Pagination

Validateur dédié : `page`, `perPage`, `q`, `sort`, `direction`. Défaut `20`, maximum `100`. Le transformer du paginator expose `data` et `meta`.

## Example

```ts
// app/validators/project.ts
import vine from '@vinejs/vine'

export const createProjectValidator = vine.create({
  name: vine.string().trim().minLength(1).maxLength(120),
  status: vine.enum(['draft', 'active'] as const),
})

// app/services/project_service.ts
export class ProjectService {
  async create(payload: { name: string; status: 'draft' | 'active' }) {
    return Project.create(payload)
  }
}

// app/controllers/projects_controller.ts
export default class ProjectsController {
  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createProjectValidator)
    const project = await new ProjectService().create(payload)
    return response.created({ data: ProjectTransformer.transform(project) })
  }
}
```
