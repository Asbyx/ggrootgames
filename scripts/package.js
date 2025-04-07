const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Create a temporary directory for packaging
const tempDir = path.join(__dirname, '../temp_package');
if (fs.existsSync(tempDir)) {
  fs.rmSync(tempDir, { recursive: true, force: true });
}
fs.mkdirSync(tempDir, { recursive: true });

// Copy necessary files and directories
const filesToCopy = [
  'backend',
  'frontend',
  'db',
  'package.json',
  'package-lock.json',
  'README.md'
];

filesToCopy.forEach(file => {
  const sourcePath = path.join(__dirname, '..', file);
  const destPath = path.join(tempDir, file);
  
  if (fs.statSync(sourcePath).isDirectory()) {
    // For directories, use recursive copy
    fs.mkdirSync(destPath, { recursive: true });
    copyDirRecursive(sourcePath, destPath);
  } else {
    // For files, simple copy
    fs.copyFileSync(sourcePath, destPath);
  }
});

// Create modified wrangler.toml
const wranglerContent = fs.readFileSync(path.join(__dirname, '../wrangler.toml'), 'utf8');
const modifiedWranglerContent = wranglerContent
  .replace(/name\s*=\s*"[^"]*"/, 'name = ""')
  .replace(/database_id\s*=\s*"[^"]*"/, 'database_id = ""')
  .replace(/database_name\s*=\s*"[^"]*"/, 'database_name = ""');

fs.writeFileSync(path.join(tempDir, 'wrangler.toml'), modifiedWranglerContent);

// Create zip file
const zipFileName = 'ggrootgames_package.zip';
const zipFilePath = path.join(__dirname, '..', zipFileName);

// Remove existing zip if it exists
if (fs.existsSync(zipFilePath)) {
  fs.unlinkSync(zipFilePath);
}

// Create zip file using native OS commands
try {
  if (process.platform === 'win32') {
    // Windows
    execSync(`powershell Compress-Archive -Path "${tempDir}\\*" -DestinationPath "${zipFilePath}"`, { stdio: 'inherit' });
  } else {
    // Unix-like systems
    execSync(`cd "${tempDir}" && zip -r "${zipFilePath}" .`, { stdio: 'inherit' });
  }
  console.log(`Package created successfully: ${zipFileName}`);
} catch (error) {
  console.error('Error creating zip file:', error);
}

// Clean up temp directory
fs.rmSync(tempDir, { recursive: true, force: true });

// Helper function to copy directories recursively
function copyDirRecursive(src, dest) {
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
} 