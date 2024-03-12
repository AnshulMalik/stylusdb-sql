const fs = require('fs');

const PAGE_SIZE = 4096;

class DiskManager {
    constructor(fileName) {
        this.fileName = fileName;
        this.fd = fs.openSync(this.fileName, 'w+');
    }

    readPage(pageNumber) {
        return new Promise((resolve, reject) => {
            const buffer = Buffer.alloc(PAGE_SIZE);
            fs.read(this.fd, buffer, 0, PAGE_SIZE, pageNumber * PAGE_SIZE, (err, bytesRead) => {
                if (err) {
                    reject(new Error(`Error reading page ${pageNumber}: ${err.message}`));
                } else {
                    if (bytesRead < PAGE_SIZE) {
                        resolve(buffer.slice(0, bytesRead));
                    } else {
                        resolve(buffer);
                    }
                }
            });
        });
    }

    writePage(pageNumber, buffer) {
        return new Promise((resolve, reject) => {
            fs.write(this.fd, buffer, 0, buffer.length, pageNumber * PAGE_SIZE, (err) => {
                if (err) {
                    reject(new Error(`Error writing to page ${pageNumber}: ${err.message}`));
                } else {
                    resolve();
                }
            });
        });
    }

    close() {
        try {
            fs.closeSync(this.fd);
        } catch (error) {
            throw new Error(`Error closing file ${this.fileName}: ${error.message}`);
        }
    }
}

module.exports = { DiskManager }
