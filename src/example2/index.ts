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
        console.log("marker 0");
        return email;
      },
      R.bind(
        (
          emailAsk /*i.e the return value from the function prior*/ : string,
        ) => {
          console.log("marker 1");
          return (_emailEnv: /*the reader context/enviroment*/ Email) => {
            // note how emailAsk and emailEnv are the same
            // due to the fact that we are flatMapping over R.ask i.e
            // the identity function
            console.log("marker 2");
            return renderWidget(emailAsk);
          };
        },
      ),
    );

    console.log("before running reader");
    const actual = widget("Jeremiah");
    console.log("after running reader");

    assert.strictEqual(actual, expected);
  }
}
