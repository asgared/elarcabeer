# Supabase type definitions

We previously shipped a local `src/types/supabase.d.ts` stub to tweak the `User` type. The stub
redeclared the entire `@supabase/supabase-js` module, which prevents TypeScript from seeing the
real exports (such as `createClient`) once the package updated. This broke the production build
as soon as Next.js attempted to compile `src/lib/supabase/admin.ts`.

Going forward, rely on the official types that ship with `@supabase/supabase-js`. If you need to
augment a type, prefer module augmentation that merges with the existing declarations instead of
redeclaring the module shape. For example:

```ts
import type { User as SupabaseUser } from "@supabase/supabase-js";

declare module "@supabase/supabase-js" {
  interface User extends SupabaseUser {
    // add your fields here
  }
}
```

Alternatively, narrow the data where it is used (e.g. via runtime parsing) to avoid mutating the
vendor module at all.
