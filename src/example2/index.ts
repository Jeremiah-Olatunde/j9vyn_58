import * as html from "./html.js";
import { type Html } from "./html.js";

type Email = string;

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
  return html.div(html.h1(`Custom content for ${email}`), left(), right(email));
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

console.log(html.render(view("Jeremiah")));
