import { chromium } from '@playwright/test';
import { spawn, ChildProcess } from 'child_process';
import net from 'net';
import { exec } from 'child_process';

let devServer: ChildProcess | undefined;
let serverPort = 3000;

async function findOpenPort(startPort: number): Promise<number> {
  let port = startPort;

  while (port < startPort + 10) {
    const isAvailable = await new Promise<boolean>(resolve => {
      const server = net.createServer();
      server.once('error', () => resolve(false));
      server.once('listening', () => {
        server.close();
        resolve(true);
      });
      server.listen(port);
    });

    if (isAvailable) return port;
    port++;
  }

  throw new Error(`No available ports found starting from ${startPort}`);
}

async function waitForServer(url: string, timeout: number = 30000): Promise<void> {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    try {
      await page.goto(url, { waitUntil: 'load' });
      await browser.close();
      return;
    } catch {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  await browser.close();
  throw new Error(`Server did not start at ${url} within ${timeout / 1000} seconds.`);
}

async function killProcessOnPort(port: number): Promise<void> {
  if (process.platform === 'win32') {
    await exec(`netstat -ano | findstr :${port} | findstr LISTENING && FOR /F "tokens=5" %a in ('netstat -ano | findstr :${port} | findstr LISTENING') do taskkill /F /PID %a`);
  } else {
    await exec(`lsof -i:${port} -t | xargs kill -9 || true`);
  }
}

export default async function globalSetup(): Promise<void> {
  console.log('Killing any existing process on port 3000...');
  await killProcessOnPort(3000);
  
  console.log('Starting development server...');
  devServer = spawn('npm', ['run', 'dev'], {
    shell: true,
    stdio: 'inherit',
    cwd: process.cwd(),
  });

  // Ensure the server is stopped on exit
  process.on('exit', () => stopDevServer());
  process.on('SIGINT', () => stopDevServer());

  console.log('Waiting for server to be ready...');
  await waitForServer('http://localhost:3000');
  console.log('Server is ready!');

  process.env.TEST_SERVER_PORT = '3000';
}

function stopDevServer(): void {
  if (devServer && devServer.pid) {
    console.log('Stopping development server...');
    try {
      process.kill(-devServer.pid);
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === 'ESRCH') {
        console.warn('Dev server process not found. It may have already stopped.');
      } else {
        throw err;
      }
    }
  } else {
    console.warn('Dev server is not running.');
  }
}
