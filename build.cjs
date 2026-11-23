const fs = require('node:fs');
const path = require('node:path');
fs.cpSync(path.join(__dirname,'src'),path.join(__dirname,'dist'),{recursive:true});
