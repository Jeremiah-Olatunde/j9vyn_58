import assert from "node:assert";

import { function as F } from "fp-ts";
import R, { type Reader } from "../lib/Reader.js";

import * as html from "./html.js";
import { type Html } from "./html.js";

type Email = string;

const expected: string = `<div>
  <div>
    <div>
      <h1>
        Our Site
      </h1>
    </div>
    <div>
      <h1>
        Custom content for Jeremiah
      </h1>
      <div>
        <p>
          This is the left side
        </p>
      </div>
      <div>
        <div>
          <p>
            this is an article
          </p>
          <div>
            <p>
              Hey Jeremiah we've got a great deal for you
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>`;

{
  // Naive implementation without reader

  function view(email: Email) {
    return html.div(page(email));
  }

  function page(email: Email): Html {
    return html.div(topNav(), content(email));
  }

  function topNav(): Html {
    return html.div(html.h1("Our Site"));
  }

  function content(email: Email): Html {
    return html.div(
      html.h1(`Custom content for ${email}`),
      left(),
      right(email),
    );
  }

  function left(): Html {
    return html.div(html.p("This is the left side"));
  }

  function right(email: Email): Html {
    return html.div(article(email));
  }

  function article(email: Email): Html {
    return html.div(html.p("this is an article"), widget(email));
  }

  function widget(email: Email): Html {
    return html.div(html.p(`Hey ${email} we've got a great deal for you`));
  }

  const actual = html.render(view("Jeremiah"));

  assert.strictEqual(actual, expected);
}

{
  // Extracting the "core functionality" out of the reader
  // Notice how this itself is just a reader

  const expected =
    "<div><p>Hey Jeremiah we've got a great deal for you</p></div>";

  const renderWidget = (email: string) => {
    return html.div(html.p(`Hey ${email} we've got a great deal for you`));
  };

  {
    const widget: Reader<Email, string> = F.pipe(
      R.ask<Email>(),
      R.map(renderWidget), // we are mapping a reader over a reader
    );

    const actual = widget("Jeremiah");
    assert.strictEqual(actual, expected);
  }

  {
    const widget: Reader<Email, string> = F.pipe(
      R.ask<Email>(),
      R.bind((email) => R.pure(renderWidget(email))),
    );

    const actual = widget("Jeremiah");
    assert.strictEqual(actual, expected);
  }

  {
    // Tracing the execution flow for a better understanding
    const widget: Reader<Email, string> = F.pipe(
      // R.ask<Email>()
      (email: Email) => {
        // console.log("marker 0");
        return email;
      },
      R.bind(
        (
          emailAsk /*i.e the return value from the function prior*/ : string,
        ) => {
          // console.log("marker 1");
          return (_emailEnv: /*the reader context/enviroment*/ Email) => {
            // note how emailAsk and emailEnv are the same
            // due to the fact that we are flatMapping over R.ask i.e
            // the identity function
            // console.log("marker 2");
            return renderWidget(emailAsk);
          };
        },
      ),
    );

    // console.log("before running reader");
    const actual = widget("Jeremiah");
    // console.log("after running reader");

    assert.strictEqual(actual, expected);
  }
}

{
  const left = html.div(html.p("This is the left side"));
  const topNav = html.div(html.h1("Our Site"));

  const renderWidget = (s: string) => {
    return html.div(html.p(`Hey ${s} we've got a great deal for you`));
  };

  const renderArticle = (s: string) => {
    return html.div(html.p("this is an article"), s);
  };

  const renderContent = (s: string) => (t: string) => {
    return html.div(html.h1(`Custom content for ${t}`), left, s);
  };

  const renderPage = (s: string) => html.div(topNav, s);

  const widget = F.pipe(R.ask<Email>(), R.map(renderWidget));
  const article = F.pipe(widget, R.map(renderArticle));
  const right = F.pipe(article, R.map(html.div));
  const content = F.pipe(right, R.bind(renderContent)); // being cheeky here
  const page = F.pipe(content, R.map(renderPage));
  const view = F.pipe(page, R.map(html.div));

  // here we need two thing, the email from the environment
  // and the result of the right view function
  // we can use R.ask<Email>
  // run bind on that to get access to the email
  // then run bind on right to get access to its result
  // perform our computation, in this case interpolating string
  // then lift the resulting string into our reader context and return that
  //
  // notice how to get the email from the "context" we used .ask to get a
  // reader
  // but recall that the environment is called on the function returned
  // by bind, so we could have instead read the email from that
  // by using pure we just ignore it
  //
  // const content = F.pipe(
  //   R.ask<Email>(),
  //   R.bind((email) => {
  //     return F.pipe(
  //       right,
  //       R.bind((right_) => {
  //         return R.pure(
  //           html.div(html.h1(`Custom content for ${email}`), left, right_),
  //         );
  //       }),
  //     );
  //   }),
  // );

  const actual = html.render(view("Jeremiah"));
  assert.strictEqual(actual, expected);
}
