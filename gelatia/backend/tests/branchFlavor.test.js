const { app, request, registerOwner, createFlavor, createBranch, assignFlavorToBranch } = require("./helpers");

async function createTenant(overrides = {}) {
  const response = await registerOwner(overrides);
  return response.body;
}

describe("PATCH /branch-flavor", () => {
  it("actualiza el stock de una relacion branchFlavor", async () => {
    const tenant = await createTenant();
    const branch = await createBranch({ token: tenant.token });
    const flavor = await createFlavor("Chocolate", tenant.token);
    const branchFlavor = await assignFlavorToBranch({
      branchId: branch.body.id,
      flavorId: flavor.body.id,
      stockGrams: 2200,
      token: tenant.token,
    });

    const response = await request(app)
      .patch("/branch-flavor")
      .set("Authorization", `Bearer ${tenant.token}`)
      .send({
        id: branchFlavor.body.id,
        stockGrams: 0,
        isActive: false,
      });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: branchFlavor.body.id,
      stockGrams: 0,
      isActive: false,
    });
  });

  it("devuelve 400 cuando faltan datos", async () => {
    const tenant = await createTenant();
    const response = await request(app)
      .patch("/branch-flavor")
      .set("Authorization", `Bearer ${tenant.token}`)
      .send({});

    expect(response.status).toBe(400);
  });

  it("devuelve 400 cuando el stock es negativo", async () => {
    const tenant = await createTenant();
    const response = await request(app)
      .patch("/branch-flavor")
      .set("Authorization", `Bearer ${tenant.token}`)
      .send({
        id: 1,
        stockGrams: -50,
      });

    expect(response.status).toBe(400);
  });

  it("devuelve 404 cuando la relacion no existe", async () => {
    const tenant = await createTenant();
    const response = await request(app)
      .patch("/branch-flavor")
      .set("Authorization", `Bearer ${tenant.token}`)
      .send({
        id: 9999,
        stockGrams: 500,
      });

    expect(response.status).toBe(404);
  });

  it("actualiza isActive automaticamente a false cuando el stock queda en cero", async () => {
    const tenant = await createTenant();
    const branch = await createBranch({ token: tenant.token });
    const flavor = await createFlavor("Crema americana", tenant.token);
    const branchFlavor = await assignFlavorToBranch({
      branchId: branch.body.id,
      flavorId: flavor.body.id,
      stockGrams: 900,
      token: tenant.token,
    });

    const response = await request(app)
      .patch("/branch-flavor")
      .set("Authorization", `Bearer ${tenant.token}`)
      .send({
        id: branchFlavor.body.id,
        stockGrams: 0,
      });

    expect(response.status).toBe(200);
    expect(response.body.isActive).toBe(false);
  });

  it("actualiza isActive automaticamente a true cuando hay stock y no se envia el campo", async () => {
    const tenant = await createTenant();
    const branch = await createBranch({ token: tenant.token });
    const flavor = await createFlavor("Sambayon", tenant.token);
    const branchFlavor = await assignFlavorToBranch({
      branchId: branch.body.id,
      flavorId: flavor.body.id,
      stockGrams: 0,
      token: tenant.token,
    });

    const response = await request(app)
      .patch("/branch-flavor")
      .set("Authorization", `Bearer ${tenant.token}`)
      .send({
        id: branchFlavor.body.id,
        stockGrams: 1500,
      });

    expect(response.status).toBe(200);
    expect(response.body.isActive).toBe(true);
  });

  it("devuelve 400 cuando isActive tiene un tipo invalido", async () => {
    const tenant = await createTenant();
    const response = await request(app)
      .patch("/branch-flavor")
      .set("Authorization", `Bearer ${tenant.token}`)
      .send({
        id: 1,
        stockGrams: 200,
        isActive: "si",
      });

    expect(response.status).toBe(400);
  });
});
