#!/usr/bin/env node

const package = require('./package.json');
const colors = require('colors/safe');
const program = require('commander');
const jsonfile = require('jsonfile');
const mustache = require('mustache');
const express = require('express');
const prompt = require('prompt');
const path = require('path');
const opn = require('opn');
const fs = require('fs');
const ws = require('ws');

// --- Default values

let styleGuideFile = 'styleg.json';
const defaultValues = require('./defaults.json');

// --- Prompt configuration

prompt.message = null;
prompt.delimiter = colors.white(':');

// -- JSON export configuration

const jsonOptions = {
  spaces: 2,
  EOL: '\n'
};

// --- Program actions

let cmd = null;

program
  .version(package.version)
  .option('-p, --port <port>', 'Change server listen port', 9800)
  .option('--live-reload <port>', 'Change live reload port', 9801)
  .option('-b, --build <file>', 'Build style guide into a HTML file');

program
  .command('create [file]')
  .description('Create a new style guide file')
  .action((file) => {
    cmd = 'create';
    let targetFile = file || styleGuideFile;
    prompt.get({
      properties: {
        file: {
          description: colors.white('Create on file') + colors.green(` [${targetFile}]`)
        },
        project: {
          description: colors.white('Project name') + colors.green(` [${defaultValues.project}]`)
        },
        author: {
          description: colors.white('Author') + colors.green(` [${defaultValues.author}]`)
        },
        version: {
          description: colors.white('Version') + colors.green(` [${defaultValues.version}]`)
        },
      }
    }, (err, result) => {
      targetFile = result.file || targetFile;
      const obj = Object.assign(defaultValues, {
        version: result.version || defaultValues.version,
        project: result.project || defaultValues.project,
        author: result.author || defaultValues.author,
      });
      
      jsonfile.writeFileSync(targetFile, obj, jsonOptions);
      console.log("\n" + colors.green('Style guide generated sucessfully!') + "\n");
      process.exit();
    });
  });

program
  .arguments('[file]')
  .description(`Shows style guide in browser for a given file (defaults to ${styleGuideFile})`)
  .action((file) => {
    if (file) {
      styleGuideFile = file;
    }
  });

program.parse(process.argv);

// ---

if (cmd === null) {
  if (!fs.existsSync(styleGuideFile)) {
    console.error(`${colors.red('Error:')} File ${styleGuideFile} doesn't exist. If you want to create a new style guide file, please run ${colors.green(`${program._name} create`)}`);
    process.exit(1);
  }

  const buildHtml = (liveReload) => {
    const template = fs.readFileSync(path.resolve(__dirname, './template.html'), 'utf8');
    const obj = jsonfile.readFileSync(styleGuideFile);
    if (liveReload) {
      obj.liveReloadPort = program.liveReload;
    }
    return mustache.render(template, obj);
  }

  if (program.build) {
    const htmlContent = buildHtml();
    fs.writeFileSync(program.build, htmlContent);
    console.log(
      "\n" +
      colors.green('Style guide ') +
      colors.white(styleGuideFile) +
      colors.green(' has been built successfully into ') +
      colors.white(program.build) +
      "\n"
    );
    process.exit(0);
  }

  const wss = new ws.Server({
    port: program.liveReload
  });
  fs.watch(styleGuideFile, (eventType) => {
    if (eventType === 'change') {
      console.log(colors.gray(`${styleGuideFile} has been updated, reloading...`))
      wss.clients.forEach((client) => {
        if (client.readyState === ws.OPEN) {
          client.send('update');
        }
      })
    }
  });
  console.log(colors.green('\nLive-reload server listening on port ') + colors.yellow(program.liveReload));

  let app = express();
  app.get('/', (req, res) => {
    const htmlContent = buildHtml(true);
    res.send(htmlContent);
  });

  app.listen(program.port);

  const url = `http://localhost:${program.port}/`;
  console.log("\n" + colors.green('Listening on port ') + colors.yellow(program.port));
  console.log(colors.green('Open on your browser at ') + colors.white(url) + "\n");

  opn(url);
}
