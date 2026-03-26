const { app, request, registerOwner, login, createBranch, createFlavor, assignFlavorToBranch } = require("./helpers");

describe("Auth + multi-tenant", () => {
  it("permite login exitoso con credenciales validas", async () => {
    await registerOwner({
      businessName: "GelatIA Centro",
      email: "owner-centro@gelatia.com",
      password: "secret123",
    });

    const response = await login({
      email: "owner-centro@gelatia.com",
      password: "secret123",
    });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      token: expect.any(String),
      user: {
        email: "owner-centro@gelatia.com",
        role: "OWNER",
      },
    });
  });

  it("rechaza credenciales invalidas", async () => {
    await registerOwner({
      businessName: "GelatIA Centro",
      email: "owner-centro@gelatia.com",
      password: "secret123",
    });

    const response = await login({
      email: "owner-centro@gelatia.com",
      password: "otra-clave",
    });

    expect(response.status).toBe(401);
  });

  it("deniega acceso a un recurso protegido sin token", async () => {
    const response = await request(app).post("/flavor").send({ name: "Chocolate" });

    expect(response.status).toBe(401);
  });

  it("permite acceso al recurso dentro del negocio correcto", async () => {
    const tenant = await registerOwner({
      businessName: "GelatIA Centro",
      email: "owner-centro@gelatia.com",
    });

    const branch = await createBranch({ token: tenant.body.token, name: "Centro" });
    const flavor = await createFlavor("Chocolate", tenant.body.token);

    await assignFlavorToBranch({
      branchId: branch.body.id,
      flavorId: flavor.body.id,
      stockGrams: 1000,
      token: tenant.body.token,
    });

    const response = await request(app)
      .get(`/branch/${branch.body.id}/flavors`)
      .set("Authorization", `Bearer ${tenant.body.token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
  });

  it("deniega acceso cuando el recurso pertenece a otro negocio", async () => {
    const tenantA = await registerOwner({
      businessName: "GelatIA Centro",
      email: "owner-centro@gelatia.com",
    });
    const tenantB = await registerOwner({
      businessName: "GelatIA Norte",
      email: "owner-norte@gelatia.com",
    });

    const branchA = await createBranch({ token: tenantA.body.token, name: "Centro" });
    const flavorA = await createFlavor("Chocolate", tenantA.body.token);

    await assignFlavorToBranch({
      branchId: branchA.body.id,
      flavorId: flavorA.body.id,
      stockGrams: 1000,
      token: tenantA.body.token,
    });

    const response = await request(app)
      .get(`/branch/${branchA.body.id}/flavors`)
      .set("Authorization", `Bearer ${tenantB.body.token}`);

    expect(response.status).toBe(404);
  });
});
