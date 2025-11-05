import { LocatorUtil } from '../util/locator.js';

const selectors = page => {
  const locator = new LocatorUtil(page);

  return {
    Alert: {
      byText: alertText => locator.byRoleAlert(alertText).filter({ hasText: alertText })
    },
    Button: {
      byName: buttonName => locator.byRoleButton(buttonName, true).filter({ hasText: buttonName })
    },
    pullRequest: {
      hoverCard: '[data-hovercard-type="pull_request"]'
    },
    loginPage: {
      usernameInput: 'input[name="username"]',
      passwordInput: 'input[name="password"]',
      submitButton: 'input[type="submit"]',
      errorMessage: ".error-message, .alert-danger",
      successIndicator: '.user-menu, .dashboard, [data-testid="user-profile"]',
    }
  };
};

export { selectors };
