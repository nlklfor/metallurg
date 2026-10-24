import { describe, expect, it } from "vitest";
import { normalizeUaPhone } from "@/utils/phone";

describe("normalizeUaPhone", () => {
  it.each([
    ["+38 (067) 123-45-67", "380671234567"],
    ["0671234567", "380671234567"],
    ["380671234567", "380671234567"],
    ["671234567", "380671234567"],
    ["80671234567", "380671234567"],
  ])("%s → %s", (input, out) => expect(normalizeUaPhone(input)).toBe(out));

  it.each(["", "@nikita", "12345", "+41 79 123 45 67", "3806712345678"])("rejects %s", (input) =>
    expect(normalizeUaPhone(input)).toBeNull()
  );
});
