const fs = require('fs');
const { DiskManager } = require('../../src/storage/diskManager'); // Assuming DiskManager is exported from a file named DiskManager.js
const assert = require('assert');
const sinon = require('sinon');

describe('DiskManager', function() {
    let diskManager;
    const testFileName = 'testfile.bin';

    beforeEach(function() {
        // Create a new DiskManager instance before each test
        diskManager = new DiskManager(testFileName);
    });

    afterEach(function() {
        // Cleanup: Close the file and remove it after each test
        assert.doesNotThrow(() => diskManager.close());
        fs.unlinkSync(testFileName);
    });

    it('should be able to read a page from the file correctly', async function() {
        const testBuffer = Buffer.from('Hello, world!');
        await diskManager.writePage(1, testBuffer);
        const readBuffer = await diskManager.readPage(1);
        assert.deepStrictEqual(readBuffer, testBuffer);
    });

    it('should be able to write a page to the file correctly', async function() {
        const testBuffer = Buffer.from('Hello, world!');
        await diskManager.writePage(0, testBuffer);
        const readBuffer = fs.readFileSync(testFileName);
        assert.deepStrictEqual(readBuffer.slice(0, testBuffer.length), testBuffer);
    });

    it('should handle errors correctly when reading from or writing to a page', async function() {
        const stub = sinon.stub(fs, 'read').yields(new Error('Read error'));
        try {
            await diskManager.readPage(0);
            assert.fail('Expected error was not thrown');
        } catch (error) {
            assert.strictEqual(error.message, 'Error reading page 0: Read error');
        } finally {
            stub.restore();
        }
    });

    it('should handle errors correctly when closing the file', function() {
        const stub = sinon.stub(fs, 'closeSync').throws(new Error('Close error'));
        try {
            diskManager.close();
            assert.fail('Expected error was not thrown');
        } catch (error) {
            assert.strictEqual(error.message, 'Error closing file testfile.bin: Close error');
        } finally {
            stub.restore();
        }
    });
});