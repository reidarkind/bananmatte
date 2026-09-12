export function html(strings: TemplateStringsArray, ...values: unknown[]): HTMLElement {
  const raw = strings.reduce((acc, part, i) => acc + part + (values[i] ?? ""), "");
  const template = document.createElement("template");
  template.innerHTML = raw.trim();
  const node = template.content.firstElementChild;
  if (!(node instanceof HTMLElement)) {
    throw new Error("html helper forventet ett rotelement");
  }
  return node;
}

export function clear(root: HTMLElement): void {
  root.replaceChildren();
}

export function onClick(root: ParentNode, selector: string, handler: (button: HTMLButtonElement) => void): void {
  root.querySelectorAll(selector).forEach((node) => {
    node.addEventListener("click", () => handler(node as HTMLButtonElement));
  });
}
