const fs = require('fs');
const exec = require('child_process').exec;

// TODO: checken of versie echt hoger is dan de vorige i.p.v. checken of het aangepast is

const packageJson = fs.readFileSync('./package.json', 'utf8');
const packageJsonParsed = JSON.parse(packageJson);

exec(`npm view ${packageJsonParsed.name} version`, (err, stdout) => {
  if (err) {
    console.log(err);
    return;
  }
  console.log(stdout);
  const deployed_version = stdout.trim();
  console.log(`versiecheck:`);
  console.log(`laatst gedeployede versie: ${deployed_version}`);
  console.log(`uit package.json: ${packageJsonParsed.version}`);

  if (deployed_version === packageJsonParsed.version) {
    console.error('❌ package.json versie is nog niet opgehoogd');
    process.exit(1); // Exit met een error code
  } else {
    console.log('✔ package.json versie is anders dan de vorige versie');
  }
});
