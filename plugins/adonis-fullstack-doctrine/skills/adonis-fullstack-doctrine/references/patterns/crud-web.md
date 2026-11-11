# Pattern — CRUD web

Parcours complet d'une ressource, de la migration à la page Inertia.

## 1. Migration

```ts
export default class CreateProjects extends BaseSchema {
  async up() {
    this.schema.createTable('projects', (table) => {
      table.uuid('id').primary()
      table.string('name').notNullable()
      table.string('status').notNullable().defaultTo('draft')
      table.timestamps(true)
    })
  }

  async down() {
    this.schema.dropTable('projects')
  }
}
```

## 2. Modèle

```ts
export default class Project extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column()
  declare status: 'draft' | 'active'
}
```

## 3. Validateur

```ts
export const createProjectValidator = vine.create({
  name: vine.string().trim().minLength(1).maxLength(120),
  status: vine.enum(['draft', 'active'] as const),
})
```

## 4. Policy

```ts
export default class ProjectPolicy {
  create(user: User) {
    return user.canManageProjects
  }

  update(user: User, project: Project) {
    return project.ownerId === user.id
  }
}
```

## 5. Service

```ts
export class ProjectService {
  async create(user: User, payload: { name: string; status: 'draft' | 'active' }) {
    return Project.create({ ...payload, ownerId: user.id })
  }
}
```

## 6. Transformer

```ts
export default class ProjectTransformer extends BaseTransformer<Project> {
  toObject() {
    return this.pick(this.resource, ['id', 'name', 'status', 'updatedAt'])
  }
}
```

## 7. Contrôleur

```ts
export default class ProjectsController {
  async store({ request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(createProjectValidator)
    const project = await new ProjectService().create(auth.user!, payload)
    return response.created({ data: ProjectTransformer.transform(project) })
  }
}
```

## 8. Route

```ts
// start/routes.ts
router
  .group(() => {
    router.get('/projects', [controllers.Projects, 'index']).as('projects.index')
    router.post('/projects', [controllers.Projects, 'store']).as('projects.store')
  })
  .middleware('auth')
```

## 9. Page Inertia

```tsx
export default function ProjectsIndex({ projects }: InertiaProps<{ projects: Data.Project[] }>) {
  return (
    <AppShell title="Chantiers">
      {projects.length === 0 ? <EmptyState title="Aucun chantier" /> : null}
      <ProjectList projects={projects} />
    </AppShell>
  )
}
```

## 10. Tests

- création valide ;
- validation refusée ;
- policy refusée ;
- accès croisé ;
- rendu de la liste vide ;
- rendu de la liste avec données.

## Ordre

Migration → modèle → validateur → policy → service → transformer → contrôleur → route → test → page.
