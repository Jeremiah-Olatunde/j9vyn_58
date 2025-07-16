import assert from "node:assert";
import { function as F } from "fp-ts";

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

  function fourth(name: Name): string {
    return " I wish my name was " + name;
  }

  function third(name: Name): string {
    return fourth(name) + "!";
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

{
  type Context = string;

  const fourth_ = (name: string) => `I wish my name was ${name}`;
  const third_ = (s: string) => `${s}!`;
  const second_ = (name: string) => `Welcome ${name}!`;
  const first_ = (s: string) => (t: string) => `${s} ${t}`;

  function fourth(): Reader<Context, string> {
    return F.pipe(R.ask<Context>(), R.map(fourth_));
  }

  function third(): Reader<Context, string> {
    return F.pipe(fourth(), R.map(third_));
  }

  function second(): Reader<Context, string> {
    return F.pipe(R.ask<Context>(), R.map(second_));
  }

  function first(): Reader<Context, string> {
    return F.pipe(
      R.ask<Context>(),
      R.bind(() => {
        return F.pipe(
          second(),
          R.bind((snd) =>
            F.pipe(
              third(),
              R.bind((thd) => R.pure(first_(snd)(thd))),
            ),
          ),
        );
      }),
    );
  }

  console.log(first()("Jeremiah"));
}
