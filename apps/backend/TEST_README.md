# Unit Tests

This directory contains unit tests for the backend business logic.

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Test Structure

Tests are organized in `__tests__` directories alongside the code they test:

- `src/utils/__tests__/` - Tests for utility functions
  - `taskStateTransition.test.ts` - Task state transition validation
  - `validation.test.ts` - Request validation schemas

- `src/middleware/__tests__/` - Tests for middleware
  - `authorize.middleware.test.ts` - Authorization logic

- `src/controllers/__tests__/` - Tests for controllers
  - `task.controller.test.ts` - Task business logic

## Test Coverage

The tests cover:

1. **Task State Transitions**
   - Valid transitions (BACKLOG → IN_PROGRESS → REVIEW → DONE)
   - Invalid transitions (skipping states, backward transitions)
   - Edge cases (same state, DONE state restrictions)

2. **Validation Schemas**
   - Registration and login validation
   - Project creation validation
   - Task creation and update validation
   - Status update validation

3. **Authorization Logic**
   - Owner role authorization
   - Project access authorization
   - Project owner authorization
   - Edge cases (missing IDs, non-existent projects)

4. **Task Business Logic**
   - Default assignee logic
   - Priority defaults
   - Status defaults

## Writing New Tests

When adding new business logic:

1. Create a `__tests__` directory next to the file you're testing
2. Name the test file `*.test.ts`
3. Follow the existing test patterns
4. Ensure tests are isolated and don't depend on external services
5. Mock external dependencies (database, APIs, etc.)

## Example Test Structure

```typescript
import { functionToTest } from '../module.js';

describe('Module Name', () => {
  describe('Function Name', () => {
    it('should do something when condition is met', () => {
      const result = functionToTest(input);
      expect(result).toBe(expectedOutput);
    });

    it('should handle edge case', () => {
      // Test edge case
    });
  });
});
```

