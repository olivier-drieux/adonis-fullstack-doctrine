# Formulaires

## Web

Utiliser Inertia pour les parcours standards.

```tsx
import { Form } from '@adonisjs/inertia/react'
import { Button, Field, Text } from '@scope/ui'

export function ProjectForm() {
  return (
    <Form route="projects.store">
      {({ errors, processing }) => (
        <>
          <Field name="name" label="Nom du chantier" error={errors.name} />
          <Field name="address" label="Adresse" error={errors.address} />
          {errors.message && <Text tone="danger">{errors.message}</Text>}
          <Button type="submit" disabled={processing}>
            Créer
          </Button>
        </>
      )}
    </Form>
  )
}
```

Pour un formulaire complexe (étapes, champs conditionnels, brouillon local), utiliser `useForm` d'Inertia. Ne pas installer React Hook Form, TanStack Form ou Formik côté web.

## Mobile

TanStack Form gère l'état, les champs, les tableaux et les erreurs. Tamagui fournit les inputs. L'adaptateur `@scope/ui/form` est la seule surface utilisée par les écrans.

```tsx
// packages/ui/src/form.tsx
import { useForm } from '@tanstack/react-form'

export function useAppForm<T>(options: Parameters<typeof useForm<T>>[0]) {
  return useForm({
    ...options,
    onSubmit: async (args) => {
      try {
        await options.onSubmit?.(args)
      } catch (error) {
        applyServerErrors(args.form, error)
      }
    },
  })
}

export function Field({ form, name, label, ...props }: FieldProps) {
  return (
    <form.Field name={name}>
      {(field) => (
        <YStack gap="$2">
          <Label htmlFor={name}>{label}</Label>
          <Input
            id={name}
            value={field.state.value}
            onChangeText={field.handleChange}
            onBlur={field.handleBlur}
            {...props}
          />
          <FieldError errors={field.state.meta.errors} />
        </YStack>
      )}
    </form.Field>
  )
}
```

```tsx
// apps/mobile/src/features/projects/project_form.tsx
const form = useAppForm({
  defaultValues: { name: '', address: '' },
  onSubmit: async ({ value }) => {
    await api.apiExternal.projects.create.mutateAsync({ body: value })
  },
})

<form.Subscribe selector={(state) => state.isSubmitting}>
  {(isSubmitting) => (
    <Button onPress={form.handleSubmit} disabled={isSubmitting}>
      Enregistrer
    </Button>
  )}
</form.Subscribe>
```

L'API exacte de TanStack Form évolue : vérifier les types installés avant d'utiliser `setFieldMeta`, `pushValue` ou `removeValue`.

## Validation

VineJS serveur est la seule source.

- Le client ajoute des contraintes natives : `required`, `maxLength`, clavier, format visible.
- Le client affiche les erreurs serveur, champ par champ.
- Le client ne recopie pas le schéma dans Zod, Yup ou un validateur maison.
- Un code d'erreur stable permet de mapper le message sans parser le texte.

```ts
// app/validators/project.ts
export const updateProjectValidator = vine.create({
  name: vine.string().trim().minLength(1).maxLength(120),
  address: vine.string().trim().maxLength(255).optional(),
})
```

## Server errors

Le serveur renvoie :

```json
{
  "code": "VALIDATION_FAILED",
  "message": "Vérifiez les informations saisies.",
  "errors": {
    "name": "Le nom est obligatoire.",
    "address": "L'adresse est trop longue."
  }
}
```

L'adaptateur injecte `errors` dans les field meta. Les erreurs non rattachées à un champ s'affichent dans un `Notice` global.

## Field arrays

Pour une liste de champs (téléphones, étapes, photos) :

- `mode="array"` sur le champ parent ;
- clés stables ;
- bouton d'ajout et de suppression explicites ;
- validation serveur de la liste complète ;
- focus sur le premier champ en erreur.

## Accessibility

- Chaque champ a un label visible.
- L'erreur est associée au champ et annoncée.
- Le bouton de soumission a un état `loading` et reste désactivé pendant l'envoi.
- Le clavier ne masque pas le champ actif : utiliser `react-native-keyboard-controller`.
- Le formulaire ne perd pas les valeurs saisies après une erreur serveur.
