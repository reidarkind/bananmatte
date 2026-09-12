export function attachPointer(canvas: HTMLCanvasElement, onX: (x: number) => void): () => void {
  const read = (event: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    onX(x);
  };
  const move = (event: PointerEvent) => {
    if (event.buttons || event.pointerType === "touch") read(event);
  };
  canvas.addEventListener("pointerdown", read);
  canvas.addEventListener("pointermove", move);
  return () => {
    canvas.removeEventListener("pointerdown", read);
    canvas.removeEventListener("pointermove", move);
  };
}

export function attachKeys(onDir: (dir: -1 | 0 | 1) => void): () => void {
  const down = new Set<string>();
  const update = () => {
    if (down.has("ArrowLeft") || down.has("a") || down.has("A")) onDir(-1);
    else if (down.has("ArrowRight") || down.has("d") || down.has("D")) onDir(1);
    else onDir(0);
  };
  const onDown = (event: KeyboardEvent) => {
    down.add(event.key);
    update();
  };
  const onUp = (event: KeyboardEvent) => {
    down.delete(event.key);
    update();
  };
  window.addEventListener("keydown", onDown);
  window.addEventListener("keyup", onUp);
  return () => {
    window.removeEventListener("keydown", onDown);
    window.removeEventListener("keyup", onUp);
  };
}
