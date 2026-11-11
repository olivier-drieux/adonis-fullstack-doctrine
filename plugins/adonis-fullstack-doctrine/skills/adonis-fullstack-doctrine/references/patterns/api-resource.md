# Pattern — API resource

Endpoint JSON pour le mobile ou un client machine, sur `api.external`.

## Route

```ts
// start/routes/api_external.ts
router
  .group(() => {
    router.get('/projects', [controllers.ApiProjects, 'index']).as('api_external.projects.index')
    router.get('/projects/:id', [controllers.ApiProjects, 'show']).as('api_external.projects.show')
    router.post('/projects', [controllers.ApiProjects, 'store']).as('api_external.projects.store')
  })
  .prefix('/api')
  .middleware('auth:api')
```

## Validateur

```ts
export const listProjectsValidator = vine.create({
  page: vine.number().positive().optional(),
  perPage: vine.number().positive().max(100).optional(),
  q: vine.string().trim().maxLength(120).optional(),
})
```

## Service

```ts
export class ListProjects {
  async execute(input: { page?: number; perPage?: number; q?: string }) {
    return Project.query()
      .if(input.q, (query) => query.whereLike('name', `%${input.q}%`))
      .orderBy('updated_at', 'desc')
      .paginate(input.page ?? 1, input.perPage ?? 20)
  }
}
```

## Contrôleur

```ts
export default class ApiProjectsController {
  async index({ request }: HttpContext) {
    const input = await request.validateUsing(listProjectsValidator)
    const paginator = await new ListProjects().execute(input)
    return {
      data: ProjectTransformer.transform(paginator.all()),
      meta: paginator.getMeta(),
    }
  }
}
```

## Contrat

- `200` liste, `201` création, `204` suppression.
- `403` interdit, `404` introuvable, `409` conflit, `422` validation.
- Erreur : `{ "code": "...", "message": "..." }`.
- Pagination : `data` + `meta`.
- Aucun modèle brut.

## Tuyau

```ts
const projects = await api.apiExternal.projects.index.queryOptions({ query: { page: 1 } })
```

Après toute modification de route :

```bash
pnpm --filter api generate:api-client
```

## Tests

- auth absente, token expiré, token d'un autre utilisateur ;
- pagination et filtres ;
- validation ;
- accès croisé ;
- contrat de forme de la réponse.
