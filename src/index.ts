import assert from "node:assert";

import R, { type Reader } from "./Reader.js";

{
  /**
   * here Name is the context
   * note that only forth and second use the name value directly
   * third and first simply pass it on
   *
   * first is called with Name
   * - first passes it to second
   *   second uses the value and returns
   * - first passes it to third
   *   - third passed it to forth
   *     - forth uses the value and returns
   * first combines the results
   * */

  type Name = string;

  function forth(name: Name): string {
    return " I wish my name was " + name;
  }

  function third(name: Name): string {
    return forth(name) + "!";
  }

  function second(name: Name): string {
    return "Welcome " + name + "!";
  }

  function first(name: Name): string {
    return second(name) + third(name);
  }

  const name: Name = "Jeremiah";
  const actual = first(name);
  const expected = `Welcome ${name}! I wish my name was ${name}!`;
  assert.strictEqual(actual, expected);
}
