const fs = require('fs');
const path = require('path');

// Function to recursively find all JSX files
function findJSXFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      findJSXFiles(filePath, fileList);
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Function to fix nested template literals
function fixNestedTemplateLiterals(content) {
  // Pattern 1: Fix deeply nested template literals with multiple levels
  const deeplyNestedPattern = /\$\{import\.meta\.env\.VITE_API_BASE_URL \|\| '\$\{import\.meta\.env\.VITE_API_BASE_URL \|\| 'http:\/\/localhost:8000'\}'\}/g;
  content = content.replace(deeplyNestedPattern, '${import.meta.env.VITE_API_BASE_URL || \'http://localhost:8000\'}');
  
  // Pattern 2: Fix single quotes inside template literals
  const singleQuotePattern = /'(\$\{import\.meta\.env\.VITE_API_BASE_URL \|\| 'http:\/\/localhost:8000'\})'/g;
  content = content.replace(singleQuotePattern, '`$1`');
  
  // Pattern 3: Fix any remaining nested patterns
  const nestedPattern = /\$\{import\.meta\.env\.VITE_API_BASE_URL \|\| '\$\{import\.meta\.env\.VITE_API_BASE_URL \|\| 'http:\/\/localhost:8000'\}'\}/g;
  content = content.replace(nestedPattern, '${import.meta.env.VITE_API_BASE_URL || \'http://localhost:8000\'}');
  
  return content;
}

// Main function
function main() {
  const srcDir = path.join(__dirname, 'src');
  const jsxFiles = findJSXFiles(srcDir);
  
  console.log(`Found ${jsxFiles.length} JSX/JS files to process...`);
  
  let fixedCount = 0;
  
  jsxFiles.forEach(filePath => {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      const fixedContent = fixNestedTemplateLiterals(content);
      
      if (originalContent !== fixedContent) {
        fs.writeFileSync(filePath, fixedContent, 'utf8');
        console.log(`Fixed: ${path.relative(__dirname, filePath)}`);
        fixedCount++;
      }
    } catch (error) {
      console.error(`Error processing ${filePath}:`, error.message);
    }
  });
  
  console.log(`\nFixed ${fixedCount} files successfully!`);
}

main();
