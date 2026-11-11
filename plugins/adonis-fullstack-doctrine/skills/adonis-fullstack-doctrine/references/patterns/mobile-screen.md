# Pattern — Mobile screen

Écran natif complet : route, données, liste, formulaire et états.

## Route

```tsx
// apps/mobile/app/(app)/projects/index.tsx
import { ProjectListScreen } from '~/features/projects/project_list_screen'

export default function ProjectsRoute() {
  return <ProjectListScreen />
}
```

## Écran

```tsx
// apps/mobile/src/features/projects/project_list_screen.tsx
import { useQuery } from '@tanstack/react-query'
import { FlashList } from '@shopify/flash-list'
import { EmptyState, ErrorState, LoadingState, Screen } from '@scope/ui'
import { api } from '~/api/client'

export function ProjectListScreen() {
  const projects = useQuery(api.apiExternal.projects.index.queryOptions({ query: {} }))

  if (projects.isPending) return <LoadingState />
  if (projects.isError) return <ErrorState onRetry={projects.refetch} />
  if (projects.data.data.length === 0) return <EmptyState title="Aucun chantier" />

  return (
    <Screen>
      <FlashList
        data={projects.data.data}
        keyExtractor={(item) => item.id}
        estimatedItemSize={96}
        renderItem={({ item }) => <ProjectCard project={item} />}
      />
    </Screen>
  )
}
```

## Formulaire

```tsx
const form = useAppForm({
  defaultValues: { name: '' },
  onSubmit: async ({ value }) => {
    await api.apiExternal.projects.create.mutateAsync({ body: value })
    await queryClient.invalidateQueries()
    router.back()
  },
})
```

- TanStack Form via `@scope/ui/form`.
- Erreurs serveur injectées dans les field meta.
- `KeyboardAwareScrollView`.
- Bouton désactivé pendant l'envoi.

## États

Toujours prévoir :

- chargement ;
- erreur avec action de reprise ;
- vide avec action ;
- contenu ;
- hors ligne ou réseau lent si le produit le permet.

## Navigation

- `expo-router` ;
- deep link déclaré ;
- retour cohérent ;
- pas de navigation impérative dispersée.

## Accessibilité

- cibles tactiles >= 44 pt ;
- labels sur les icônes ;
- contraste suffisant ;
- texte qui ne dépend pas de la couleur seule ;
- ordre de focus logique.

## Tests

- rendu des quatre états ;
- navigation vers le détail ;
- soumission valide et invalide ;
- liste longue ;
- image manquante ;
- retour arrière.
