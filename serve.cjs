const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const assets = {'/':'index.html','/index.html':'index.html','/style.css':'style.css','/bench.js':'bench.js'};
http.createServer((req,res)=>{
  const file = assets[new URL(req.url,'http://localhost').pathname];
  if(typeof file !== 'string'){res.writeHead(404).end();return;}
  res.setHeader('Content-Type',{'html':'text/html; charset=utf-8','css':'text/css','js':'text/javascript'}[file.split('.').pop()]);
  fs.createReadStream(path.join(__dirname,'dist',file)).on('error',()=>res.end()).pipe(res);
}).listen(Number(process.env.PORT || 4173),'127.0.0.1');
