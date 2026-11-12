# @fabric-kit/forms

React Hook Form bindings for Fabric inputs, with Zod validation. Each binding connects a typed field path, value, blur state, disabled state, error message and helper text. It uses the existing Fabric component and theme.

## Install

```sh
pnpm add @fabric-kit/forms react-hook-form zod
```

Use Fabric's usual MUI, Emotion and React peer dependencies and mount `DesignSystemProvider` at the app root. Import React Hook Form APIs from `react-hook-form`; this package exports `zodResolver` from `@hookform/resolvers/zod`.

## Basic usage

```tsx
import { FabricButton } from "@fabric-kit/components";
import { FabricFormTextField, zodResolver } from "@fabric-kit/forms";
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({ email: z.email("Enter a valid email address.") });

export function ContactForm() {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
    mode: "onBlur",
  });
  return (
    <form noValidate onSubmit={form.handleSubmit((values) => console.log(values))}>
      <FabricFormTextField
        control={form.control}
        name="email"
        label="Email address"
        type="email"
        helperText="We will send delivery updates here."
      />
      <FabricButton type="submit" loading={form.formState.isSubmitting}>
        Save
      </FabricButton>
    </form>
  );
}
```

Validation errors replace helper text. Resetting or resolving the error restores the hint. `form.setError(name, { type: "server", message })` uses the same feedback.

## Bindings and value shapes

| Binding                                                                    | Form value                                                                                      |
| -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `FabricFormTextField`                                                      | Text; use `multiline` for a textarea and `type="number"` for numeric text                       |
| `FabricFormNumberField`                                                    | A number, or `null` when empty                                                                  |
| `FabricFormPasswordField`, `FabricFormOtpField`                            | A string                                                                                        |
| `FabricFormPhoneField`                                                     | An E.164 string such as `"+442071234567"`, or `""`                                              |
| `FabricFormTagInput`                                                       | A string array, with `[]` for none                                                              |
| `FabricFormFileUpload`                                                     | A `FabricUploadFile[]`; finished files carry your upload's `result`                             |
| `FabricFormSelect`                                                         | A string, with `""` for no selection (the Fabric select is single-select)                       |
| `FabricFormCheckbox`, `FabricFormSwitch`                                   | A boolean                                                                                       |
| `FabricFormRadio`                                                          | A string shared by radio options; each option supplies `value`                                  |
| `FabricFormRadioGroup`                                                     | A string, with `""` for no selection                                                            |
| `FabricFormCheckboxGroup`                                                  | A string array, with `[]` for no selection                                                      |
| `FabricFormToggleButtonGroup`                                              | A string or `null`; a string array with `exclusive={false}`                                     |
| `FabricFormAutocomplete`                                                   | An option or `null`; an option array with `multiple`; free-solo values can also be strings      |
| `FabricFormDatePicker`, `FabricFormTimePicker`, `FabricFormDateTimePicker` | `Date \| null` on change; initial values may also use the underlying picker's supported formats |
| `FabricFormDateRangePicker`                                                | `{ start: Date \| null, end: Date \| null }`                                                    |
| `FabricFormField`                                                          | Any custom value shape supported by React Hook Form                                             |

Supply `defaultValues` for every field, including empty strings, `false`, empty arrays and `null` as appropriate. This keeps controls controlled and makes `reset()` predictable. In particular, a non-clearable autocomplete needs an initial option. Do not call `register` on a bound input a second time.

`name` is a typed React Hook Form field path; nested objects and field-array paths work. The app owns the schema and must match each control's value shape. Bindings take the usual controller `rules`, `defaultValue`, `shouldUnregister` and `disabled` options. Supply `control`, or wrap the form with `FormProvider` and use a type argument such as `<FabricFormTextField<ContactValues> name="email" />`.

A disabled field is omitted from React Hook Form's submission data. Use read-only input props if the value should still be submitted. Avoid `shouldUnregister` with reordered field arrays, following React Hook Form's guidance.

## Numeric values and schema transforms

A text field, including `type="number"`, edits text. Parse it explicitly in a schema rather than silently converting empty text to zero. Schema input and output types may differ:

```tsx
const schema = z.object({
  seats: z
    .string()
    .min(1, "Enter a seat count.")
    .regex(/^\d+$/, "Use a whole number.")
    .transform(Number)
    .pipe(z.number().min(1)),
});
const form = useForm<z.input<typeof schema>, unknown, z.output<typeof schema>>({
  resolver: zodResolver(schema),
  defaultValues: { seats: "" },
});
// control carries both the editable string and submitted number types.
<FabricFormTextField control={form.control} name="seats" label="Seats" />;
```

Zod 3.25 and Zod 4 are supported through the resolver. The examples use Zod 4 syntax.

## Custom controls

```tsx
<FabricFormField control={form.control} name="email" helperText="Work email">
  {({ field, error, helperText }) => (
    <FabricTextField
      name={field.name}
      value={field.value}
      onChange={field.onChange}
      onBlur={field.onBlur}
      error={error}
      helperText={helperText}
      disabled={field.disabled}
      label="Email address"
    />
  )}
</FabricFormField>;
```

For controls without their own helper-text linkage, render your helper with the supplied `describedBy` ID and reference it with `aria-describedby`. A custom control that renders no standard input or focusable element should register its focus handle using `field.ref`.

## MUI capabilities, refs and accessibility

The underlying Fabric component props remain available, including `sx`, `className`, options, slots and input refs where supported. Form state owns `value`/`checked`, `onChange`, `onBlur` and `error`; do not override these through input slots. For autocomplete, overriding `renderInput` makes you responsible for forwarding its input params and validation feedback, just as with `FabricAutocomplete`.

`rootRef` receives the binding's outer DOM container. `form.setFocus(name)` and submit-error focus find the current input inside it, including grouped controls and MUI X's segmented fields. Blur events inside composite inputs mark the field touched, enabling `onBlur` and `onTouched` validation. Labels and descriptions use the underlying components' accessible markup. Checkbox, radio, switch and toggle bindings add linked error/helper text.

Disabled hints and group legends keep the theme’s readable secondary text color.

Use visible labels, or an explicit `aria-label` on icon-only controls. Group related standalone radios in a labelled `radiogroup`; prefer `FabricFormRadioGroup` for its built-in group label and keyboard behavior. Date/time pickers keep the underlying Fabric localization and free MUI X components. Picker `onError` remains available for app-specific validation constraints.

## Layout, wizard and unsaved changes

- `FabricForm` wraps `<form>`: it provides the form to every field (no `control` props), lists problems after a failed submit (`FabricFormErrorSummary`) and shows the message when `onSubmit` throws.
- `FabricFormSection`, `FabricFormRow` and `FabricFormActions` lay fields out in titled cards, side-by-side rows and a Save bar (`sticky` keeps it in view).
- `FabricWizard` splits one form into steps, validating each step's `fields` before Continue, with an optional review step.
- `useUnsavedChanges(isDirty)` warns before closing the tab and gives you `confirmLeave()` for in-app navigation.

```tsx
<FabricForm form={form} onSubmit={(values) => api.save(values)}>
  <FabricFormSection title="Contact">
    <FabricFormRow>
      <FabricFormTextField<Values> name="firstName" label="First name" />
      <FabricFormTextField<Values> name="lastName" label="Last name" />
    </FabricFormRow>
  </FabricFormSection>
  <FabricFormActions sticky submitLabel="Save contact" />
</FabricForm>;
```

Whole create, edit and settings pages are in `@fabric-kit/patterns` (`FabricFormPage`, `FabricSettingsPage`).
