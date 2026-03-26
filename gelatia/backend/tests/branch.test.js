const {
  app,
  request,
  registerOwner,
  createFlavor,
  createBranch,
  assignFlavorToBranch,
  listBranches,
} = require("./helpers");

async function createTenant(overrides = {}) {
  const response = await registerOwner(overrides);
  return response.body;
}

describe("POST /branch", () => {
  it("crea una sucursal y devuelve 201 con los datos correctos", async () => {
    const tenant = await createTenant();
    const response = await createBranch({ name: "Sucursal Centro", token: tenant.token });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      id: expect.any(Number),
      name: "Sucursal Centro",
      businessId: tenant.business.id,
    });
  });

  it("devuelve 400 cuando faltan datos obligatorios", async () => {
    const tenant = await createTenant();
    const response = await request(app)
      .post("/branch")
      .set("Authorization", `Bearer ${tenant.token}`)
      .send({ name: "" });

    expect(response.status).toBe(400);
  });

  it("ignora businessId enviado por el cliente y usa el del usuario autenticado", async () => {
    const tenant = await createTenant();
    const response = await request(app)
      .post("/branch")
      .set("Authorization", `Bearer ${tenant.token}`)
      .send({
        name: "Sucursal Centro",
        businessId: 9999,
      });

    expect(response.status).toBe(201);
    expect(response.body.businessId).toBe(tenant.business.id);
  });
});

describe("POST /branch/:id/flavor", () => {
  it("asigna un sabor a una sucursal y devuelve 201", async () => {
    const tenant = await createTenant();
    const branch = await createBranch({ token: tenant.token });
    const flavor = await createFlavor("Chocolate", tenant.token);

    const response = await assignFlavorToBranch({
      branchId: branch.body.id,
      flavorId: flavor.body.id,
      stockGrams: 2500,
      token: tenant.token,
    });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      id: expect.any(Number),
      branchId: branch.body.id,
      flavorId: flavor.body.id,
      stockGrams: 2500,
      isActive: true,
    });
  });

  it("devuelve 400 con stock negativo", async () => {
    const tenant = await createTenant();
    const branch = await createBranch({ token: tenant.token });
    const flavor = await createFlavor("Chocolate", tenant.token);

    const response = await request(app)
      .post(`/branch/${branch.body.id}/flavor`)
      .set("Authorization", `Bearer ${tenant.token}`)
      .send({
        flavorId: flavor.body.id,
        stockGrams: -1,
      });

    expect(response.status).toBe(400);
  });

  it("devuelve 404 cuando la sucursal no existe", async () => {
    const tenant = await createTenant();
    const flavor = await createFlavor("Chocolate", tenant.token);

    const response = await request(app)
      .post("/branch/9999/flavor")
      .set("Authorization", `Bearer ${tenant.token}`)
      .send({
        flavorId: flavor.body.id,
        stockGrams: 1000,
      });

    expect(response.status).toBe(404);
  });

  it("devuelve 404 cuando el sabor no existe", async () => {
    const tenant = await createTenant();
    const branch = await createBranch({ token: tenant.token });

    const response = await request(app)
      .post(`/branch/${branch.body.id}/flavor`)
      .set("Authorization", `Bearer ${tenant.token}`)
      .send({
        flavorId: 9999,
        stockGrams: 1000,
      });

    expect(response.status).toBe(404);
  });

  it("devuelve 409 cuando se intenta asignar dos veces el mismo sabor a la misma sucursal", async () => {
    const tenant = await createTenant();
    const branch = await createBranch({ token: tenant.token });
    const flavor = await createFlavor("Pistacho", tenant.token);

    await assignFlavorToBranch({
      branchId: branch.body.id,
      flavorId: flavor.body.id,
      stockGrams: 1200,
      token: tenant.token,
    });

    const response = await assignFlavorToBranch({
      branchId: branch.body.id,
      flavorId: flavor.body.id,
      stockGrams: 500,
      token: tenant.token,
    });

    expect(response.status).toBe(409);
  });

  it("crea la relacion inactiva cuando el stock inicial es cero", async () => {
    const tenant = await createTenant();
    const branch = await createBranch({ token: tenant.token });
    const flavor = await createFlavor("Banana split", tenant.token);

    const response = await assignFlavorToBranch({
      branchId: branch.body.id,
      flavorId: flavor.body.id,
      stockGrams: 0,
      token: tenant.token,
    });

    expect(response.status).toBe(201);
    expect(response.body.isActive).toBe(false);
  });
});

describe("GET /branch/:id/flavors", () => {
  it("lista los sabores asignados a una sucursal", async () => {
    const tenant = await createTenant();
    const branch = await createBranch({ token: tenant.token });
    const flavor = await createFlavor("Dulce de leche", tenant.token);

    await assignFlavorToBranch({
      branchId: branch.body.id,
      flavorId: flavor.body.id,
      stockGrams: 1800,
      token: tenant.token,
    });

    const response = await request(app)
      .get(`/branch/${branch.body.id}/flavors`)
      .set("Authorization", `Bearer ${tenant.token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toMatchObject({
      branchId: branch.body.id,
      flavorId: flavor.body.id,
      stockGrams: 1800,
      flavor: {
        id: flavor.body.id,
        name: "Dulce de leche",
      },
    });
  });

  it("devuelve 404 cuando la sucursal no existe", async () => {
    const tenant = await createTenant();
    const response = await request(app)
      .get("/branch/9999/flavors")
      .set("Authorization", `Bearer ${tenant.token}`);

    expect(response.status).toBe(404);
  });

  it("devuelve 400 cuando branchId es invalido", async () => {
    const tenant = await createTenant();
    const response = await request(app)
      .get("/branch/abc/flavors")
      .set("Authorization", `Bearer ${tenant.token}`);

    expect(response.status).toBe(400);
  });

  it("devuelve un array vacio para una sucursal existente sin sabores", async () => {
    const tenant = await createTenant();
    const branch = await createBranch({ token: tenant.token });

    const response = await request(app)
      .get(`/branch/${branch.body.id}/flavors`)
      .set("Authorization", `Bearer ${tenant.token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });
});

describe("GET /branch busqueda y paginacion", () => {
  it("lista sucursales sin q", async () => {
    const tenant = await createTenant();
    await createBranch({ token: tenant.token, name: "Centro" });
    await createBranch({ token: tenant.token, name: "Norte" });

    const response = await listBranches({ token: tenant.token });

    expect(response.status).toBe(200);
    expect(response.body.page).toBe(1);
    expect(response.body.limit).toBe(10);
    expect(response.body.total).toBe(2);
    expect(response.body.items.map((item) => item.name)).toEqual(["Centro", "Norte"]);
  });

  it("busca sucursales por nombre", async () => {
    const tenant = await createTenant();
    await createBranch({ token: tenant.token, name: "Centro Caballito" });
    await createBranch({ token: tenant.token, name: "Norte" });

    const response = await listBranches({
      token: tenant.token,
      q: "cabal",
    });

    expect(response.status).toBe(200);
    expect(response.body.total).toBe(1);
    expect(response.body.items[0].name).toBe("Centro Caballito");
  });

  it("respeta aislamiento por tenant", async () => {
    const tenantA = await registerOwner({
      businessName: "GelatIA Centro",
      email: "owner-a@gelatia.com",
    });
    const tenantB = await registerOwner({
      businessName: "GelatIA Norte",
      email: "owner-b@gelatia.com",
    });

    await createBranch({ token: tenantA.body.token, name: "Centro" });
    await createBranch({ token: tenantB.body.token, name: "Centro Norte" });

    const response = await listBranches({
      token: tenantA.body.token,
      q: "centro",
    });

    expect(response.status).toBe(200);
    expect(response.body.total).toBe(1);
    expect(response.body.items[0].businessId).toBe(tenantA.body.business.id);
    expect(response.body.items[0].name).toBe("Centro");
  });
});
