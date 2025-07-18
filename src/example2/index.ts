import assert from "node:assert";

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
