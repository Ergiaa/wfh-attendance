# WFH Attendance - Fullstack Developer Skill Test

This is a project for a Technical Test for Software Engineer position at Dexa Group.

| Workspace                 | What it is                                                                                         | Port |
| ------------------------- | -------------------------------------------------------------------------------------------------- | ---- |
| `apps/gateway`            | HTTP API (prefix `/api`), talks to services                                                        | 3000 |
| `apps/employees-service`  | NestJS TCP microservice, `employees_db`                                                            | 4001 |
| `apps/attendance-service` | NestJS TCP microservice, `attendance_db`                                                           | 4002 |
| `apps/web`                | React + Vite frontend                                                                              | 5173 |
| `packages/contracts`      | `Role`, message patterns, view types; validated DTOs at `/dto`                                     | —    |
| `packages/nest-common`    | Validation options; TCP bootstrap, env schema, TypeORM config, RPC error filter at `/microservice` | —    |

## Quick start

Needs Node 24 and Docker (with Compose v2).

```bash
npm run setup   # once: .env files (JWT_SECRET generated), npm install, MySQL, HRD admin seed
npm run dev     # MySQL + shared-package watchers + all services + web, in one terminal

npm run db:seed:demo #Populate demo employees and attendance records
```

`setup` is safe to re-run; it never overwrites an existing `.env`. The seeded admin comes from
`SEED_ADMIN_*` in `apps/employees-service/.env` (default `admin@wfh.local` / `ChangeMe123!`).

To run a single service in its own terminal instead, use `npm run dev:employees`,
`dev:attendance`, `dev:gateway` or `dev:web` (each builds the shared packages first).
`npm run db:down` stops MySQL; `npm run db:reset` wipes its volume and re-seeds.

### Run everything with Docker

Needs only Docker (with Compose v2); no Node or `npm run setup` on the host.

```bash
docker compose up --build -d                  # MySQL, both services, gateway and web
docker compose --profile demo up --build -d   # the same, plus demo employees and attendance
docker compose --profile demo down            # stop all (add -v to also wipe the database and photos)
```

Open <http://localhost:8080>. nginx serves the built web app and proxies `/api` to the gateway,
so the API and its docs are at `http://localhost:8080/api` too. On first boot the employees service
runs migrations and seeds the HRD admin; later boots skip the seed. Check-in photos are kept in the
`uploads` volume.

The `demo` profile adds a one-off `demo-seed` container that runs the same script as
`npm run db:seed:demo` once the gateway is up, then exits. It's idempotent, so it can be left in the
command or re-run on its own with `docker compose --profile demo run --rm demo-seed`.
Keep `--profile demo` on `down`, or its exited container is left behind and holds the photos
volume.

Defaults are set for a local demo. Override them with shell variables or a root `.env`:
`JWT_SECRET` (**set this outside a demo**), `WEB_PORT` (8080), `SEED_ADMIN_EMAIL`,
`SEED_ADMIN_PASSWORD`, `WORK_TIMEZONE` and `API_DOCS_ENABLED`.

## Login credentials

Open <http://localhost:5173> (or <http://localhost:8080> with Docker). `npm run setup` creates the HRD admin (defaults from `SEED_ADMIN_*`
in `apps/employees-service/.env`):

| Role      | Email             | Password       |
| --------- | ----------------- | -------------- |
| HRD admin | `admin@wfh.local` | `ChangeMe123!` |

After `npm run db:seed:demo` (or the Docker `demo` profile), these accounts also exist, all with the password `Password123!`:

| Role      | Email                      | Notes                             |
| --------- | -------------------------- | --------------------------------- |
| HRD admin | `siti.rahmawati@wfh.local` |                                   |
| Employee  | `budi.santoso@wfh.local`   |                                   |
| Employee  | `dewi.lestari@wfh.local`   |                                   |
| Employee  | `andi.pratama@wfh.local`   |                                   |
| Employee  | `putri.maharani@wfh.local` |                                   |
| Employee  | `rizky.hidayat@wfh.local`  |                                   |
| Employee  | `nadia.kusuma@wfh.local`   |                                   |
| Employee  | `fajar.nugroho@wfh.local`  |                                   |
| Employee  | `agus.setiawan@wfh.local`  | Deactivated, so login is rejected |

Employees created from the HRD page sign in with the email and password set there.

## Pages

After login, `/` redirects HRD admins to `/admin/employees` and employees to `/check-in`.

| Path                | Access | What it does                                                                           |
| ------------------- | ------ | -------------------------------------------------------------------------------------- |
| `/login`            | guest  | Email + password sign-in                                                               |
| `/check-in`         | any    | Today's check-in: camera capture or photo upload; shows the record once checked in     |
| `/my-attendance`    | any    | Own check-in history with date-range filter, pagination and photo viewer               |
| `/admin/employees`  | HRD    | Employee list with search; add, edit, deactivate and delete; link to their attendance  |
| `/admin/attendance` | HRD    | View-only attendance of all employees: search, date range, per-employee filter, photos |

### Screenshots

**Check in**: before checking in, take a photo with the camera or upload one; the time is
recorded by the server.

![Check-in page before checking in](docs/empty_check_in.png)

Once checked in, today's record and photo are shown instead.

![Check-in page after checking in](docs/check_in.png)

**My attendance**: the employee's own history, filterable by date.

![My attendance page](docs/my_attendance.png)

**Employees (HRD)**: search, add, edit, deactivate or delete employees, or jump to their
attendance.

![Employee management page](docs/employee_page.png)

**Attendance (HRD)**: view-only check-ins from every employee, with search and date filters.

![HRD attendance page](docs/attendance_page.png)

## API

Interactive docs (Swagger UI) are at <http://localhost:3000/api/docs> (<http://localhost:8080/api/docs>
with Docker), with the OpenAPI JSON at `/api/docs/json`. They're off by default when
`NODE_ENV=production`; set `API_DOCS_ENABLED` to override. Log in via `POST /auth/login`, then
paste the `accessToken` into **Authorize**.

All routes are under `/api`, need `Authorization: Bearer <token>` unless marked public, and respond
with `{ statusCode, message, data }` (errors: `{ statusCode, message, error, errors? }`).

| Route                       | Access              | Notes                                         |
| --------------------------- | ------------------- | --------------------------------------------- |
| `POST /auth/login`          | public, 5/min       | Returns `{ accessToken, employee }`           |
| `GET /auth/me`              | any                 |                                               |
| `POST /employees`           | HRD                 |                                               |
| `GET /employees`            | HRD                 | `page`, `limit`, `search`                     |
| `GET /employees/:id`        | HRD                 |                                               |
| `PATCH /employees/:id`      | HRD                 | Can't deactivate or demote yourself           |
| `DELETE /employees/:id`     | HRD                 | Soft delete; can't delete yourself            |
| `POST /attendance/check-in` | any active employee | `multipart/form-data`, field `photo` (≤ 5 MB) |
| `GET /attendance/me`        | any                 | `page`, `limit`, `dateFrom`, `dateTo`         |
| `GET /attendance`           | HRD                 | Same, plus `employeeId`, `search`             |
| `GET /attendance/:id/photo` | HRD or owner        |                                               |

One check-in per employee per work day. The server records the time; the work day is computed
in `WORK_TIMEZONE` (default `Asia/Jakarta`). Photos are stored under the gateway's `UPLOAD_DIR`.

## Checks

```bash
npm run lint          # oxlint (type-aware) across all workspaces
npm run format        # prettier, config in .prettierrc
npm run build
npm test
```

Lint, format and git attributes are configured once at the repo root. `apps/web/.oxlintrc.json`
only adds the React rules.
