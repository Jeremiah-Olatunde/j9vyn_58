export type Html = string;
export type Email = string;

export function div(...children: Html[]) {
  return `<div>${combine(children)}</div>`;
}

export function p(...children: Html[]) {
  return `<p>${combine(children)}</p>`;
}

export function h1(...children: Html[]) {
  return `<h1>${combine(children)}</h1>`;
}

function combine(elements: string[]): string {
  return elements.join("");
}

export function formatHtml(html: string): string {
  const tagRegex = /(<[^>]+>)/g;
  const tokens = html.split(tagRegex).filter((token) => token.trim() !== "");

  let depth = 0;
  let result = "";

  for (const token of tokens) {
    if (token.startsWith("</")) {
      depth = Math.max(depth - 1, 0);
      result += "  ".repeat(depth) + token + "\n";
    } else if (token.startsWith("<") && token.endsWith(">")) {
      result += "  ".repeat(depth) + token + "\n";
      depth++;
    } else {
      result += "  ".repeat(depth) + token.trim() + "\n";
    }
  }

  return result.trim();
}
