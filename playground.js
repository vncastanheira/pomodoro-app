var fs = require('fs');

let file = fs.readFileSync('config.json', 'utf8');
let json = JSON.parse(file);
console.log(json.config)