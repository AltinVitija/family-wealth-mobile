# Testing Documentation

## Overview

This document describes the unit tests for the Family Wealth Management mobile application.

## Test Structure

### Estate Screen Tests (`estate.utils.test.ts`)

Located at: `src/screens/estate/__tests__/estate.utils.test.ts`

This file contains unit tests for the utility functions used in the Estate Screen. These tests verify business logic without requiring full component rendering.

#### Test Coverage:

1. **calculateTotalValue** - Tests asset value calculation
   - Empty asset arrays
   - Single and multiple assets
   - Assets with zero values
2. **getTotalPercentage** - Tests beneficiary percentage calculation
   - Empty beneficiaries
   - Single and multiple beneficiaries
   - Beneficiaries with zero percentage

3. **validateBeneficiaries** - Tests beneficiary validation logic
   - Empty beneficiaries (valid)
   - Percentages totaling 100% (valid)
   - Percentages not totaling 100% (invalid)
   - Percentages exceeding 100% (invalid)

4. **validateEstatePlanForm** - Tests form validation
   - Valid form data
   - Empty title
   - Whitespace-only title
   - Invalid beneficiary percentages
   - Multiple validation errors

5. **formatCurrency** - Tests currency formatting
   - Zero values
   - Positive numbers
   - Large numbers
   - Decimal numbers

6. **getStatusColor** - Tests status color mapping
   - Active (green)
   - Draft (orange)
   - Archived (gray)
   - Unknown status (default gray)

7. **getStatusLabel** - Tests Albanian status labels
   - Active → "Aktiv"
   - Draft → "Draft"
   - Archived → "Arkivuar"

8. **mapAssetTypeForAPI** - Tests asset type mapping
   - savings → cash (for API compatibility)
   - Other types remain unchanged

## Running Tests

### Prerequisites

```bash
npm install --save-dev @testing-library/react-native @testing-library/jest-native jest-expo
npm install --save-dev @types/jest
```

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm test -- --watch
```

### Run Tests with Coverage

```bash
npm test -- --coverage
```

### Run Specific Test File

```bash
npm test estate.utils.test
```

## Test Configuration

### jest.config.js

The Jest configuration is set up to:

- Use `jest-expo` preset
- Transform node_modules appropriately
- Collect coverage from TypeScript files
- Use custom module name mapping

### jest.setup.js

The setup file mocks:

- AsyncStorage
- react-native-safe-area-context
- Animated components
- Expo modules

## Test Best Practices

1. **Unit Tests** - Focus on testing individual functions and business logic
2. **Isolation** - Each test should be independent
3. **Descriptive Names** - Test names should clearly describe what they test
4. **AAA Pattern** - Arrange, Act, Assert
5. **Edge Cases** - Always test edge cases and error conditions

## Future Testing

### Component Tests (Recommended)

For full component testing, consider:

- React Native Testing Library for component rendering
- User event simulation
- Snapshot testing for UI consistency

### Integration Tests

- API integration tests
- Redux store integration
- Navigation flow tests

### E2E Tests

- Consider Detox or Appium for end-to-end testing
- Test critical user flows
- Test on real devices

## Test Metrics

### Coverage Goals

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

### Current Coverage

Run `npm test -- --coverage` to see current coverage metrics.

## Continuous Integration

### CI/CD Integration

Add these npm scripts to `package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --maxWorkers=2"
  }
}
```

### GitHub Actions Example

```yaml
- name: Run tests
  run: npm run test:ci

- name: Upload coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/lcov.info
```

## Troubleshooting

### Common Issues

1. **Module not found**
   - Ensure all test dependencies are installed
   - Check `moduleNameMapper` in jest.config.js

2. **Transform errors**
   - Verify `transformIgnorePatterns` includes all necessary packages
   - Check babel configuration

3. **Timeout errors**
   - Increase test timeout: `jest.setTimeout(10000)`
   - Check for unresolved promises

## Contributing

When adding new features:

1. Write tests first (TDD approach)
2. Ensure tests pass before committing
3. Maintain or improve code coverage
4. Update this documentation if needed

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
