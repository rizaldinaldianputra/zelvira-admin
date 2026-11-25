/**
 * Automated Script to Extract Page Logic into Custom React Hooks
 * 
 * zelvira-admin:
 * - Generates dedicated custom hooks for all 49 pages containing state, functions, effects, and API calls.
 * - Refactors each page.tsx file to purely presentational view components using custom hooks.
 * - Zero business logic or functions left in app pages.
 */

const fs = require('fs');
const path = require('path');

const { crudListGenerators } = require('./generators/crud-list-hooks');
const { crudFormGenerators } = require('./generators/crud-form-hooks');
const { specialGenerators } = require('./generators/special-hooks');

const rootDir = path.resolve(__dirname, '..');

function ensureDirectoryExistence(filePath) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
}

function runGenerator() {
  console.log('====================================================');
  console.log('🚀 Starting Automatic Hook Generator for Zelvira Admin');
  console.log('====================================================\n');

  const allGenerators = [
    ...crudListGenerators,
    ...crudFormGenerators,
    ...specialGenerators,
  ];

  console.log(`📋 Total Pages to Refactor: ${allGenerators.length}\n`);

  let generatedHooksCount = 0;
  let updatedPagesCount = 0;

  for (const gen of allGenerators) {
    const fullHookPath = path.join(rootDir, gen.hookFile);
    const fullPagePath = path.join(rootDir, gen.pageFile);

    // 1. Write Hook File
    ensureDirectoryExistence(fullHookPath);
    fs.writeFileSync(fullHookPath, gen.hookCode.trim() + '\n', 'utf8');
    generatedHooksCount++;

    // 2. Overwrite Page File with Refactored Version
    ensureDirectoryExistence(fullPagePath);
    fs.writeFileSync(fullPagePath, gen.pageCode.trim() + '\n', 'utf8');
    updatedPagesCount++;

    console.log(`✅ [${gen.name}] -> Hook: ${gen.hookFile} | Page: ${gen.pageFile}`);
  }

  // 3. Generate hooks/index.ts index export
  const hookExports = allGenerators
    .map(g => {
      const baseName = path.basename(g.hookFile).replace(/\.(tsx|ts)$/, '');
      return `export * from './${baseName}';`;
    })
    .join('\n');

  const indexFilePath = path.join(rootDir, 'hooks', 'index.ts');
  fs.writeFileSync(indexFilePath, `// Auto-generated hook exports\n${hookExports}\nexport * from './use-organization';\nexport * from './use-toast';\n`, 'utf8');

  console.log('\n====================================================');
  console.log(`🎉 SUCCESS!`);
  console.log(`📦 Hooks Created:   ${generatedHooksCount}`);
  console.log(`📄 Pages Refactored: ${updatedPagesCount}`);
  console.log(`📑 Index Export:    hooks/index.ts`);
  console.log('====================================================\n');
}

runGenerator();
