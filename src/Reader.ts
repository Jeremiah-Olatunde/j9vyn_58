type F<Arg, A> = (a: Arg) => A;

export type Reader<Context, A> = F<Context, A>;

interface Functor {
  map: <Arg, A, B>(transform: (a: A) => B) => (fa: F<Arg, A>) => F<Arg, B>;
}

const Functor: Functor = {
  map: (transform) => (fa) => (arg) => transform(fa(arg)),
};

interface Apply extends Functor {
  apply: <Arg, A, B>(fab: F<Arg, (a: A) => B>) => (fa: F<Arg, A>) => F<Arg, B>;
}

const Apply: Apply = {
  ...Functor,
  apply: (fab) => (fa) => (arg) => fab(arg)(fa(arg)),
};

interface Applicative extends Apply {
  pure: <Arg, A>(a: A) => F<Arg, A>;
}

const Applicative: Applicative = {
  ...Apply,
  pure: (a) => (_arg) => a,
};

interface Bind extends Apply {
  bind: <Arg, A, B>(afb: (a: A) => F<Arg, B>) => (fa: F<Arg, A>) => F<Arg, B>;
}

const Bind: Bind = {
  ...Apply,
  bind: (afb) => (fa) => (arg) => afb(fa(arg))(arg),
};

export default {
  ...Functor,
  ...Apply,
  ...Applicative,
  ...Bind,
};
