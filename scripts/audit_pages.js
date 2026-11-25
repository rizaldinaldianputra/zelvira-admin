const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else if (file === 'page.tsx') {
      results.push(fullPath);
    }
  }
  return results;
}

const appDir = path.resolve('app');
const files = walk(appDir);
console.log(`Total page.tsx: ${files.length}`);

const report = [];

for (const file of files) {
  const relPath = path.relative(appDir, file).replace(/\\/g, '/');
  const content = fs.readFileSync(file, 'utf8');

  // Count functions
  const hasUseClient = content.includes("'use client'") || content.includes('"use client"');
  const hasState = /useState\s*[<(]/.test(content);
  const hasEffect = /useEffect\s*\(/.test(content);
  const hasForm = /useForm\s*[<(]/.test(content);
  const routerMatch = /useRouter\s*\(/.test(content);
  const toastMatch = /useToast\s*\(/.test(content);
  
  // Find functions declared in the file
  const functionMatches = [];
  const regexes = [
    /(?:const|let)\s+(handle\w+|fetch\w+|load\w+|on\w+|toggle\w+|save\w+|delete\w+|submit\w+|change\w+)\s*=/g,
    /async\s+function\s+(\w+)\s*\(/g,
    /function\s+(handle\w+|fetch\w+|load\w+|on\w+)\s*\(/g
  ];

  for (const reg of regexes) {
    let match;
    while ((match = reg.exec(content)) !== null) {
      if (!functionMatches.includes(match[1])) {
        functionMatches.push(match[1]);
      }
    }
  }

  report.push({
    relPath,
    hasUseClient,
    hasState,
    hasEffect,
    hasForm,
    routerMatch,
    toastMatch,
    functionCount: functionMatches.length,
    functions: functionMatches
  });
}

const withFunctions = report.filter(r => r.functionCount > 0 || r.hasState || r.hasForm);
console.log(`Pages with state or functions: ${withFunctions.length} / ${report.length}`);

fs.writeFileSync('audit_pages.json', JSON.stringify(withFunctions, null, 2));
console.log('Written to audit_pages.json');
