# Decisión: compra atómica

## Qué usé

Bloqueo pesimista de fila en PostgreSQL, dentro de una transacción de Prisma (`prisma.$transaction`).

El descuento es un solo `UPDATE` condicional (`updateMany` con `stock >= quantity`). Postgres bloquea esa fila hasta el `commit` o el `rollback`. La compra se inserta en la misma transacción. Si falla después del descuento, las dos escrituras se deshacen.

La lectura del producto queda fuera de la transacción. El test de concurrencia retiene todas las peticiones después de esa lectura. Mantener abierta una transacción en esa espera agotaría el pool de conexiones.

## Por qué este y no otro

El aislamiento por defecto (Read Committed) más el `WHERE stock >= quantity` basta. La segunda compra espera el candado, reevalúa el `WHERE` y, si ya no hay stock, no modifica nada. No hace falta reintentar.

`SELECT FOR UPDATE` en la lectura no sirve aquí. El test exige que todas las peticiones terminen de leer antes de que alguna escriba. Un candado en el `SELECT` dejaría esa espera colgada.

Serializable tampoco. Un conflicto de serialización devuelve un error de base de datos, no un 409, y obliga a reintentar. El contrato de la API ya define 409 cuando no hay stock.

Una columna `version` (bloqueo optimista) exigiría cambiar el esquema para el mismo resultado que ya da el `UPDATE` condicional.

## Cuándo usaría el enfoque contrario

Usaría bloqueo optimista (versión o `UPDATE` que compare el stock leído, con reintento) si las escrituras chocan poco y el coste de mantener la fila bloqueada importa: muchas lecturas, compras repartidas entre muchos productos, o transacciones que llaman a un servicio externo antes de terminar.

En ese caso un conflicto es raro y reintentar es barato. Aquí el conflicto es el caso normal (muchas compras del mismo ticket) y la respuesta correcta ante el conflicto ya es 409, sin reintento.
