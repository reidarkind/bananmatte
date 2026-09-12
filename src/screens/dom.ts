export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function html(strings: TemplateStringsArray, ...values: unknown[]): HTMLElement {
  const raw = strings.reduce((acc, part, i) => acc + part + (values[i] ?? ""), "");
  const template = document.createElement("template");
  template.innerHTML = raw.trim();
  const children = [...template.content.children].filter((node): node is HTMLElement => node instanceof HTMLElement);
  if (children.length === 0) {
    throw new Error("html helper forventet minst ett rotelement");
  }
  if (children.length === 1) {
    return children[0];
  }
  const wrap = document.createElement("div");
  wrap.append(...children);
  return wrap;
}

export function clear(root: HTMLElement): void {
  root.replaceChildren();
}

export function onClick(root: ParentNode, selector: string, handler: (button: HTMLButtonElement) => void): void {
  root.querySelectorAll(selector).forEach((node) => {
    node.addEventListener("click", () => handler(node as HTMLButtonElement));
  });
}
