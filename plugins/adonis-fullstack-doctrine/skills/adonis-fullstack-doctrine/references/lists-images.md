# Listes et images

## FlashList

Au-delà de 20 éléments, utiliser `@shopify/flash-list`.

```tsx
import { FlashList } from '@shopify/flash-list'
import { ProjectCard } from '@scope/ui'

const renderItem = ({ item }: { item: Project }) => <ProjectCard project={item} />

<FlashList
  data={projects}
  renderItem={renderItem}
  keyExtractor={(item) => item.id}
  estimatedItemSize={96}
  getItemType={(item) => item.status}
/>
```

Règles :

- `estimatedItemSize` réaliste ; l'ajuster après mesure.
- `keyExtractor` stable, jamais l'index.
- Cellules mémoïsées (`React.memo`) si le rendu est coûteux.
- `getItemType` quand les hauteurs varient fortement.
- Éviter les fonctions inline dans `renderItem`.
- `onEndReached` pour la pagination, avec un garde anti-double-appel.
- Tester le scroll avec une liste de 200+ éléments.

Quand ne pas utiliser FlashList :

- moins de 20 éléments ;
- contenu statique et hétérogène ;
- formulaire long : préférer `KeyboardAwareScrollView`.
- listes imbriquées dans un scroll parent : restructurer l'écran.

## expo-image

```tsx
import { Image } from 'expo-image'

<Image
  source={{ uri: project.coverUrl }}
  style={{ width: '100%', height: 180 }}
  contentFit="cover"
  placeholder={blurhash}
  transition={200}
  cachePolicy="memory-disk"
  accessibilityLabel={`Photo de ${project.name}`}
/>
```

Règles :

- `contentFit` explicite (`cover`, `contain`).
- `placeholder` pour éviter le saut visuel.
- `cachePolicy="memory-disk"` pour les images distantes récurrentes.
- `priority="high"` seulement pour l'image principale.
- `recyclingKey` dans une liste pour éviter les images croisées.
- Dimensions connues ou ratio fixe pour éviter le layout shift.
- `Image` de React Native réservé aux assets locaux triviaux.

## Tests

- Vérifier le rendu d'une liste vide, d'une liste courte et d'une liste longue.
- Vérifier que `keyExtractor` ne dépend pas de l'index.
- Vérifier le placeholder et l'état d'erreur d'image.
- Mesurer le temps de scroll sur un appareil réel si la liste dépasse 200 éléments.
