const { spawn } = require('child_process');
const os = require('os');
const path = require('path')

function trainData() {
  let pythonExecutable = '';

  // check if it's running on windows or linux
  if(os.platform() === 'win32'){
    pythonExecutable = __dirname + './env/Scripts/python';
  } else if(os.platform() === 'linux') {
    pythonExecutable = __dirname + './env/Scripts/python';
  }

  const bat = spawn(pythonExecutable, ['extract.py']);

  bat.stdout.on('data', (data) => {
    console.log(data);
  });

  bat.stderr.on('data', (data) => {
    console.log(data.toString());
  });

  bat.on('exit', (code) => {
    console.log(`Child exited with code ${code}`);
  });
}

async function runPrediction(){
  let pythonExecutable = '';

  // check if it's running on windows or linux
  if(os.platform() === 'win32'){
    pythonExecutable = __dirname + './env/Scripts/python.exe';
  } else if(os.platform() === 'linux') {
    pythonExecutable = __dirname + './env/Scripts/python';
  }

  const bat = spawn(pythonExecutable, ['./deployment.py', './training/0-ahmed.flac']);

    bat.stdout.on('data', (data) => {
      const res = data.toString();
      const items = res.split('\n');
  
      return(items[items.length-2]);
  
    });

  bat.stderr.on('data', (data) => {
    return (data.toString());
  });

  bat.on('exit', (code) => {
    console.log(`Child exited with code ${code}`);
  });
}

// trainData();

module.exports= {runPrediction, trainData}