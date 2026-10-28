// Convenience wrapper for users who type 'node server.js'
// Launches the Python Flask backend server
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log("\x1b[36m%s\x1b[0m", "💡 Notice: The backend is built with Python Flask.");
console.log("\x1b[32m%s\x1b[0m", "   Launching Python Flask server ('python app.py')...\n");

const venvPython = path.join(__dirname, 'venv', 'bin', 'python');
const pythonCmd = fs.existsSync(venvPython) ? venvPython : 'python3';

const pyProcess = spawn(pythonCmd, ['app.py'], {
  cwd: __dirname,
  stdio: 'inherit'
});

pyProcess.on('error', (err) => {
  console.error("\x1b[31mError launching Python:\x1b[0m", err.message);
  console.log("\nPlease run the standard Python commands instead:");
  console.log("  cd backend");
  console.log("  source venv/bin/activate");
  console.log("  python app.py\n");
});

