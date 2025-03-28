// Simple wrapper script to compile and run the TypeScript update script
const { exec } = require('child_process');
const path = require('path');

console.log('Compiling TypeScript update script...');

// Compile the TypeScript file
exec('npx tsc --skipLibCheck scripts/update-schema.ts', (error, stdout, stderr) => {
  if (error) {
    console.error('Error compiling TypeScript:', error);
    console.error(stderr);
    process.exit(1);
  }
  
  console.log('TypeScript compilation successful!');
  console.log('Running update script...\n');
  
  // Run the compiled JavaScript file
  const child = exec('node scripts/update-schema.js', (error, stdout, stderr) => {
    if (error) {
      console.error('Error running update script:', error);
      console.error(stderr);
      process.exit(1);
    }
  });
  
  // Pipe output to console
  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);
}); 