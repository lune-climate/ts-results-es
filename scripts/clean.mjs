import fsp from 'fs/promises';
import fs from 'fs'

if(fs.existsSync('../dist')) {
    await fsp.rm("../dist", {recursive: true}, (err) => resolve(err));
    console.log(`Cleaned up data with result "${JSON.stringify(cleanup_result)}"`);
} else {
    console.warn('nothing to clean')
}

