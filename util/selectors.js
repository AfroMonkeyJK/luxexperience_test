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
    loginPage: {
      usernameInput: 'input[name="username"]',
      passwordInput: 'input[name="password"]',
      submitButton: 'button[type="submit"]',
      errorMessage: ".error-message, .alert-danger",
      successIndicator: '.user-menu, .dashboard, [data-testid="user-profile"]',
    }
  };
};

export { selectors };
