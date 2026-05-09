const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'backend');
const outputFile = path.join(__dirname, 'FarmEasy_Database_Queries.txt');

function findJsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (file !== 'node_modules') {
        findJsFiles(filePath, fileList);
      }
    } else if (file.endsWith('.js')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const allFiles = findJsFiles(directoryPath);
let outputContent = 'FarmEasy Database Queries\n=========================\n\n';

const sqlRegex = /([^]*(?:SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|CALL)[^]*)/gi;

for (const file of allFiles) {
  const content = fs.readFileSync(file, 'utf8');
  let match;
  let fileHasQueries = false;
  let fileQueries = '';

  while ((match = sqlRegex.exec(content)) !== null) {
    const query = match[1].trim();
    // Only include if it looks like a real query
    if (query.match(/^(?:SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|WITH|CALL|BEGIN|COMMIT|ROLLBACK)\b/i)) {
      fileHasQueries = true;
      fileQueries += '----------------------------------------\n';
      fileQueries += query + '\n';
      fileQueries += '----------------------------------------\n\n';
    }
  }

  // Also check for regular strings with SELECT/INSERT
  const stringSqlRegex = /"(SELECT|INSERT|UPDATE|DELETE)[^"]*"/gi;
  while ((match = stringSqlRegex.exec(content)) !== null) {
    fileHasQueries = true;
    fileQueries += '----------------------------------------\n';
    fileQueries += match[0].replace(/"/g, '') + '\n';
    fileQueries += '----------------------------------------\n\n';
  }

  const singleQuoteSqlRegex = /'(SELECT|INSERT|UPDATE|DELETE)[^']*'/gi;
  while ((match = singleQuoteSqlRegex.exec(content)) !== null) {
    fileHasQueries = true;
    fileQueries += '----------------------------------------\n';
    fileQueries += match[0].replace(/'/g, '') + '\n';
    fileQueries += '----------------------------------------\n\n';
  }

  if (fileHasQueries) {
    outputContent += 'File: ' + file.replace(directoryPath, 'backend') + '\n\n';
    outputContent += fileQueries;
    outputContent += '==================================================\n\n';
  }
}

fs.writeFileSync(outputFile, outputContent);
console.log('Queries extracted to ' + outputFile);
