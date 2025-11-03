import logger from '../util/logger.js';

class LocatorUtil {
  constructor(page) {
    this.page = page;
  }

  /**
   * Find element by its attribute and value of the attribute.
   *
   * @param tag Tag name of the element we want to locate
   * @param attribute Attribute name of the element
   * @param value Value of the element's attribute
   * @param options Additional options like exact match.
   * @returns {Locator} The located button element.
   */
  byAttribute(tag, attribute, value, options) {
    logger.debug(
      `Locating element by attribute: ${tag}[${attribute}="${value}"] (Options: ${JSON.stringify(options)})`
    );
    const valueToUse = value instanceof RegExp ? value.source : value;
    const exact = options && options.exact ? '=' : '*=';
    const caseInsensitive = options && options.exact ? '' : 'i';
    return this.page.locator(`${tag}[${attribute}${exact}"${valueToUse}"${caseInsensitive}]`);
  }

  /**
   * Finds a Alert banner element based on its text, supporting exact or partial matches.
   * @param {string} text The text to match in the alert.
   * @param {boolean} exact Whether the match is exact (default: false).
   * @returns {Locator} The located alert element.
   * @example
   * // Normal match
   * const alert = locator.byRoleAlert('Warning: Changes have not been saved');
   *
   * // Exact match
   * const exactAlert = locator.byRoleAlert('Warning: Changes have not been saved', true);
   *
   * // RegExp match (case-insensitive)
   * const regExpAlert = locator.byRoleAlert(/warning: changes have not been saved/i);
   */
  byRoleAlert(text, exact = false) {
    logger.debug(`Locating alert with text: "${text}" (Exact: ${exact})`);
    return this.page.getByRole('alert').filter({ hasText: exact ? text : new RegExp(text, 'i') });
  }

  /**
   * Finds a button element based on its text, supporting exact or partial matches.
   *
   * @param text - The text to match.
   * @param exact - Whether the match is exact (default: false).
   * @returns {Locator} The located button element.
   * @example
   * // Normal match
   * const button = locator.byRoleButton('Submit');
   *
   * // Exact match
   * const exactButton = locator.byRoleButton('Submit', true);
   *
   * // RegExp match (case-insensitive)
   * const regExpButton = locator.byRoleButton(/submit/i);
   */
  byRoleButton(text, exact = false) {
    logger.debug(`Locating button with text: "${text}" (Exact: ${exact})`);
    return this.page.getByRole('button', { name: exact ? text : new RegExp(text, 'i') });
  }

  /**
   * Finds a Checkbox element based on its text, supporting exact or partial matches.
   * @param {string} text The text to match in the checkbox.
   * @param {boolean} exact Whether the match is exact (default: false).
   * @returns {Locator} The located checkbox element.
   * @example
   * // Normal match
   * const checkbox = locator.byRoleCheckbox('Accept Terms and Conditions');
   *
   * // Exact match
   * const exactCheckbox = locator.byRoleCheckbox('Accept Terms and Conditions', true);
   *
   * // RegExp match (case-insensitive)
   * const regExpCheckbox = locator.byRoleCheckbox(/accept terms and conditions/i);
   */
  byRoleCheckbox(text, exact = false) {
    logger.debug(`Locating checkbox with text: "${text}" (Exact: ${exact})`);
    return this.page.getByRole('checkbox', { hasText: exact ? text : new RegExp(text, 'i') });
  }

  /**
   * Finds a Dialog banner element based on its text, supporting exact or partial matches.
   * @param {string} text The text to match in the dialog.
   * @param {boolean} exact Whether the match is exact (default: false).
   * @returns {Locator} The located dialog element.
   * @example
   * // Normal match
   * const dialog = locator.byRoleDialog('Confirmation');
   *
   * // Exact match
   * const exactDialog = locator.byRoleDialog('Confirmation', true);
   *
   * // RegExp match (case-insensitive)
   * const regExpDialog = locator.byRoleDialog(/confirmation/i);
   */
  byRoleDialog(text, exact = false) {
    logger.debug(`Locating dialog with label: "${text}" (Exact: ${exact})`);
    return this.page.getByRole('dialog', { hasText: exact ? text : new RegExp(text, 'i') });
  }

  /**
   * Finds a heading element based on its text, supporting exact or partial matches.
   *
   * @param text - The text to match.
   * @param exact - Whether the match is exact (default: false).
   * @returns {Locator} The located heading element.
   * @example
   * // Normal match
   * const heading = locator.byRoleHeading('Welcome');
   *
   * // Exact match
   * const exactHeading = locator.byRoleHeading('Welcome', true);
   *
   * // RegExp match (case-insensitive)
   * const regExpHeading = locator.byRoleHeading(/welcome/i);
   */
  byRoleHeading(text, exact = false) {
    logger.debug(`Locating heading with text: "${text}" (Exact: ${exact})`);
    return this.page.getByRole('heading', { name: exact ? text : new RegExp(text, 'i') });
  }

  /**
   * Finds an input element based on its associated label.
   *
   * @param text - The label text to match (string or RegExp).
   * @param options - Additional options like exact match.
   * @returns {Locator} The located input element.
   * @example
   * // Normal match
   * const input = locator.byLabel('Username');
   *
   * // Exact match
   * const exactInput = locator.byLabel('Username', { exact: true });
   *
   * // RegExp match (case-insensitive)
   * const regExpInput = locator.byLabel(/username/i);
   */
  byLabel(text, options = {}) {
    logger.debug(`Locating input with label: "${text}" (Options: ${JSON.stringify(options)})`);
    return this.page.getByLabel(text, options);
  }

  /**
   * Finds an input element based on its placeholder text.
   *
   * @param text - The placeholder text to match (string or RegExp).
   * @param options - Additional options like exact match.
   *
   * @example
   * // Normal match
   * const input = locator.byPlaceholder('Search');
   *
   * // Exact match
   * const exactInput = locator.byPlaceholder('Search', { exact: true });
   *
   * // RegExp match (case-insensitive)
   * const regExpInput = locator.byPlaceholder(/search/i);
   */
  byPlaceholder(text, options = {}) {
    logger.debug(`Locating input with placeholder: "${text}" (Options: ${JSON.stringify(options)})`);
    return this.page.getByPlaceholder(text, options);
  }

  /**
   * Finds an element based on its visible text.
   *
   * @param text - The visible text to match (string or RegExp).
   * @param options - Additional options like exact match.
   *
   * @example
   * // Normal match
   * const element = locator.byText('Welcome');
   *
   * // Exact match
   * const exactElement = locator.byText('Welcome', { exact: true });
   *
   * // RegExp match (case-insensitive)
   * const regExpElement = locator.byText(/welcome/i);
   */
  byText(text, options = {}) {
    logger.debug(`Locating element with text: "${text}" (Options: ${JSON.stringify(options)})`);
    return this.page.getByText(text, options);
  }

  /**
   * Locate an element using a selector with optional additional filters.
   *
   * @param selector - The selector string for the element.
   * @param options - Additional filtering options:
   *   - has: Locator for elements that must be inside the matched element.
   *   - hasNot: Locator for elements that must not be inside the matched element.
   *   - hasText: Text or RegExp the element must contain.
   *   - hasNotText: Text or RegExp the element must not contain.
   *
   * @example
   *
   * const element = bySelector('.Toastify__toast--error');
   * const elementWithText = bySelector('.Toastify__toast-body', { hasText: 'Bad credentials' });
   * const elementWithoutText = bySelector('.Toastify__toast-body', { hasNotText: 'Success' });
   * const elementWithChild = bySelector('.parent', { has: this.page.locator('.child') });
   * const elementWithoutChild = bySelector('.parent', { hasNot: this.page.locator('.excluded-child') });
   */
  bySelector(selector, options = {}) {
    logger.debug(`Locating elements by selector: "${selector}" (Options: ${JSON.stringify(options)})`);
    return this.page.locator(selector, options);
  }

  /**
   * Locate dropdown value by visible text.
   *
   * @param optionText - The text of the dropdown option to match.
   * @returns {Locator} The located dropdown option element.
   */
  dropDownValueByText(optionText) {
    logger.debug(`Selecting option with text: "${optionText}"`);
    return this.page.locator('div[role="region"]', { hasText: optionText });
  }

  /**
   * Get text by locator.
   *
   * @param locator - Locator string.
   * @param text - The text to match within the located element.
   * @returns {Locator} The located element filtered by text.
   */
  getTextByLocator(locator, text) {
    logger.debug(`Location element by locator: "${locator}" with given text: "${text}"`);
    return this.page.locator(locator, { hasText: text });
  }

  /**
   * Finds an element by its ID attribute.
   *
   * @param {string} id - The ID attribute value (without the # prefix).
   * @param {Object} options - Additional filtering options.
   * @returns {Locator} The located element.
   * @example
   * // Simple ID match
   * const element = locator.byId('select-pv');
   *
   * // With additional options
   * const elementWithText = locator.byId('select-pv', { hasText: 'Solar' });
   */
  byId(id, options = {}) {
    logger.debug(`Locating element by ID: "${id}" (Options: ${JSON.stringify(options)})`);
    return this.page.locator(`#${id}`, options);
  }
}

export { LocatorUtil };
