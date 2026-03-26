# Roles, permisos y preparacion operativa

## Flujo oficial

- El onboarding oficial del producto es `POST /auth/register`.
- `POST /business` queda deprecado y no debe usarse para alta de nuevos negocios.

## Roles del Business

- `OWNER`: control total del negocio.
- `MANAGER`: encargado operativo.
- `CASHIER`: caja o mostrador.

## Permisos implementados

- `OWNER`
  - crear sucursales
  - crear sabores
  - asignar sabores a sucursales
  - actualizar stock
  - crear usuarios del negocio
  - listar usuarios del negocio

- `MANAGER`
  - crear sabores
  - asignar sabores a sucursales
  - actualizar stock
  - consultar recursos
  - listar usuarios del negocio
  - crear usuarios `CASHIER`

- `CASHIER`
  - consultar recursos del negocio
  - actualizar stock
  - no puede crear sucursales
  - no puede crear sabores
  - no puede crear usuarios

## Decision sobre MANAGER creando usuarios

Se permite que `MANAGER` cree usuarios `CASHIER` solamente.

Motivo:
- en operacion real, un encargado necesita alta rapida de personal de caja o mostrador
- no deberia poder escalar privilegios creando otros `MANAGER` u `OWNER`

## Preparacion futura para turnos y caja

No se implementa todavia `Shift` ni `CashSession`, pero el modelo queda preparado bajo este criterio:

- `User` es permanente y pertenece a un `Business`
- en el futuro `Shift` deberia representar un turno operativo abierto por un usuario
- `CashSession` deberia representar la caja abierta para una `Branch`, vinculada a un `User` que opera

Diseño recomendado futuro:
- `Shift`
  - `id`
  - `businessId`
  - `branchId`
  - `openedByUserId`
  - `startedAt`
  - `endedAt`
  - `status`

- `CashSession`
  - `id`
  - `businessId`
  - `branchId`
  - `shiftId`
  - `openedByUserId`
  - `initialAmount`
  - `closedAmount`
  - `openedAt`
  - `closedAt`
  - `status`

Regla base:
- no crear usuarios por turno
- los turnos y cajas se vinculan a usuarios permanentes
