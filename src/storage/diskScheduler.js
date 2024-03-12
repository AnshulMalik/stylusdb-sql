

// Disks offer very restricted parallelism, we should control the the parallelism
class DiskScheduler {
    constructor(diskManager) {
        this.diskManager = diskManager
        this.requestQueue = []
        this.closed = false
        this.startWorker();
    }

    // places the DiskRequest in queue
    schedule(request) {
        this.requestQueue.push(request)
    }

    // Worker function to process requests
    async startWorker() {
        while (!this.closed) {
            if (this.requestQueue.length > 0) {
                const request = this.requestQueue.shift(); // Get the first request from the queue
                try {
                    let result
                    if (request.isRead) {
                        result = await this.diskManager.readPage(request.pageNumber);
                    } else {
                        result = await this.diskManager.writePage(request.pageNumber, request.buffer);
                    }
                    request.promise.resolve(result)
                } catch (error) {
                    request.promise.reject(error)
                }
                // Resolve the request's promise here if needed
            } else {
                // No request in the queue, wait for a while before checking again
                await new Promise(resolve => setTimeout(resolve, 100)); // Wait for 100ms
            }
        }
    }



    close() {
        this.closed = true
    }
}

class DiskRequest {
    constructor(isRead, pageNumber, buffer) {
        this.isRead = isRead
        this.buffer = buffer
        if (!this.buffer) {
            // buffer is optional for read
            this.buffer = Buffer.alloc(PAGE_SIZE);
        }
        this.pageNumber = pageNumber
        this.promise = this.createDeferred()
    }

    createDeferred() {
        let resolve, reject;
        // Create a promise and expose its resolve and reject functions
        let promise = new Promise((res, rej) => {
            resolve = res;
            reject = rej;
        });
        return { promise, resolve, reject };
    }
}

module.exports = { DiskScheduler, DiskRequest }