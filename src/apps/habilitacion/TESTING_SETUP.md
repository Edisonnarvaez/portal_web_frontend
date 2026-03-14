# Testing Setup - Habilitación Module

## Current Status
✓ Test files created: 
- `presentation/components/__tests__/CriterioFormModal.test.tsx` (30+ tests)
- `domain/enums/__tests__/enums.test.ts` (20+ tests)
- `presentation/constants/__tests__/formConstants.test.ts` (25+ tests)

## Required Configuration

### 1. Install Testing Dependencies
```bash
npm install --save-dev vitest @testing-library/react @testing-library/user-event @vitest/ui
```

### 2. Create vitest.config.ts
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
});
```

### 3. Update package.json
Add test scripts:
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

### 4. Create test/setup.ts
```typescript
import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test
afterEach(() => {
  cleanup();
});
```

## Test Coverage
- CriterioFormModal: Creation, editing, validation, accessibility (30+ tests)
- Enums: All enum values, labels, type guards (20+ tests)
- Constants: Validation rules, defaults, messages, limits (25+ tests)
- **Total:** 75+ tests ready to run

## Next Steps
1. [ ] Install testing dependencies
2. [ ] Configure vitest.config.ts
3. [ ] Run tests: `npm test`
4. [ ] Extend coverage to CumplimientoFormModal and CumplimientoPanelPage
5. [ ] Set up CI/CD test execution
