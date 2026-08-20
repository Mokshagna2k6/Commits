const d = require('./shared/stackfox-data.json');
console.log('keys:', Object.keys(d));
console.log('categories:', (d.categories || []).map(c => c.name || c.id || c.slug).join(', '));
console.log('services count:', (d.services || []).length);
console.log(JSON.stringify((d.services || [])[0], null, 2).slice(0, 1500));