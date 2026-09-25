const { spawn } = require('child_process');
const fs = require('fs');
const { execSync } = require('child_process');

function startTunnel() {
    console.log('Starting localtunnel...');
    const lt = spawn('npx.cmd', ['localtunnel', '--port', '8000'], { shell: true });
    
    let urlFound = false;

    lt.stdout.on('data', (data) => {
        const output = data.toString();
        console.log(output);
        const match = output.match(/your url is: (https:\/\/[^\s]+)/);
        if (match && match[1]) {
            const url = match[1];
            console.log(`Found URL: ${url}`);
            fs.writeFileSync('tunnel_url.txt', url);
            try {
                execSync('git add tunnel_url.txt');
                execSync('git commit -m "Update tunnel URL"');
                execSync('git push origin main');
                console.log('Pushed new URL to github.');
            } catch(e) {
                console.log('Git push failed or no changes.');
            }
            urlFound = true;
        }
    });

    lt.stderr.on('data', (data) => {
        console.error(data.toString());
    });

    lt.on('close', (code) => {
        console.log(`localtunnel exited with code ${code}. Restarting in 3 seconds...`);
        setTimeout(startTunnel, 3000);
    });
}

startTunnel();
