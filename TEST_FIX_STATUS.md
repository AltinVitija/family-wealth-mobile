# Test Fixes Required

## Summary of Issues Found

When running `npx jest`, we discovered several fixable issues with the test suite.

### ✅ Already Fixed

1. **jest.config.js** - Added `react-native-css-interop` to transformIgnorePatterns
2. **jest.setup.js** - Updated AsyncStorage mock to return Promises properly
3. **react-test-renderer** - Installed correct version (19.1.0) matching React version

### ❌ Issues Remaining

#### 1. Login Test File - CORRUPTED

**File**: `src/screens/auth/__tests__/LoginScreenImproved.test.tsx`
**Status**: File was accidentally corrupted during sed replacement
**Solution**: Need to recreate the file with correct placeholders

**Key changes needed:**

- Replace all instances of `'your@email.com'` with `'email@example.com'`
- Ensure proper imports and structure

#### 2. Register Test File - Multiple Issues

**File**: `src/screens/auth/__tests__/RegisterScreenImproved.test.tsx`

**Issues:**

1. **"Create Account" appears twice** (title + button)
   - Solution: Use `getAllByText` or add testID to button
2. **"By registering, you agree to our" is inside nested Text**
   - Current test: `getByText('By registering, you agree to our')`
   - Actual render: Text is split across multiple nested Text components
   - Solution: Use `getByText(/By registering/)` with regex

3. **Mock service not working**
   - `registerServices.register` is undefined
   - Need to check actual export from `src/services/auth/register.services.ts`
   - May need to mock the actual export name

#### 3. All Other Test Files

**Files**: Dashboard, Family, Goals, Settings tests

**Status**: Not yet run due to Login/Register failures
**Expected**: Should work once jest.config and AsyncStorage fixes are applied

## Quick Fix Approach

Since the test files got corrupted, the fastest solution is to:

1. **Delete corrupted test files**:

   ```bash
   rm -rf src/screens/auth/__tests__
   ```

2. **Recreate from TESTING_SUMMARY.md** using the documented structure

3. **Or wait for tests to stabilize** and I can help regenerate them properly

## Alternative: Run Passing Tests Only

You can run just the Estate Utils tests that are currently passing:

```bash
npx jest src/screens/estate/__tests__/estate.utils.test.ts
```

This confirms the test infrastructure is working (35 tests pass).

## Recommendation

Would you like me to:

- **Option A**: Completely regenerate all 6 test files from scratch (recommended)
- **Option B**: Try to fix the corrupted files one by one
- **Option C**: Focus on getting one test file (like Dashboard) working first as a template
