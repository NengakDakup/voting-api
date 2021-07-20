const {PythonShell} = require('python-shell');

PythonShell.run('deployment.py', null, function (err) {
  if (err) throw err;
  console.log('finished');
});