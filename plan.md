# Fix "Failed to fetch" and TypeScript errors

## 1. Backend: Supabase Configuration
- **File**: `src/server/config/supabase.ts`
- **Fix**: Add/Ensure `import { createClient } from '@supabase/supabase-js';` and `import dotenv from 'dotenv';`.
- **Reason**: To resolve potential missing imports that prevent the backend from starting correctly.

## 2. Backend: Server Index
- **File**: `src/server/index.ts`
- **Fix**: Add/Ensure `import dotenv from 'dotenv';`.
- **Reason**: To ensure environment variables are correctly loaded at the entry point.

## 3. Frontend: TaskCard Component
- **File**: `src/components/TaskCard.tsx`
- **Fix**: Ensure the usage of `created_at` instead of `createdAt` to match the backend/Supabase schema.
- **Reason**: To resolve TypeScript errors regarding missing properties on the `Task` type.

## 4. Backend: Task Controller
- **File**: `src/server/controllers/taskController.ts`
- **Fix**: Correctly handle query/body parameters that might be `string | string[]` by ensuring they are strings before processing.
- **Reason**: To resolve TypeScript type mismatch errors when accessing `req.query` or `req.body`.

## 5. Verification
- Run `tsc -b && vite build` to confirm build errors are resolved.
- Verify the backend starts and handles requests correctly.
