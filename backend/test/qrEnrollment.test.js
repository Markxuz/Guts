// Basic test for QR enrollment API endpoints
const request = require("supertest");
const app = require("../src/app");

describe("QR Enrollment API", () => {
  it("should reject public QR code creation", async () => {
    const res = await request(app).post("/api/admin/qrcodes").send({ name: "TestQR" });
    expect(res.status).toBe(403);
  });

  it("should return 400 for missing token on public enroll", async () => {
    const res = await request(app).get("/api/enroll");
    expect(res.status).toBe(400);
  });
});
