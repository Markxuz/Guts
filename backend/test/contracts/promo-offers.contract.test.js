const test = require("node:test");
const assert = require("node:assert/strict");
const { PromoOffer } = require("../../models");
const { getTestClient, loginAsAdmin, loginAsStaff } = require("../helpers/appTestHarness");

function uniquePromoName() {
  return `Promo ${Date.now()} ${Math.floor(Math.random() * 100000)}`;
}

test.describe("Promo offers API contract", () => {
  let client;
  let adminToken;
  let staffToken;
  const cleanup = {
    promoOfferIds: [],
  };

  test.before(async () => {
    client = await getTestClient();
    await PromoOffer.sync();
    [adminToken, staffToken] = await Promise.all([
      loginAsAdmin(client),
      loginAsStaff(client),
    ]);
  });

  test.afterEach(async () => {
    if (cleanup.promoOfferIds.length) {
      await PromoOffer.destroy({ where: { id: cleanup.promoOfferIds } });
      cleanup.promoOfferIds = [];
    }
  });

  test("GET /api/promo-offers allows staff to list active offers", async () => {
    const created = await client
      .post("/api/promo-offers")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: uniquePromoName(),
        status: "active",
        fixed_price: 5000,
        discounted_price: 4500,
      });

    assert.equal(created.status, 201);
    cleanup.promoOfferIds.push(created.body.id);

    const response = await client
      .get("/api/promo-offers")
      .set("Authorization", `Bearer ${staffToken}`);

    assert.equal(response.status, 200);
    assert.equal(Array.isArray(response.body), true);
    assert.ok(response.body.some((item) => item.id === created.body.id));
  });

  test("POST /api/promo-offers remains admin-only", async () => {
    const response = await client
      .post("/api/promo-offers")
      .set("Authorization", `Bearer ${staffToken}`)
      .send({
        name: uniquePromoName(),
      });

    assert.equal(response.status, 403);
    assert.equal(response.body.message, "Forbidden");
  });
});
