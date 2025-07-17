import assert from "node:assert";
import { function as F, reader as Rdr } from "fp-ts";

import R, { type Reader } from "../lib/Reader.js";

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

  const actual = first()("Jeremiah");
  const expected = "Welcome Jeremiah! I wish my name was Jeremiah!";
  assert.strictEqual(actual, expected);
}

{
  type Name = "Jeremiah" | "Roman";

  const wish = (name: string) => `I wish my name was ${name}`;
  const yell = (s: string) => `${s}!`;
  const welcome = (name: string) => `Welcome ${name}!`;
  const join = (s: string) => (t: string) => `${s} ${t}`;

  // hear we map over the return type of the reader
  // we use ask to return to creater a reader that passes the input
  // to the output (the identity function) in order to allow us to
  // use R.map over the output
  const fth: Reader<Name, string> = map(R.ask<Name>(), wish);
  const snd: Reader<Name, string> = map(R.ask<Name>(), welcome);

  // thd wants to perform an operation on the result of fth
  // we used R.ask to move the input (Name) to the output with fth
  // here what we do is map over the output of fth
  // so fth maps over the output of the reader returned by R.ask<Name>
  // and thd maps over the output of the reader returned by fth
  const thd: Reader<Name, string> = map(fth, yell);

  // with first we need access to the return types of two readers
  // at the same time
  // if we only needed the return value of one we would map over it
  // like we did with fth, snd, and third but here we need the
  // return value of snd and thd
  // we accomplish this using bind
  const fst: Reader<Name, string> = bind(snd, (snd) =>
    bind(thd, (thd) => R.pure(join(snd)(thd))),
  );

  const actual = fst("Jeremiah");
  const expected = "Welcome Jeremiah! I wish my name was Jeremiah!";
  assert.strictEqual(actual, expected);
}

function map<R, A, B>(fa: Reader<R, A>, transform: (a: A) => B) {
  return F.pipe(fa, R.map(transform));
}

function bind<R, A, B>(fa: Reader<R, A>, afb: (a: A) => Reader<R, B>) {
  return R.bind(afb)(fa);
}

{
  type Name = "Jeremiah" | "Roman";

  const wish = (name: string) => `I wish my name was ${name}`;
  const yell = (s: string) => `${s}!`;
  const welcome = (name: string) => `Welcome ${name}!`;
  const join = (s: string) => (t: string) => `${s} ${t}`;

  const fth: Rdr.Reader<Name, string> = Rdr.map(wish)(Rdr.ask());
  const snd: Rdr.Reader<Name, string> = Rdr.map(welcome)(Rdr.ask());
  const thd: Rdr.Reader<Name, string> = Rdr.map(yell)(fth);
  const fst: Rdr.Reader<Name, string> = F.pipe(
    snd,
    Rdr.flatMap((snd) =>
      F.pipe(
        thd,
        Rdr.flatMap((thd) => Rdr.of(join(snd)(thd))),
      ),
    ),
  );

  const actual = fst("Jeremiah");
  const expected = "Welcome Jeremiah! I wish my name was Jeremiah!";
  assert.strictEqual(actual, expected);
}
