# 🧪 Testing Setup Guide

## Current Status

Some test files have been disabled due to missing testing dependencies. This document explains how to re-enable them.

## Missing Dependencies

The following npm packages are required for testing:

```bash
npm install --save-dev vitest @testing-library/react @testing-library/user-event
```

## Disabled Test Files

1. **CriterioFormModal.test.tsx** → `CriterioFormModal.test.tsx.disabled`
   - Location: `src/apps/habilitacion/presentation/components/__tests__/`
   - Reason: Missing `vitest`, `@testing-library/react`, `@testing-library/user-event`
   - Action: Rename to `.test.tsx` after installing dependencies

2. **enums.test.ts** → `enums.test.ts.disabled`
   - Location: `src/apps/habilitacion/domain/enums/__tests__/`
   - Reason: Missing `vitest`
   - Action: Rename to `.test.ts` after installing dependencies

3. **formConstants.test.ts** → `formConstants.test.ts.disabled`
   - Location: `src/apps/habilitacion/presentation/constants/__tests__/`
   - Reason: Missing `vitest`
   - Action: Rename to `.test.ts` after installing dependencies

## Setup Instructions

### Step 1: Install Dependencies
```bash
npm install --save-dev vitest @testing-library/react @testing-library/user-event
```

### Step 2: Add Testing Configuration

Create or update `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### Step 3: Rename Test Files
```bash
# Enable CriterioFormModal tests
mv src/apps/habilitacion/presentation/components/__tests__/CriterioFormModal.test.tsx.disabled \
   src/apps/habilitacion/presentation/components/__tests__/CriterioFormModal.test.tsx

# Enable enum tests
mv src/apps/habilitacion/domain/enums/__tests__/enums.test.ts.disabled \
   src/apps/habilitacion/domain/enums/__tests__/enums.test.ts

# Enable form constants tests
mv src/apps/habilitacion/presentation/constants/__tests__/formConstants.test.ts.disabled \
   src/apps/habilitacion/presentation/constants/__tests__/formConstants.test.ts
```

### Step 4: Update package.json Scripts

Add test commands to `package.json`:
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

### Step 5: Run Tests
```bash
npm test
```

## Test Files Overview

### CriterioFormModal.test.tsx
Tests the Criterio form modal component including:
- Modal rendering in create/edit modes
- Form field validation
- Submit and cancel operations
- Delete functionality

### enums.test.ts
Tests domain enums including:
- Enum values and labels
- Validation functions
- Type safety

### formConstants.test.ts
Tests form validation constants including:
- Form default values
- Validation rules
- Error messages
- Input limits

## Troubleshooting

### Issue: React not found
**Solution:** Install `@vitejs/plugin-react`
```bash
npm install --save-dev @vitejs/plugin-react
```

### Issue: jsdom not found
**Solution:** Install `jsdom`
```bash
npm install --save-dev jsdom
```

### Issue: Tests not running
**Solution:** Ensure `vitest` is installed correctly
```bash
npm install --save-dev vitest@latest
```

## Related Documentation

- [Vitest Documentation](https://vitest.dev)
- [Testing Library Documentation](https://testing-library.com)
- [React Testing Best Practices](https://react-testing-library.com/docs/queries)

---

**Last Updated:** March 14, 2026
