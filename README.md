# Lux Experience E2E Test Automation

**Author:** Andreu Martinez  
**Role:** QA Engineer - Test Automation Specialist  
**Framework:** Playwright + Cucumber BDD (JavaScript)

---

## Installation & Requirements
Techincall test as Senior QA for Lux Experience

## Dependencies

Install the necessary dependencies:

```bash
npm install
npm init playwright@latest
npm install --save-dev @eslint/js
npm install winston
npm install dotenv
npm install cross-env
npm install multiple-cucumber-html-reporter
npm install rimraf
```

## ▶️ Running Tests

### Local Execution

Run all tests:
```bash
npm test
```

Run specific test suites:
```bash
npm run test-smoke          # Smoke tests only
npm run test-critical       # Critical path tests
```

Run with specific tags:
```bash
npm test -- --tags "@smoke"
npm test -- --tags "@critical"
```

### Cleaning Artifacts

Clean all test artifacts:
```bash
npm run clean-artifacts
```

Clean specific artifacts:
```bash
npm run clean-videos
npm run clean-screenshots
npm run clean-reports
```

### Environment Selection

Set environment via `.env` file:
```bash
ENV_VARS=production
```

Or override at runtime:
```bash
ENV_VARS=staging npm test
```

Available environments:
- `local` - http://localhost:4000/fashionhub/
- `staging` - https://staging-env/fashionhub/
- `production` - https://pocketaces2.github.io/fashionhub/ (default)

---