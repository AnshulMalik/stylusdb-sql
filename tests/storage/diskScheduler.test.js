const { DiskScheduler, DiskRequest } = require('../../src/storage/diskScheduler');
const { jest } = require('@jest/globals');

jest.mock('../../src/storage/diskScheduler', () => {
    const originalModule = jest.requireActual('../../src/storage/diskScheduler');
    return {
        ...originalModule,
        diskManager: {
            readPage: jest.fn(),
            writePage: jest.fn(),
        },
    };
});

describe('DiskScheduler Tests', () => {
    let diskScheduler;
    beforeEach(() => {
        diskScheduler = new DiskScheduler(DiskScheduler.diskManager);
    });

    afterEach(() => {
        diskScheduler.close();
    });

    test('test_process_read_request', async () => {
        const readRequest = new DiskRequest(true, 1, null);
        DiskScheduler.diskManager.readPage.mockResolvedValue('data');
        diskScheduler.schedule(readRequest);
        result = await readRequest.promise.promise
        assert.deepStrictEqual(result, Buffer.from('data'));
        expect(DiskScheduler.diskManager.readPage).toHaveBeenCalledWith(1);

    });

    test('test_process_write_request', async () => {
        const writeRequest = new DiskRequest(false, 1, Buffer.alloc(10));
        DiskScheduler.diskManager.writePage.mockResolvedValue('ok');
        diskScheduler.schedule(writeRequest);
        await new Promise(resolve => setTimeout(resolve, 200)); // Wait for the request to be processed
        expect(DiskScheduler.diskManager.writePage).toHaveBeenCalledWith(1, expect.any(Buffer));
    });

    test('test_handle_operation_error', async () => {
        const errorRequest = new DiskRequest(true, 1, null);
        const error = new Error('Disk error');
        DiskScheduler.diskManager.readPage.mockRejectedValue(error);
        diskScheduler.schedule(errorRequest);
        await new Promise(resolve => setTimeout(resolve, 200)); // Wait for the request to be processed
        expect(errorRequest.promise.catch).toHaveBeenCalled();
    });

    test('test_stop_processing_when_closed', async () => {
        diskScheduler.close();
        const request = new DiskRequest(true, 1, null);
        diskScheduler.schedule(request);
        await new Promise(resolve => setTimeout(resolve, 200)); // Wait to see if the request is processed
        expect(DiskScheduler.diskManager.readPage).not.toHaveBeenCalled();
    });

    test('test_handle_no_requests_in_queue', async () => {
        await new Promise(resolve => setTimeout(resolve, 200)); // Wait to see if any errors are thrown
        expect(diskScheduler.requestQueue.length).toBe(0);
    });
});