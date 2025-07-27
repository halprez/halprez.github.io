# Testing Documentation

This project includes comprehensive automated testing using GitHub Actions to ensure code quality, accessibility, and functionality.

## Test Suite Overview

### 🔍 **Validation Tests**
- **HTML Validation**: Uses `html-validate` to check HTML structure and standards compliance
- **CSS Validation**: Uses `stylelint` to enforce CSS coding standards and catch errors

### ♿ **Accessibility Tests**
- **axe-core Integration**: Automated accessibility testing using Playwright and axe-core
- **Navigation Structure**: Ensures proper heading hierarchy and landmark elements
- **WCAG Compliance**: Checks for common accessibility violations

### ⚡ **Functionality Tests**
- **Page Loading**: Verifies all main elements load correctly
- **Navigation**: Tests all menu links and scroll behavior
- **Contact Icons**: Ensures contact links are present and functional
- **Responsive Design**: Tests layout across different viewport sizes

### 🚀 **Performance Tests**
- **Lighthouse CI**: Automated performance, accessibility, best practices, and SEO auditing
- **Performance Thresholds**: 
  - Performance: 80%
  - Accessibility: 90%
  - Best Practices: 80%
  - SEO: 80%

### 🔗 **Link Checking**
- **Broken Link Detection**: Scans for broken internal and external links
- **Recursive Checking**: Tests all pages and resources

### 🔒 **Security Scanning**
- **Trivy Scanner**: Vulnerability scanning for dependencies and configuration
- **Security Reporting**: Results uploaded to GitHub Security tab

## Running Tests Locally

### Prerequisites
```bash
# Install Node.js (version 18 or higher)
npm install
```

### Available Commands
```bash
# Run all tests
npm test

# Run individual test suites
npm run test:html          # HTML validation
npm run test:css           # CSS validation
npm run test:a11y          # Accessibility tests
npm run test:functionality # Functionality tests
npm run test:lighthouse    # Performance tests

# Start local server for testing
npm run serve              # Python server
npm run serve:node         # Node.js server
```

### Manual Testing
```bash
# Install Playwright browsers
npx playwright install

# Run specific test files
npx playwright test tests/accessibility.spec.js
npx playwright test tests/functionality.spec.js

# Run with UI mode for debugging
npx playwright test --ui
```

## GitHub Actions Workflow

The testing workflow runs automatically on:
- **Push** to main/master branch
- **Pull requests** to main/master branch
- **Weekly schedule** (Sundays at 2 AM UTC)

### Workflow Jobs
1. **validation** - HTML & CSS validation
2. **accessibility** - Accessibility testing
3. **functionality** - Functionality testing
4. **lighthouse** - Performance testing
5. **link-checker** - Link validation
6. **security** - Security scanning

## Test Configuration

### HTML Validation (`.htmlvalidate.json`)
- Based on `html-validate:recommended`
- Allows inline styles (for dynamic styling)
- Relaxed whitespace rules

### CSS Validation (`.stylelintrc.json`)
- Based on `stylelint-config-standard`
- Allows flexible selector patterns
- Disabled specificity warnings for complex layouts

### Playwright Configuration
- Tests run in Chromium browser
- 30-second timeout per test
- Retry on failure in CI environment
- HTML reports generated

## Monitoring and Maintenance

### Viewing Test Results
- **GitHub Actions**: Check the "Actions" tab in your repository
- **Pull Requests**: Test status shown on PR checks
- **Security**: Security scan results in "Security" tab

### Updating Tests
- **New Features**: Add corresponding tests in `tests/` directory
- **Dependencies**: Update package.json and workflow file
- **Thresholds**: Adjust performance scores in `lighthouserc.js`

### Troubleshooting
- **Test Failures**: Check GitHub Actions logs for detailed error messages
- **Local Testing**: Use `npm run serve` to test locally before pushing
- **Browser Issues**: Update Playwright browsers with `npx playwright install`

## Best Practices

1. **Test Early**: Run tests locally before committing
2. **Accessibility First**: Ensure new features are accessible
3. **Performance Budget**: Monitor Lighthouse scores
4. **Security Updates**: Regularly update dependencies
5. **Documentation**: Update tests when adding new features

## Contributing

When adding new features:
1. Add corresponding tests
2. Ensure all tests pass locally
3. Update this documentation if needed
4. Check that GitHub Actions workflow succeeds