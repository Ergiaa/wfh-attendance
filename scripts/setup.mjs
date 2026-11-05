// Idempotent: safe to re-run; never overwrites an existing .env.
import { execSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';

const SERVICES = ['employees-service', 'attendance-service', 'gateway'];

function run(command) {
  try {
    execSync(command, { stdio: 'inherit' });
  } catch {
    console.error(`\nSetup failed at: ${command}`);
    process.exit(1);
  }
}

function ensureEnv(app) {
  const target = `apps/${app}/.env`;
  if (!existsSync(target)) {
    copyFileSync(`apps/${app}/.env.example`, target);
    console.log(`Created ${target}`);
  }

  const env = readFileSync(target, 'utf8');
  if (/^JWT_SECRET=\s*$/m.test(env)) {
    const secret = randomBytes(48).toString('base64');
    writeFileSync(target, env.replace(/^JWT_SECRET=\s*$/m, `JWT_SECRET=${secret}`));
    console.log(`Generated JWT_SECRET in ${target}`);
  }
}

SERVICES.forEach(ensureEnv);
run('npm install');
run('npm run db:up');
run('npm run db:seed');

console.log('\nSetup complete. Start everything with: npm run dev');
