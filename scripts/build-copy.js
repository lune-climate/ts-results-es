const fs = require('fs');
const path = require('path');


const resolveJson = (specifier) => {
    if(specifier.startsWith('cjs')) {
        return { type: 'commonjs' }
    }
    return { type: 'module' }
}


const paths = {
    'cjs' : path.join(process.cwd(), 'dist', 'cjs', 'package.json'),
    'esm': path.join(process.cwd(), 'dist', 'esm', 'package.json'),
    'cjs/rxjs-operators': path.join(process.cwd(), 'dist', 'cjs', 'rxjs-operators', 'package.json'),
    'esm/rxjs-operators': path.join(process.cwd(), 'dist', 'esm', 'rxjs-operators', 'package.json')
}
const entries = Object.entries(paths);

const specifierToJson = Object
    .fromEntries(entries
        .map(([specifier, _]) => [specifier, JSON.stringify(resolveJson(specifier))]));

for(const [specifier, fullpath] of entries) {
    // Create the dist/esm directory if it doesn't exist
    if (!fs.existsSync(path.dirname(fullpath))) {
      fs.mkdirSync(path.dirname(fullpath), { recursive: true });
    }
    fs.writeFileSync(fullpath , specifierToJson[specifier], null, 2);
}

// Create the dist/esm directory if it doesn't exist
// Write the JSON content to the file

console.log('JSONs copied to ' + entries.map(k => k[0]));
