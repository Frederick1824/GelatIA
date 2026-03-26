const {
  app,
  request,
  registerOwner,
  login,
  createBusinessUser,
  createBranch,
  createFlavor,
  authHeaders,
  listUsers,
  resetUserPassword,
} = require("./helpers");

describe("Roles y permisos", () => {
  it("OWNER puede crear usuario dentro de su business", async () => {
    const owner = await registerOwner({
      businessName: "GelatIA Centro",
      email: "owner@gelatia.com",
    });

    const response = await createBusinessUser({
      token: owner.body.token,
      name: "Encargado",
      email: "manager@gelatia.com",
      role: "MANAGER",
    });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      email: "manager@gelatia.com",
      role: "MANAGER",
      businessId: owner.body.business.id,
    });
  });

  it("MANAGER puede crear usuarios CASHIER", async () => {
    const owner = await registerOwner({
      businessName: "GelatIA Centro",
      email: "owner@gelatia.com",
    });

    await createBusinessUser({
      token: owner.body.token,
      name: "Manager",
      email: "manager@gelatia.com",
      role: "MANAGER",
    });

    const managerLogin = await login({
      email: "manager@gelatia.com",
      password: "secret123",
    });

    const response = await createBusinessUser({
      token: managerLogin.body.token,
      name: "Caja",
      email: "cashier@gelatia.com",
      role: "CASHIER",
    });

    expect(response.status).toBe(201);
    expect(response.body.role).toBe("CASHIER");
  });

  it("MANAGER no puede crear usuarios MANAGER", async () => {
    const owner = await registerOwner({
      businessName: "GelatIA Centro",
      email: "owner@gelatia.com",
    });

    await createBusinessUser({
      token: owner.body.token,
      name: "Manager",
      email: "manager@gelatia.com",
      role: "MANAGER",
    });

    const managerLogin = await login({
      email: "manager@gelatia.com",
      password: "secret123",
    });

    const response = await createBusinessUser({
      token: managerLogin.body.token,
      name: "Otro Manager",
      email: "manager2@gelatia.com",
      role: "MANAGER",
    });

    expect(response.status).toBe(403);
  });

  it("CASHIER es rechazado al crear usuarios", async () => {
    const owner = await registerOwner({
      businessName: "GelatIA Centro",
      email: "owner@gelatia.com",
    });

    await createBusinessUser({
      token: owner.body.token,
      name: "Caja",
      email: "cashier@gelatia.com",
      role: "CASHIER",
    });

    const cashierLogin = await login({
      email: "cashier@gelatia.com",
      password: "secret123",
    });

    const response = await createBusinessUser({
      token: cashierLogin.body.token,
      name: "No Permitido",
      email: "otro@gelatia.com",
      role: "CASHIER",
    });

    expect(response.status).toBe(403);
  });

  it("CASHIER es rechazado al crear sucursal", async () => {
    const owner = await registerOwner({
      businessName: "GelatIA Centro",
      email: "owner@gelatia.com",
    });

    await createBusinessUser({
      token: owner.body.token,
      name: "Caja",
      email: "cashier@gelatia.com",
      role: "CASHIER",
    });

    const cashierLogin = await login({
      email: "cashier@gelatia.com",
      password: "secret123",
    });

    const response = await createBranch({
      token: cashierLogin.body.token,
      name: "No Permitida",
    });

    expect(response.status).toBe(403);
  });

  it("CASHIER es rechazado al crear sabor", async () => {
    const owner = await registerOwner({
      businessName: "GelatIA Centro",
      email: "owner@gelatia.com",
    });

    await createBusinessUser({
      token: owner.body.token,
      name: "Caja",
      email: "cashier@gelatia.com",
      role: "CASHIER",
    });

    const cashierLogin = await login({
      email: "cashier@gelatia.com",
      password: "secret123",
    });

    const response = await createFlavor("Chocolate", cashierLogin.body.token);

    expect(response.status).toBe(403);
  });

  it("CASHIER puede actualizar stock", async () => {
    const owner = await registerOwner({
      businessName: "GelatIA Centro",
      email: "owner@gelatia.com",
    });

    await createBusinessUser({
      token: owner.body.token,
      name: "Caja",
      email: "cashier@gelatia.com",
      role: "CASHIER",
    });

    const cashierLogin = await login({
      email: "cashier@gelatia.com",
      password: "secret123",
    });

    const branch = await createBranch({
      token: owner.body.token,
      name: "Centro",
    });
    const flavor = await createFlavor("Chocolate", owner.body.token);
    const branchFlavor = await request(app)
      .post(`/branch/${branch.body.id}/flavor`)
      .set("Authorization", `Bearer ${owner.body.token}`)
      .send({
        flavorId: flavor.body.id,
        stockGrams: 1000,
      });

    const response = await request(app)
      .patch("/branch-flavor")
      .set("Authorization", `Bearer ${cashierLogin.body.token}`)
      .send({
        id: branchFlavor.body.id,
        stockGrams: 200,
      });

    expect(response.status).toBe(200);
    expect(response.body.stockGrams).toBe(200);
  });

  it("listado de usuarios esta protegido y devuelve 401 sin token", async () => {
    const response = await request(app).get("/users");

    expect(response.status).toBe(401);
  });

  it("OWNER y MANAGER pueden listar usuarios solo de su tenant", async () => {
    const tenantA = await registerOwner({
      businessName: "GelatIA Centro",
      email: "owner-a@gelatia.com",
    });
    const tenantB = await registerOwner({
      businessName: "GelatIA Norte",
      email: "owner-b@gelatia.com",
    });

    await createBusinessUser({
      token: tenantA.body.token,
      name: "Manager A",
      email: "manager-a@gelatia.com",
      role: "MANAGER",
    });
    await createBusinessUser({
      token: tenantB.body.token,
      name: "Caja B",
      email: "cashier-b@gelatia.com",
      role: "CASHIER",
    });

    const response = await request(app)
      .get("/users")
      .set(authHeaders(tenantA.body.token));

    expect(response.status).toBe(200);
    expect(response.body.items.map((user) => user.email)).toEqual(
      expect.arrayContaining(["owner-a@gelatia.com", "manager-a@gelatia.com"])
    );
    expect(response.body.page).toBe(1);
    expect(response.body.limit).toBe(10);
    expect(response.body.total).toBe(2);
    expect(response.body.items.map((user) => user.email)).not.toContain("owner-b@gelatia.com");
    expect(response.body.items.map((user) => user.email)).not.toContain("cashier-b@gelatia.com");
  });

  it("OWNER puede resetear la contrasena de un usuario de su negocio", async () => {
    const owner = await registerOwner({
      businessName: "GelatIA Centro",
      email: "owner@gelatia.com",
    });

    const createdUser = await createBusinessUser({
      token: owner.body.token,
      name: "Caja",
      email: "cashier@gelatia.com",
      role: "CASHIER",
    });

    const resetResponse = await resetUserPassword({
      token: owner.body.token,
      userId: createdUser.body.id,
      newPassword: "nuevaClave123",
    });

    expect(resetResponse.status).toBe(200);
    expect(resetResponse.body.message).toBe("Contrasena reseteada correctamente");
    expect(resetResponse.body.user.id).toBe(createdUser.body.id);

    const loginResponse = await login({
      email: "cashier@gelatia.com",
      password: "nuevaClave123",
    });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.user.email).toBe("cashier@gelatia.com");
  });

  it("MANAGER y CASHIER no pueden resetear contrasenas", async () => {
    const owner = await registerOwner({
      businessName: "GelatIA Centro",
      email: "owner@gelatia.com",
    });

    const manager = await createBusinessUser({
      token: owner.body.token,
      name: "Manager",
      email: "manager@gelatia.com",
      role: "MANAGER",
    });

    await createBusinessUser({
      token: owner.body.token,
      name: "Caja",
      email: "cashier@gelatia.com",
      role: "CASHIER",
    });

    const managerLogin = await login({
      email: "manager@gelatia.com",
      password: "secret123",
    });
    const cashierLogin = await login({
      email: "cashier@gelatia.com",
      password: "secret123",
    });

    const managerReset = await resetUserPassword({
      token: managerLogin.body.token,
      userId: manager.body.id,
      newPassword: "nuevaClave123",
    });
    const cashierReset = await resetUserPassword({
      token: cashierLogin.body.token,
      userId: manager.body.id,
      newPassword: "nuevaClave123",
    });

    expect(managerReset.status).toBe(403);
    expect(cashierReset.status).toBe(403);
  });

  it("OWNER no puede resetear usuarios de otro negocio", async () => {
    const tenantA = await registerOwner({
      businessName: "GelatIA Centro",
      email: "owner-a@gelatia.com",
    });
    const tenantB = await registerOwner({
      businessName: "GelatIA Norte",
      email: "owner-b@gelatia.com",
    });

    const userB = await createBusinessUser({
      token: tenantB.body.token,
      name: "Caja B",
      email: "cashier-b@gelatia.com",
      role: "CASHIER",
    });

    const response = await resetUserPassword({
      token: tenantA.body.token,
      userId: userB.body.id,
      newPassword: "nuevaClave123",
    });

    expect(response.status).toBe(404);
  });

  it("devuelve error coherente con request invalido al resetear contrasena", async () => {
    const owner = await registerOwner({
      businessName: "GelatIA Centro",
      email: "owner@gelatia.com",
    });

    const createdUser = await createBusinessUser({
      token: owner.body.token,
      name: "Caja",
      email: "cashier@gelatia.com",
      role: "CASHIER",
    });

    const shortPassword = await resetUserPassword({
      token: owner.body.token,
      userId: createdUser.body.id,
      newPassword: "123",
    });
    const missingUser = await request(app)
      .patch("/users/reset-password")
      .set(authHeaders(owner.body.token))
      .send({ newPassword: "nuevaClave123" });

    expect(shortPassword.status).toBe(400);
    expect(missingUser.status).toBe(400);
  });
});

describe("GET /users busqueda y paginacion", () => {
  it("lista usuarios con paginacion consistente", async () => {
    const tenant = await registerOwner({
      businessName: "GelatIA Centro",
      email: "owner@gelatia.com",
    });

    await createBusinessUser({
      token: tenant.body.token,
      name: "Caja Uno",
      email: "caja1@gelatia.com",
      role: "CASHIER",
    });
    await createBusinessUser({
      token: tenant.body.token,
      name: "Caja Dos",
      email: "caja2@gelatia.com",
      role: "CASHIER",
    });

    const response = await listUsers({
      token: tenant.body.token,
      page: 1,
      limit: 2,
    });

    expect(response.status).toBe(200);
    expect(response.body.page).toBe(1);
    expect(response.body.limit).toBe(2);
    expect(response.body.total).toBe(3);
    expect(response.body.items).toHaveLength(2);
  });

  it("busca usuarios por nombre o email", async () => {
    const tenant = await registerOwner({
      businessName: "GelatIA Centro",
      email: "owner@gelatia.com",
    });

    await createBusinessUser({
      token: tenant.body.token,
      name: "Lucia Encargada",
      email: "lucia@gelatia.com",
      role: "MANAGER",
    });
    await createBusinessUser({
      token: tenant.body.token,
      name: "Caja Noche",
      email: "mostrador@gelatia.com",
      role: "CASHIER",
    });

    const byName = await listUsers({
      token: tenant.body.token,
      q: "lucia",
    });
    const byEmail = await listUsers({
      token: tenant.body.token,
      q: "mostrador",
    });

    expect(byName.status).toBe(200);
    expect(byName.body.total).toBe(1);
    expect(byName.body.items[0].email).toBe("lucia@gelatia.com");
    expect(byEmail.status).toBe(200);
    expect(byEmail.body.total).toBe(1);
    expect(byEmail.body.items[0].name).toBe("Caja Noche");
  });

  it("mantiene aislamiento por tenant en la busqueda", async () => {
    const tenantA = await registerOwner({
      businessName: "GelatIA Centro",
      email: "owner-a@gelatia.com",
    });
    const tenantB = await registerOwner({
      businessName: "GelatIA Norte",
      email: "owner-b@gelatia.com",
    });

    await createBusinessUser({
      token: tenantA.body.token,
      name: "Lucia Centro",
      email: "lucia-centro@gelatia.com",
      role: "MANAGER",
    });
    await createBusinessUser({
      token: tenantB.body.token,
      name: "Lucia Norte",
      email: "lucia-norte@gelatia.com",
      role: "MANAGER",
    });

    const response = await listUsers({
      token: tenantA.body.token,
      q: "lucia",
    });

    expect(response.status).toBe(200);
    expect(response.body.total).toBe(1);
    expect(response.body.items[0].email).toBe("lucia-centro@gelatia.com");
  });

  it("devuelve 400 con page o limit invalidos", async () => {
    const tenant = await registerOwner({
      businessName: "GelatIA Centro",
      email: "owner@gelatia.com",
    });

    const invalidPage = await listUsers({
      token: tenant.body.token,
      page: 0,
    });
    const invalidLimit = await listUsers({
      token: tenant.body.token,
      limit: "abc",
    });

    expect(invalidPage.status).toBe(400);
    expect(invalidLimit.status).toBe(400);
  });
});
