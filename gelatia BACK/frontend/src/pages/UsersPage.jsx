import { useEffect, useMemo, useState } from "react";
import { Alert } from "../components/ui/Alert";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { Input } from "../components/ui/Input";
import { LoadingGrid } from "../components/ui/LoadingGrid";
import { PageHeader } from "../components/ui/PageHeader";
import { Pagination } from "../components/ui/Pagination";
import { SearchField } from "../components/ui/SearchField";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { createUserService, listUsersService, resetUserPasswordService } from "../services/userService";
import { useAuthStore } from "../store/authStore";
import { canCreateUsers, canResetPasswords, getRoleLabel } from "../utils/permissions";
import { ROLES } from "../utils/roles";

export function UsersPage() {
  const { token, user } = useAuthStore();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ items: [], page: 1, limit: 10, total: 0 });
  const [form, setForm] = useState({ name: "", email: "", password: "", role: ROLES.CASHIER });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [resetTargetId, setResetTargetId] = useState(null);
  const [resetPassword, setResetPassword] = useState("");
  const [resetSubmittingId, setResetSubmittingId] = useState(null);
  const debouncedQuery = useDebouncedValue(query, 250);

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery]);

  useEffect(() => {
    async function loadUsers() {
      setLoading(true);
      setError("");
      try {
        const response = await listUsersService({ token, q: debouncedQuery, page, limit: 10 });
        setResult(response);
      } catch (apiError) {
        setError(apiError.message || "No se pudieron cargar los usuarios");
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, [token, debouncedQuery, page]);

  async function handleCreateUser(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccessMessage("");

    try {
      await createUserService({ token, ...form });
      setForm({ name: "", email: "", password: "", role: ROLES.CASHIER });
      const response = await listUsersService({ token, page: 1, limit: 10 });
      setPage(1);
      setResult(response);
    } catch (apiError) {
      setError(apiError.message || "No se pudo crear el usuario");
    } finally {
      setSubmitting(false);
    }
  }

  async function reloadUsers(nextPage = page, nextQuery = debouncedQuery) {
    const response = await listUsersService({ token, q: nextQuery, page: nextPage, limit: 10 });
    setResult(response);
  }

  function toggleResetUser(userId) {
    setError("");
    setSuccessMessage("");
    setResetPassword("");
    setResetTargetId((current) => (current === userId ? null : userId));
  }

  async function handleResetPassword(event, userId) {
    event.preventDefault();
    setResetSubmittingId(userId);
    setError("");
    setSuccessMessage("");

    try {
      await resetUserPasswordService({
        token,
        userId,
        newPassword: resetPassword,
      });
      setResetPassword("");
      setResetTargetId(null);
      setSuccessMessage("Contrasena actualizada correctamente.");
      await reloadUsers();
    } catch (apiError) {
      setError(apiError.message || "No se pudo resetear la contrasena");
    } finally {
      setResetSubmittingId(null);
    }
  }

  const roleOptions = useMemo(() => {
    if (user?.role === ROLES.OWNER) {
      return [ROLES.CASHIER, ROLES.MANAGER];
    }

    return [ROLES.CASHIER];
  }, [user?.role]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Usuarios"
        title="Equipo del negocio"
        description="Roles visibles, alta controlada por permisos y una lista limpia para mostrar a cliente."
      />

      <Card className="space-y-4">
        <SearchField
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar por nombre o email"
        />

        {canCreateUsers(user?.role) ? (
          <form className="grid gap-3 xl:grid-cols-[1fr_1fr_1fr_180px_160px]" onSubmit={handleCreateUser}>
            <Input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Nombre"
            />
            <Input
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              placeholder="Email"
            />
            <Input
              type="password"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              placeholder="Contrasena"
            />
            <select
              value={form.role}
              onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 focus:border-accent-blue/60 focus:outline-none"
            >
              {roleOptions.map((role) => (
                <option key={role} value={role} className="bg-base-900">
                  {getRoleLabel(role)}
                </option>
              ))}
            </select>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creando..." : "Crear usuario"}
            </Button>
          </form>
        ) : null}
      </Card>

      {error ? <Alert>{error}</Alert> : null}
      {successMessage ? <Alert tone="success">{successMessage}</Alert> : null}

      {loading ? <LoadingGrid items={4} /> : null}

      {!loading && result.items.length === 0 ? (
        <EmptyState title="No hay usuarios para mostrar" description="Los usuarios permanentes del negocio apareceran aca." />
      ) : null}

      <div className="grid gap-4">
        {result.items.map((item) => (
          <Card key={item.id} className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-lg font-semibold text-slate-50">{item.name}</p>
                <p className="mt-2 text-sm text-slate-400">{item.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge tone={item.role === ROLES.OWNER ? "red" : item.role === ROLES.MANAGER ? "blue" : "default"}>
                  {getRoleLabel(item.role)}
                </Badge>
                {canResetPasswords(user?.role) ? (
                  <Button variant="secondary" onClick={() => toggleResetUser(item.id)}>
                    {resetTargetId === item.id ? "Cancelar" : "Resetear contrasena"}
                  </Button>
                ) : null}
              </div>
            </div>

            {canResetPasswords(user?.role) && resetTargetId === item.id ? (
              <form
                className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:grid-cols-[1fr_220px]"
                onSubmit={(event) => handleResetPassword(event, item.id)}
              >
                <Input
                  type="password"
                  value={resetPassword}
                  onChange={(event) => setResetPassword(event.target.value)}
                  placeholder="Nueva contrasena"
                  minLength={6}
                />
                <Button type="submit" disabled={resetSubmittingId === item.id}>
                  {resetSubmittingId === item.id ? "Guardando..." : "Confirmar reset"}
                </Button>
              </form>
            ) : null}
          </Card>
        ))}
      </div>

      {!loading ? (
        <Pagination page={result.page} limit={result.limit} total={result.total} onPageChange={setPage} />
      ) : null}
    </div>
  );
}
