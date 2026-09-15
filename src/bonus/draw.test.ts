import { describe, expect, it } from "vitest";
import { bonusApePose, boatHullLayout, chaseLayout, cratePlankLayout, jetWingLayout, pathStyle, pilotSeat, propellerOcclusion, tailRotorFromBehind, vehicleCues } from "./draw";
import { bonusVehicle } from "./milestones";

describe("bonus chase camera", () => {
  it("shows the ape face only while spinning on a banana", () => {
    expect(bonusApePose(0, 0)).toBe("rear");
    expect(bonusApePose(0.1, 0)).toBe("rear");
    expect(bonusApePose(2.4, 0)).toBe("face");
    expect(bonusApePose(0, 6)).toBe("face");
  });

  it("draws every vehicle from behind, wider at the rear", () => {
    for (const level of [10, 20, 30, 40, 50, 60, 70] as const) {
      const layout = chaseLayout(bonusVehicle(level));
      expect(layout.rearW).toBeGreaterThan(layout.frontW);
      expect(layout.depth).toBeGreaterThan(40);
    }
  });

  it("keeps a road on land, waves on water, and open sky in the air", () => {
    expect(pathStyle("olabil")).toBe("road");
    expect(pathStyle("bil")).toBe("road");
    expect(pathStyle("vannscooter")).toBe("waves");
    expect(pathStyle("baat")).toBe("waves");
    expect(pathStyle("helikopter")).toBe("sky");
    expect(pathStyle("propellfly")).toBe("sky");
    expect(pathStyle("jetfly")).toBe("sky");
  });

  it("gives each vehicle a readable silhouette from behind", () => {
    expect(vehicleCues("olabil")).toEqual(["crate", "tread", "axle", "rollbar"]);
    expect(vehicleCues("bil")).toEqual(["taillights", "plate", "bumper", "convertible"]);
    expect(vehicleCues("vannscooter")).toEqual(["handlebars", "seat", "nozzle", "sponsons"]);
    expect(vehicleCues("baat")).toEqual(["outboard", "transom", "flag", "windshield"]);
    expect(vehicleCues("helikopter")).toEqual(["rotor", "skids", "tailboom", "bubble", "cabin"]);
    expect(vehicleCues("propellfly")).toEqual(["tailfin", "propeller", "biplane", "opencockpit"]);
    expect(vehicleCues("jetfly")).toEqual(["nozzles", "sweptwing", "tailfin", "canopy"]);
  });

  it("draws jet wings as an arrow pointing the way the plane flies", () => {
    const { nearW, farW } = jetWingLayout();
    expect(nearW).toBeGreaterThan(farW);
  });

  it("hides the lower propeller behind the fuselage and shows the tail rotor as a rear vertical streak", () => {
    expect(propellerOcclusion("propellfly")).toBe("behind-fuselage");
    expect(tailRotorFromBehind()).toEqual({ place: "rear", silhouette: "vertical" });
  });

  it("tapers the boat hull to a sharp powerboat bow", () => {
    const { transomW, bowW } = boatHullLayout();
    expect(bowW).toBeLessThan(transomW * 0.18);
  });

  it("puts the ape inside the helicopter and jet, and in an open classic cockpit on the prop plane", () => {
    expect(pilotSeat("helikopter")).toBe("inside");
    expect(pilotSeat("jetfly")).toBe("inside");
    expect(pilotSeat("propellfly")).toBe("open");
    expect(pilotSeat("bil")).toBe("open");
  });

  it("keeps olabil planks inside the crate hull", () => {
    const { rearW, frontW } = chaseLayout("olabil");
    for (const plank of cratePlankLayout()) {
      const hullW = rearW + (frontW - rearW) * plank.t;
      expect(plank.width).toBeLessThan(hullW);
    }
  });
});
