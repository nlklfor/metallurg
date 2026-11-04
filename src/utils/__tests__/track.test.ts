import { describe, expect, it } from "vitest";
import { maskName, maskTtn, normalizeOrderCode, toOrderNumber } from "../trackUtils";

describe("normalizeOrderCode", () => {
  it("strips the MTL- prefix, spaces and symbols, uppercases", () => {
    expect(normalizeOrderCode("mtl-7k2qpx")).toBe("7K2QPX");
    expect(normalizeOrderCode(" MTL 7K2 QPX ")).toBe("7K2QPX");
    expect(normalizeOrderCode("7k2-qpx")).toBe("7K2QPX");
  });

  it("caps the code at 8 characters", () => {
    expect(normalizeOrderCode("ABCDEFGHJK")).toBe("ABCDEFGH");
  });

  it("builds the full order number", () => {
    expect(toOrderNumber("mtl-7k2qpx")).toBe("MTL-7K2QPX");
  });
});

describe("masking", () => {
  it("masks the middle of a Nova Poshta TTN", () => {
    expect(maskTtn("20450000000000")).toBe("20 45 •••• •••• 00");
    expect(maskTtn("1234")).toBe("1234");
    expect(maskTtn(null)).toBe("");
  });

  it("masks the recipient name", () => {
    expect(maskName("Roman Novak")).toBe("R. N•••••");
    expect(maskName("roman")).toBe("R•••••");
    expect(maskName("")).toBe("—");
  });
});

describe("findCity", () => {
  it("matches Nova Poshta city names", async () => {
    const { findCity } = await import("@/lib/uaCities");
    expect(findCity("Київ")?.label).toBe("KYIV");
    expect(findCity("Бровари (Київська обл.)")?.label).toBe("BROVARY");
    expect(findCity("м. Львів")?.label).toBe("LVIV");
    expect(findCity("Кам’янське")?.label).toBe("KAMIANSKE");
    expect(findCity("Atlantis")).toBeNull();
  });
});
