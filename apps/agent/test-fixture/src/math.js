/**
 * A simple math utility module.
 */

function validateNumber(value, name) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new TypeError(`Expected ${name} to be a number, received ${typeof value}`);
  }
}

function add(a, b) {
  validateNumber(a, "a");
  validateNumber(b, "b");
  return a + b;
}

function subtract(a, b) {
  validateNumber(a, "a");
  validateNumber(b, "b");
  return a - b;
}

function multiply(a, b) {
  validateNumber(a, "a");
  validateNumber(b, "b");
  return a * b;
}

function divide(a, b) {
  validateNumber(a, "a");
  validateNumber(b, "b");
  if (b === 0) {
    throw new Error("Cannot divide by zero");
  }
  return a / b;
}

module.exports = { add, subtract, multiply, divide };
