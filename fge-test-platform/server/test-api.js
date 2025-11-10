import http from 'http';

const req = http.request({
  hostname: 'localhost',
  port: 5000,
  path: '/api/questions/random/IDENT1?limit=10',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('API Response:');
      console.log('Success:', json.success);
      console.log('Data length:', json.data ? json.data.length : 'no data');
      if (json.data && json.data.length > 0) {
        json.data.forEach((q, i) => {
          console.log(`Q${i+1}: id=${q.id}, imageUrl='${q.imageUrl}'`);
        });
      }
    } catch (e) {
      console.log('Raw response:', data);
    }
  });
});

req.on('error', console.error);
req.end();
