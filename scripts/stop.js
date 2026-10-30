// Stops any leftover server on the dev ports (5173 dev, 4173 preview).
// Usage: npm run stop
import { execSync } from 'node:child_process';

const PORTS = [5173, 4173];
const isWin = process.platform === 'win32';

function pidsOnPort(port) {
  try {
    if (isWin) {
      // Columns: Proto, Local address, Foreign address, State, PID (IPv4 and IPv6).
      // Any process that owns the local port is the server. Windows does not always
      // report it as LISTENING, so the state is not checked.
      return execSync('netstat -ano', { encoding: 'utf8' })
        .split(/\r?\n/)
        .map((line) => line.trim().split(/\s+/))
        .filter((c) => c[0] === 'TCP' && c[1]?.endsWith(`:${port}`))
        .map((c) => c.at(-1));
    }
    return execSync(`lsof -ti tcp:${port} -sTCP:LISTEN`, { encoding: 'utf8' }).split('\n').filter(Boolean);
  } catch {
    return []; // nothing listening
  }
}

let stopped = 0;
for (const port of PORTS) {
  for (const pid of new Set(pidsOnPort(port))) {
    if (!/^\d+$/.test(pid) || pid === '0') continue;
    try {
      execSync(isWin ? `taskkill /PID ${pid} /F` : `kill -9 ${pid}`, { stdio: 'ignore' });
      console.log(`Stopped server on port ${port} (process ${pid}).`);
      stopped++;
    } catch {
      // Process already gone (Windows keeps closed connections listed for a while).
    }
  }
}

console.log(stopped ? 'Done.' : 'No server was running. Ports 5173 and 4173 are free.');
