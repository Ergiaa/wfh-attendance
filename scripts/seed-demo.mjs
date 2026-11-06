// Seeds demo employees and a few weeks of attendance history. Idempotent: re-running skips
// employees and check-ins that already exist.
//
// Employees go through the gateway API so they get the real validation and password hashing,
// which means the stack must be running (`npm run dev`). Check-ins are inserted straight into
// attendance_db because the API only ever records "now"; each gets a generated photo in the
// gateway's upload directory so thumbnails load like real ones.
import { readFileSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { parseEnv } from 'node:util';
import { crc32, deflateSync } from 'node:zlib';

import mysql from 'mysql2/promise';
import { v7 as uuidv7 } from 'uuid';

const WEEKS_BACK = 4;
const DEMO_PASSWORD = 'Password123!';

// presence: chance of checking in on a workday. start/end: check-in window in local hours.
// leftDaysAgo: deactivated that many days ago, so their history stops there.
const EMPLOYEES = [
  {
    code: 'HRD002',
    name: 'Siti Rahmawati',
    role: 'HRD_ADMIN',
    presence: 0.95,
    start: 7.5,
    end: 8.5,
  },
  { code: 'EMP001', name: 'Budi Santoso', presence: 0.95, start: 7.75, end: 8.75 },
  { code: 'EMP002', name: 'Dewi Lestari', presence: 0.9, start: 8, end: 9 },
  { code: 'EMP003', name: 'Andi Pratama', presence: 0.9, start: 7.5, end: 9.25 },
  { code: 'EMP004', name: 'Putri Maharani', presence: 0.85, start: 8, end: 9 },
  { code: 'EMP005', name: 'Rizky Hidayat', presence: 0.65, start: 8.25, end: 10 },
  { code: 'EMP006', name: 'Nadia Kusuma', presence: 0.9, start: 7.25, end: 8.25 },
  { code: 'EMP007', name: 'Fajar Nugroho', presence: 0.8, start: 9, end: 10.5 },
  { code: 'EMP008', name: 'Agus Setiawan', presence: 0.85, start: 8, end: 9, leftDaysAgo: 7 },
];

const root = resolve(import.meta.dirname, '..');
const loadEnv = (app) => parseEnv(readFileSync(resolve(root, 'apps', app, '.env'), 'utf8'));
const gatewayEnv = loadEnv('gateway');
const employeesEnv = loadEnv('employees-service');
const attendanceEnv = loadEnv('attendance-service');

const API = `http://localhost:${gatewayEnv.PORT ?? 3000}/api`;
const UPLOAD_DIR = resolve(root, 'apps/gateway', gatewayEnv.UPLOAD_DIR ?? 'uploads');
const TIME_ZONE = attendanceEnv.WORK_TIMEZONE ?? 'Asia/Jakarta';

main().catch((error) => {
  console.error(`\nDemo seed failed: ${error.message}`);
  process.exitCode = 1;
});

async function main() {
  const token = await login();
  const employees = [];
  for (const fixture of EMPLOYEES) {
    employees.push({ ...fixture, ...(await ensureEmployee(token, fixture)) });
  }

  const db = await mysql.createConnection({
    host: attendanceEnv.DB_HOST,
    port: Number(attendanceEnv.DB_PORT),
    user: attendanceEnv.DB_USER,
    password: attendanceEnv.DB_PASS,
    database: attendanceEnv.DB_NAME,
    timezone: 'Z',
    dateStrings: true,
  });

  try {
    const days = workDays(WEEKS_BACK);
    let inserted = 0;
    for (const employee of employees) {
      inserted += await seedAttendance(db, employee, days);
    }
    console.log(`Inserted ${inserted} check-ins across ${days.length} workdays.`);
  } finally {
    await db.end();
  }

  for (const employee of employees.filter((e) => e.leftDaysAgo && e.isActive)) {
    await api(token, `/employees/${employee.id}`, { method: 'PATCH', body: { isActive: false } });
    console.log(`Deactivated ${employee.code} ${employee.name}`);
  }

  console.log(`\nDemo employees sign in with their email and the password ${DEMO_PASSWORD}`);
}

// --- Employees (through the API) ---

async function login() {
  try {
    const { accessToken } = await api(null, '/auth/login', {
      method: 'POST',
      body: { email: employeesEnv.SEED_ADMIN_EMAIL, password: employeesEnv.SEED_ADMIN_PASSWORD },
    });
    return accessToken;
  } catch (error) {
    if (error.cause?.code === 'ECONNREFUSED') {
      throw new Error(
        `Can't reach the gateway at ${API}. Start the app with \`npm run dev\` first.`,
      );
    }
    throw error;
  }
}

async function ensureEmployee(token, { code, name, role = 'EMPLOYEE' }) {
  const email = `${name.toLowerCase().replace(/\s+/g, '.')}@wfh.local`;
  try {
    const created = await api(token, '/employees', {
      method: 'POST',
      body: { employeeCode: code, name, email, password: DEMO_PASSWORD, role },
    });
    console.log(`Created ${code} ${name} <${email}>`);
    return created;
  } catch (error) {
    if (error.status !== 409) {
      throw error;
    }
  }

  const { items } = await api(token, `/employees?search=${code}&limit=100`);
  const existing = items.find((employee) => employee.employeeCode === code);
  if (!existing) {
    // A deleted employee keeps their code and email reserved.
    throw new Error(
      `${code} or ${email} belongs to a deleted employee; remove it or change the fixture.`,
    );
  }
  console.log(`Exists  ${code} ${existing.name}`);
  return existing;
}

async function api(token, path, { method = 'GET', body } = {}) {
  const response = await fetch(`${API}${path}`, {
    method,
    headers: {
      Accept: 'application/json',
      ...(body && { 'Content-Type': 'application/json' }),
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: body && JSON.stringify(body),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(`${method} ${path} → ${response.status} ${payload?.message ?? ''}`);
    error.status = response.status;
    throw error;
  }
  return payload.data;
}

// --- Attendance (straight into attendance_db) ---

async function seedAttendance(db, employee, days) {
  const [rows] = await db.query('SELECT work_date FROM attendances WHERE employee_id = ?', [
    employee.id,
  ]);
  const existing = new Set(rows.map((row) => row.work_date));
  const random = seededRandom(employee.code);
  const now = Date.now();
  let inserted = 0;

  for (const [index, day] of days.entries()) {
    // Draw every value up front so a skipped day doesn't shift the rest of the sequence.
    const present = random() < employee.presence;
    const hours = employee.start + random() * (employee.end - employee.start);
    const tint = random();

    const daysAgo = days.length - 1 - index;
    if (!present || existing.has(day) || (employee.leftDaysAgo && daysAgo < employee.leftDaysAgo)) {
      continue;
    }
    const checkedInAt = zonedInstant(day, hours, TIME_ZONE);
    if (checkedInAt.getTime() > now) {
      continue;
    }

    const photoKey = await savePhoto(checkedInAt, employee.code, tint);
    await db.query(
      `INSERT INTO attendances
         (id, employee_id, employee_code, employee_name, work_date, checked_in_at, photo_key, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        // Lists sort by id, so it has to carry the check-in time rather than the seed time.
        uuidv7({ msecs: checkedInAt.getTime() }),
        employee.id,
        employee.employeeCode,
        employee.name,
        day,
        checkedInAt,
        photoKey,
        checkedInAt,
      ],
    );
    inserted += 1;
  }
  return inserted;
}

/** Monday–Friday work dates from `weeks` weeks ago through today, oldest first. */
function workDays(weeks) {
  const today = toWorkDate(new Date());
  const [year, month, day] = today.split('-').map(Number);
  const days = [];
  for (let offset = weeks * 7; offset >= 0; offset -= 1) {
    const date = new Date(Date.UTC(year, month - 1, day - offset));
    if (date.getUTCDay() !== 0 && date.getUTCDay() !== 6) {
      days.push(date.toISOString().slice(0, 10));
    }
  }
  return days;
}

function toWorkDate(instant) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE }).format(instant);
}

/** The instant at which the wall clock in `timeZone` reads `hours` on `date`. */
function zonedInstant(date, hours, timeZone) {
  const [year, month, day] = date.split('-').map(Number);
  const wallClock = Date.UTC(year, month - 1, day, 0, 0, Math.round(hours * 3600));
  return new Date(wallClock - offsetAt(wallClock, timeZone));
}

function offsetAt(instant, timeZone) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    })
      .formatToParts(instant)
      .map((part) => [part.type, Number(part.value)]),
  );
  const local = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  );
  return local - instant;
}

function seededRandom(seed) {
  let state = [...seed].reduce(
    (hash, char) => Math.imul(hash ^ char.charCodeAt(0), 16777619),
    2166136261,
  );
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// --- Photos ---

async function savePhoto(checkedInAt, code, tint) {
  const month = String(checkedInAt.getUTCMonth() + 1).padStart(2, '0');
  const key = `attendance/${checkedInAt.getUTCFullYear()}/${month}/${crypto.randomUUID()}.png`;
  const path = resolve(UPLOAD_DIR, key);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, placeholderPhoto(hueFor(code), tint));
  return key;
}

function hueFor(code) {
  return [...code].reduce((sum, char) => sum + char.charCodeAt(0) * 37, 0) % 360;
}

/** A webcam-style placeholder: a silhouette at a desk, coloured per employee. */
function placeholderPhoto(hue, tint, width = 480, height = 360) {
  const wall = hsl(hue, 35, 72 + tint * 10);
  const wallDark = hsl(hue, 30, 58 + tint * 8);
  const person = hsl(hue, 25, 28);
  const desk = hsl(30, 25, 38 + tint * 8);
  const raw = Buffer.alloc((width * 3 + 1) * height);

  for (let y = 0; y < height; y += 1) {
    const row = y * (width * 3 + 1);
    raw[row] = 0; // PNG filter: none
    for (let x = 0; x < width; x += 1) {
      const head = (x - width / 2) ** 2 + (y - 140) ** 2 < 52 ** 2;
      const shoulders = y > 200 && ((x - width / 2) / 120) ** 2 + ((y - 320) / 120) ** 2 < 1;
      let color;
      if (y > height - 40) color = desk;
      else if (head || shoulders) color = person;
      else color = mix(wall, wallDark, y / height);
      raw.set(color, row + 1 + x * 3);
    }
  }

  const chunk = (type, data) => {
    const body = Buffer.concat([Buffer.from(type), data]);
    const out = Buffer.alloc(body.length + 8);
    out.writeUInt32BE(data.length, 0);
    body.copy(out, 4);
    out.writeUInt32BE(crc32(body), body.length + 4);
    return out;
  };
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header.set([8, 2, 0, 0, 0], 8); // 8-bit RGB
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function mix(a, b, t) {
  return a.map((value, i) => Math.round(value + (b[i] - value) * t));
}

function hsl(h, s, l) {
  s /= 100;
  l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [f(0), f(8), f(4)].map((v) => Math.round(v * 255));
}
