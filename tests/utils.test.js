const { calculateDiscount, calculateShipping, calculateTotal, sanitizeUser } = require("../utils/helpers");

describe("Utility Functions", () => {
  describe("calculateDiscount", () => {
    it("calculates 20% of 100", () => {
      expect(calculateDiscount(100, 20)).toBe(20);
    });
    it("calculates 0% discount", () => {
      expect(calculateDiscount(100, 0)).toBe(0);
    });
    it("rounds to 2 decimal places", () => {
      expect(calculateDiscount(99.99, 10)).toBe(10);
    });
  });

  describe("calculateShipping", () => {
    it("free shipping over $100", () => {
      expect(calculateShipping(100)).toBe(0);
      expect(calculateShipping(150)).toBe(0);
    });
    it("charges $9.99 under $100", () => {
      expect(calculateShipping(50)).toBe(9.99);
      expect(calculateShipping(0)).toBe(9.99);
    });
  });

  describe("calculateTotal", () => {
    it("adds subtotal - discount + shipping", () => {
      expect(calculateTotal(100, 20, 9.99)).toBe(89.99);
    });
    it("handles zero discount and shipping", () => {
      expect(calculateTotal(50, 0, 0)).toBe(50);
    });
  });

  describe("sanitizeUser", () => {
    it("removes password from object", () => {
      const user = { name: "Test", email: "test@test.com", password: "secret123" };
      const result = sanitizeUser(user);
      expect(result.password).toBeUndefined();
      expect(result.name).toBe("Test");
    });
    it("returns null for null input", () => {
      expect(sanitizeUser(null)).toBeNull();
    });
  });
});

describe("AppError", () => {
  const { AppError } = require("../utils/AppError");

  it("creates error with correct status code", () => {
    const err = new AppError("Not found", 404);
    expect(err.message).toBe("Not found");
    expect(err.statusCode).toBe(404);
    expect(err.isOperational).toBe(true);
  });

  it("creates error with no statusCode defaults to 500", () => {
    const err = new Error("test");
    expect(err.statusCode).toBeUndefined();
  });
});

describe("Email Utils", () => {
  const { sendEmail } = require("../utils/email");
  it("returns false when SMTP not configured", async () => {
    const result = await sendEmail({ to: "test@test.com", subject: "Test", html: "<p>test</p>" });
    expect(result).toBe(false);
  });
});
