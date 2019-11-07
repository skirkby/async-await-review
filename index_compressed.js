
function atTime(dte) {
    const date = dte || new Date();
    const ms = date.getMilliseconds();
    const min = date.getMinutes();
    const sec = date.getSeconds();
    const hr = date.getHours();
    const time = `${hr}:${min}:${sec}.${ms}`;

    return time;
}

function isSuccessful(result) {
    return (result.includes("success"));
}

function longRunningFunction() {
    const dte = new Date();
    const ms = dte.getMilliseconds();
    const time = atTime(dte);
    if (ms % 5 === 0) {
        throw Error(`${time} : exception`);
    } else if (ms % 3 === 0) {
        return `${time} : failure`;
    } else {
        return `${time} : success`;
    }
}

function promiseFunction() {
    function doWork(resolve, reject) {
        setTimeout(() => {
            try {
                const result = longRunningFunction();
                if (isSuccessful(result)) {
                    const successResult = result;
                    resolve(successResult);
                } else {
                    const errorResult = result;
                    reject(errorResult);
                }
            } catch (error) {
                reject(error.message)
            }
        }, 2000);
    }
    const promise = new Promise(doWork);
    return promise;
}

function doPromise() {
    promiseFunction()
        .then(successResult => {
            console.log(`${successResult} - (promise call)`);
        })
        .catch(errorResult => {
            console.log(`${errorResult} - (promise call)`);
        })
        .finally(() => {
            console.log(`${atTime()} :     Finally! - (promise call)`);
        });
}

doPromise();
console.log(`${atTime()} : done calling promiseFunction()`);

async function doAsyncAwait() {
    try {
        const successResult = await promiseFunction();
        console.log(`${successResult} - (async call)`);
    } catch (errorResult) {
        console.log(`${errorResult} - (async call)`);
    } finally {
        console.log(`${atTime()} :     Finally! - (async call)`);
    }
}

doAsyncAwait();
console.log(`${atTime()} : done calling async() method`);

