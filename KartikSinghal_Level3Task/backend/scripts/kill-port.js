import { execSync } from 'child_process';

const PORT = process.env.PORT || 5000;

try {
  const isWindows = process.platform === 'win32';

  if (isWindows) {
    const result = execSync(`netstat -ano | findstr :${PORT}`, { encoding: 'utf8' });
    const lines = result.trim().split('\n');
    const pids = new Set();

    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && pid !== '0') pids.add(pid);
    }

    for (const pid of pids) {
      try {
        execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
        console.log(`🧹 Cleared stale process on port ${PORT} (PID ${pid})`);
      } catch {
        // PID already gone
      }
    }
  } else {
    execSync(`lsof -ti tcp:${PORT} | xargs kill -9`, { stdio: 'ignore' });
    console.log(`🧹 Cleared stale process on port ${PORT}`);
  }
} catch {
  // Port is free — nothing to kill
}
