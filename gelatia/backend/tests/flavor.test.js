const { app, request, registerOwner, createFlavor, listFlavors } = require("./helpers");

describe("POST /flavor", () => {
  async function createTenant() {
    const response = await registerOwner();
    return response.body;
  }

  it("crea un sabor y devuelve 201 con los datos correctos", async () => {
    const tenant = await createTenant();
    const response = await createFlavor("Frutilla", tenant.token);

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      id: expect.any(Number),
      name: "Frutilla",
      businessId: tenant.business.id,
    });
  });

  it("devuelve 400 cuando falta el nombre", async () => {
    const tenant = await createTenant();
    const response = await request(app).post("/flavor").set("Authorization", `Bearer ${tenant.token}`).send({});

    expect(response.status).toBe(400);
  });

  it("devuelve 409 cuando el sabor ya existe", async () => {
    const tenant = await createTenant();
    await createFlavor("Limon", tenant.token);

    const response = await createFlavor("Limon", tenant.token);

    expect(response.status).toBe(409);
  });

  it("devuelve 409 cuando el nombre duplicado solo cambia por espacios", async () => {
    const tenant = await createTenant();
    await createFlavor("Menta", tenant.token);

    const response = await createFlavor("  Menta  ", tenant.token);

    expect(response.status).toBe(409);
  });

  it("permite el mismo nombre de sabor en negocios distintos", async () => {
    const tenantA = await registerOwner({
      businessName: "GelatIA Norte",
      email: "owner-a@gelatia.com",
    });
    const tenantB = await registerOwner({
      businessName: "GelatIA Sur",
      email: "owner-b@gelatia.com",
    });

    const responseA = await createFlavor("Chocolate", tenantA.body.token);
    const responseB = await createFlavor("Chocolate", tenantB.body.token);

    expect(responseA.status).toBe(201);
    expect(responseB.status).toBe(201);
    expect(responseA.body.businessId).not.toBe(responseB.body.businessId);
  });
});

describe("GET /flavor busqueda y paginacion", () => {
  async function createTenant(overrides = {}) {
    const response = await registerOwner(overrides);
    return response.body;
  }

  it("lista sabores sin q con paginacion por defecto", async () => {
    const tenant = await createTenant();
    await createFlavor("Chocolate", tenant.token);
    await createFlavor("Frutilla", tenant.token);

    const response = await listFlavors({ token: tenant.token });

    expect(response.status).toBe(200);
    expect(response.body.page).toBe(1);
    expect(response.body.limit).toBe(10);
    expect(response.body.total).toBe(2);
    expect(response.body.items.map((item) => item.name)).toEqual(["Chocolate", "Frutilla"]);
  });

  it("busca sabores por coincidencia parcial", async () => {
    const tenant = await createTenant();
    await createFlavor("Chocolate amargo", tenant.token);
    await createFlavor("Frutilla", tenant.token);

    const response = await listFlavors({
      token: tenant.token,
      q: "amarg",
    });

    expect(response.status).toBe(200);
    expect(response.body.total).toBe(1);
    expect(response.body.items[0].name).toBe("Chocolate amargo");
  });

  it("la busqueda es case-insensitive", async () => {
    const tenant = await createTenant();
    await createFlavor("Dulce de Leche", tenant.token);

    const response = await listFlavors({
      token: tenant.token,
      q: "dulce",
    });

    expect(response.status).toBe(200);
    expect(response.body.total).toBe(1);
    expect(response.body.items[0].name).toBe("Dulce de Leche");
  });

  it("trata q vacio o con espacios como ausencia de busqueda", async () => {
    const tenant = await createTenant();
    await createFlavor("Chocolate", tenant.token);
    await createFlavor("Menta", tenant.token);

    const response = await listFlavors({
      token: tenant.token,
      q: "   ",
    });

    expect(response.status).toBe(200);
    expect(response.body.total).toBe(2);
    expect(response.body.items).toHaveLength(2);
  });

  it("respeta aislamiento por tenant", async () => {
    const tenantA = await registerOwner({
      businessName: "GelatIA Norte",
      email: "owner-a@gelatia.com",
    });
    const tenantB = await registerOwner({
      businessName: "GelatIA Sur",
      email: "owner-b@gelatia.com",
    });

    await createFlavor("Chocolate Blanco", tenantA.body.token);
    await createFlavor("Chocolate Negro", tenantB.body.token);

    const response = await listFlavors({
      token: tenantA.body.token,
      q: "chocolate",
    });

    expect(response.status).toBe(200);
    expect(response.body.total).toBe(1);
    expect(response.body.items[0].name).toBe("Chocolate Blanco");
  });
});
