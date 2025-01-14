const fs = require('fs');
const needle = require('needle');
const readline = require('readline');

const [url, filePath] = process.argv.slice(2);

if (!url || !filePath) {
  console.error("Usage: node fetcher.js <URL> <local-file-path>");
  process.exit(1);
}

function downloadFile(url, filePath) {
  needle.get(url, (error, response) => {
    if (error) {
      console.error(`Error while fetching URL: ${error.message}`);
      process.exit(1);
    }

    if (response.statusCode !== 200) {
      console.error(`Failed to fetch the URL. HTTP Status: ${response.statusCode}`);
      process.exit(1);
    }

    const fileSize = Buffer.byteLength(response.body);
    fs.writeFile(filePath, response.body, (err) => {
      if (err) {
        console.error(`Error writing to file: ${err.message}`);
        process.exit(1);
      }

      console.log(`Downloaded and saved ${fileSize} bytes to ${filePath}`);
    });
  });
}

function promptOverwrite() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question(`The file ${filePath} already exists. Overwrite? (Y/N): `, (answer) => {
    rl.close();

    if (answer.toUpperCase() === 'Y') {
      downloadFile(url, filePath);
    } else {
      console.log('Operation cancelled. File not overwritten.');
      process.exit(0);
    }
  });
}

const fileExists = fs.existsSync(filePath);

if (fileExists) {
  promptOverwrite();
} else {
  downloadFile(url, filePath);
}