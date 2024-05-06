const next = require('next');
const { parse } = require('url');

const express = require('express');
const spawn = require('child_process').spawn;
const { OpenAI } = require('openai');
const fs = require('fs');

const port = process.env.PORT || 3000;
const hostname = '0.0.0.0';
const dev = process.env.NODE_ENV !== 'production';

const openai = new OpenAI({

  
  apiKey: process.env.KEY,
})

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

let logs = `- Nikto v2.5.0 ---------------------------------------------------------------------------

Multiple IPs found: 45.33.32.156, 2600:3c01::f03c:91ff:fe18:bb2f

Target IP: 45.33.32.156

Target Hostname: scanme.nmap.org

Target Port: 80

Start Time: 2024-05-06 01:15:43 (GMT0) ---------------------------------------------------------------------------

Server: Apache/2.4.7 (Ubuntu)

/: The anti-clickjacking X-Frame-Options header is not present. See: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options

/: The X-Content-Type-Options header is not set. This could allow the user agent to render the content of the site in a different fashion to the MIME type. See: https://www.netsparker.com/web-vulnerability-scanner/vulnerabilities/missing-content-type-header/

No CGI Directories found (use '-C all' to force check all possible dirs)

Apache/2.4.7 appears to be outdated (current is at least 2.4.57). Apache 2.2.34 is the EOL for the 2.x branch.

/index: Uncommon header 'tcn' found, with contents: list.`;


let connectedClients = [];

const Event = (type, content, output = null) => {
  // \n\n is the delimeter of every event
  return `data: ${JSON.stringify({ type, content, output })}\n\n`
}

(async () => {
  try {
    await app.prepare();
    const server = express();
    server.get('/api/scan', (req, res) => {
      const newClientId = Date.now();
      const outputFilename = `scanner_output_${newClientId}.html`;

      let niktoP = null;
      const hostToScan = req.query.host;
      const options = ['-h', hostToScan];
      if (req.query.forcessl) options.push('-ssl');
      if (req.query.noLookUp) options.push('-nolookup');
      if (req.query.no404) options.push('-no404');

      if (req.query.maxTime) options.push('-maxtime', req.query.maxTime);
      if (req.query.timeout) options.push('-timeout', req.query.timeout);
      if (req.query.port) options.push('-port', req.query.port);
      if (req.query.pause) options.push('-Pause', req.query.pause);

      if (req.query.tunning) options.push('-Tuning', req.query.tunning.replace(',', ''));

      if (req.query.display) options.push('-Display', req.query.display.replace(',', ''));

      options.push('-o', outputFilename, '-Format', 'htm');

      // Headers for Server-Sent Events
      res.writeHead(200, {
        'Cache-Control': 'no-cache',
        'Content-Type': 'text/event-stream',
        'Connection': 'keep-alive'
      });

      req.on('close', () => {
        console.log(`Web client: ${newClientId} connection closed.`);
        // Removes client and its output file
        connectedClients = connectedClients.filter(client => client !== newClientId);
        fs.unlink(outputFilename, (unlinkErr) => {
          if (unlinkErr) console.log(`Error deleting file: ${outputFilename} ${unlinkErr}`) 
        });
        // Stop spawned process
        if (niktoP) {
          niktoP.stdout.end();
          niktoP.kill();
        }
      });

      if (!hostToScan) {
        setTimeout(() => {
          res.write(Event('error', 'A valid hostname is required'));
        }, 1000);
      } else {
        console.log(`New web client has connected: ${newClientId}`);
        connectedClients.push(newClientId);
        // Spawns Nikto as a child process
        console.log(options);
        niktoP = spawn('nikto.pl', options);
        niktoP.stdout.on('data', (data) => {
          setTimeout(() => {
            const stdout = data.toString();
            res.write(Event('feed', stdout));
            logs += (stdout + '\n');
          }, 1000);
        });

        niktoP.on('close', (code) => {
          console.log(`Nikto process exited with code: ${code}`);
          setTimeout(() => {
            if (code === 1) {
              fs.readFile(outputFilename, (err, data) => {
                if (err) {
                  res.write(Event('error', `Error while reading the output: ${err}`));
                } else {
                  res.write(Event('done', `Scanning host: ${hostToScan} has ended.`, data.toString()));
                }
              });
            } else {
              res.write(Event('error', `Error while scanning host: ${hostToScan}`));
            }
          }, 1000);
        });
      }
    });

    server.get('/analyzeresults', async (req, res) => {
      try{
        const response = await openai.completions.create({
            model: "gpt-3.5-turbo",
            prompt: `
              consider the nikto logs:
              ${logs}
              Tell me the loop holes and how can someone can get access to system and hack it. Create a detailed Report
                `,
            max_tokens: 500,
        });
        res.status(200).json({
            success: true,
            data: response.choices[0].text,
        })
      }catch(err){
          console.log(err);
          res.status(400).json({
              succes: false,
              error: err.response ? err.response.data : "There was an issue on the server"
          });
      }
    })

    // Default route
    server.all('*', async (req, res) => {
      try {
        const parsedUrl = parse(req.url, true);
        await handle(req, res, parsedUrl);
      } catch (err) {
        console.error('Error occurred handling', req.url, err);
        res.statusCode = 500;
        res.end('Internal Server Error');
      }
    });

    server.listen(port, (err) => {
      if (err) throw err;
      console.log(`Server listening on port: ${port}`);
    });
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
