const { app, request } = require("./helpers");

describe("POST /business", () => {
  it("devuelve error porque el endpoint esta deprecado", async () => {
    const response = await request(app).post("/business").send({ name: "Heladeria Norte" });

    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/auth\/register/i);
  });

  it("sigue devolviendo mensaje de deprecacion cuando falta el nombre", async () => {
    const response = await request(app).post("/business").send({});

    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/deprecado/i);
  });

  it("sigue devolviendo mensaje de deprecacion con nombre vacio", async () => {
    const response = await request(app).post("/business").send({ name: "   " });

    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/deprecado/i);
  });
});
