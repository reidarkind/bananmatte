import { describe, expect, it } from "vitest";
import { INSTALL_COPY } from "./install-copy";

describe("install copy", () => {
  it("covers privacy, local storage, and credits", () => {
    const body = Object.values(INSTALL_COPY).join(" ");
    expect(body).toMatch(/skyen/);
    expect(body).toMatch(/lokalt/);
    expect(body).toMatch(/synkroniserer/);
    expect(body).not.toMatch(/synker/);
    expect(body).toMatch(/Reidar Kind/);
    expect(body).toMatch(/AI/);
  });

  it("explains home-screen install on iPhone and Android", () => {
    const body = Object.values(INSTALL_COPY).join(" ");
    expect(body).toMatch(/Legg til på Hjem-skjerm/);
    expect(body).toMatch(/Installer app/);
    expect(body).toMatch(/Safari/);
    expect(body).toMatch(/Chrome/);
  });
});
