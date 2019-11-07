function atTime(dte) {
    const ms = dte.getMilliseconds();
    const min = dte.getMinutes();
    const sec = dte.getSeconds();
    const hr = dte.getHours();
    const time = `${hr}:${min}:${sec}.${ms}`;

    return time;
}

//
// This is a simulated "long running function". This function is actually NOT
// long running... but we created it just to have something to call. We simulate
// a long running function by using the setTimeout() method in the
// "promiseFunction()" defintion below.
//
// This function just makes a semi-random determination about whether to return
// a success code, a failure code, or to throw an exception.
//
function longRunningFunction() {
    // no-op ... this is just to simulate a long running function.
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

//
// helper function that reviews the result and determines if it is a successful
// result. This is used to determine whether to "resolve" the Promise object, or
// to "reject" it, below.
//
function isSuccessful(result) {
    return (result.includes("success"));
}

//
// This is a function that returns a promise. API's that consist of functions
// that return Promise objects are said to be "Promise-based API's".
//
// When an API is Promise-based, you have 2 options: use the .then().catch()
// syntax, or use the async/await syntax. We do both below.
//
// This is just the definition of the Promise function. Promise-based API's are
// similar in structure to this... they create a Promise object, and give it a
// function wherein the long-running work is done. In that function, it then
// uses the results of the work to determine whether to "reject" or "resolve"
// the Promise.
// 
// The new Promise object is immediately returned (even before the long-running
// work completes), and the code that called the Promise-based function
// specifies what to do if the Promise "resolves", and what to do if the Promise
// "rejects".
//
// See the .then().catch() syntax below to see how this is done with that
// syntax, and the async/await syntax below to see how this is done with that
// syntax.
//
function promiseFunction() {
    // create an inner function to do our work. This function will be passed a
    // "reject" function and a "resolve" function by the Promise constructor.
    // Our doWork() function should call "resolve(result)" if our work was
    // successful, therefore "resolving" the Promise. Our doWork() function
    // should call "reject(errorData)" if something goes wrong, thereby
    // "rejecting" the Promise.
    //
    // Note that we are only DEFINING the doWork() function here, not RUNNING
    // it. Once we have it DEFINED, we will pass it in to the Promise()
    // constructor... that's how the "resolve" and "reject" functions are passed
    // in to our doWork() function.
    function doWork(resolve, reject) {
        // setTimeout() is how we make our long running work "asynchronous".
        // This causes the JavaScript engine to essentially run our stuff on
        // another thread. There may be other ways to make our long running work
        // "async", but the point is that it should be async. If not, it is just
        // blocking our code before the Promise object can be returned, which is
        // exactly NOT the point... :) Here, we are simulating a long running
        // function by delaying its execution for 2 seconds. If the function
        // actually took 2 seconds (or 20, etc.), then our "timeout" parameter
        // to setTimeout() would be "0" - basically saying "start it NOW"... but
        // it wouldn't finish until its done (2 or 20 or whatever
        // seconds/minutes/months later.)
        setTimeout(() => {
            // we do a try..catch block in case the longRunningFunction()
            // happens to throw an exception for some reason. It's possible that
            // longRunningFunction() will return an error reslut without
            // throwing an exception. In either case (returning an error result
            // or throwing an exception), we should "reject()" the Promise, and
            // pass error information to the reject() function. If the return
            // from longRunningFunction() is successful, then we should
            // "resolve()" the Promise, and pass any results to it.
            try {
                // do our long running work, and get the result back.
                const result = longRunningFunction();
                // decide if we need to "resolve" or "reject" the Promise (using
                // the resolve and reject functions passed to us.)
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

    // we create a promise object, passing our "work" function to it. When the
    // Promise constructor calls our doWork() function, it will pass in its
    // "resolve" and "reject" functions, which our doWork() function will call
    // based on whether the work was successful or not.
    //
    // The Promise() constructor will launch our doWork method. doWork() must
    // take the step to put the long-running function on another thread (by
    // using something like setTimeout()) if we intend for that work to be
    // completed asynchronously (which is wise for things that we don't control,
    // like network requests against database or API servers owned by other
    // people.)
    const promise = new Promise(doWork);

    // immediately return the promise object - even before our asynchronous
    // long-running work is done. 
    return promise;
}


// call the promise function directly. It will return a Promise object, and we
// will call the .then() and .catch() methods on it, passing in functions that
// it should execute once the Promise resolves, or rejects. Any functions passed
// in using .then() are called if the promise resolves. Any functions passed in
// using .catch() are called if the promise rejects.
//
// We call .catch() off of the .then() call... .then() returns the same Promise
// object.
//
// You can chain multiple .then() and .catch() methods, as they both return a
// Promise object.
promiseFunction()
    // when the promise object is resolved, the value passed to the
    // Promise.resolve() method is sent in to our callback (which we pass to
    // .then() below). Here, I've named the parameter in our callback function
    // "successResult". 
    .then(successResult => {
        console.log(`${successResult} - (promise call)`);
    })
    // when the promise object is rejected, or if there is an exception, the
    // value passed to the Promise.reject() method (or the object that is thrown
    // in the exception) is sent in to our callback (which we pass to .catch()
    // below). Here, I've named the parameter in our callback function
    // "errorResult". 
    .catch(errorResult => {
        console.log(`${errorResult} - (promise call)`);
    })
    // the finally function is added to the "promise chain", and is *always*
    // executed, whether the promise resolved or rejected, whether the .then()
    // function was called, or the .catch() function. This gives you an
    // opportunity to perform "clean up" code (closing DB connections, cleaning
    // up setTimeouts(), etc.), whether there was an error or not. Some things
    // you need to do no matter what the result of the promise was.
    .finally(() => {
        console.log(`${atTime(new Date())} : Finally! - (promise call)`);
    });
// we should see this log entry in the console before the log entries up above.
// The call to promiseFunction() immediately returns a Promise object, even if
// the long running work in promiseFunction() isn't done yet (assuming the long
// running work is executed asynchronously). We then call .then() on the Promise
// object that is returned in order to "register" a "handler" for the "resolved"
// value of the promise (which is passed to our handler callback when the
// promise is resolved.)
//
// In the console, you should see the following log entry first, then when the
// "long running work" is completed, you will see the log entry in our handlers
// above. 
console.log(`${atTime(new Date())} : done calling promiseFunction()`);


// use async/await syntax
//
// The code in the "try{}" portion of the try..catch block is essentially the
// same as what we would put in a .then() call on the returned Promise object.
//
// The code in the "catch{}" portion of the try..catch block is essentially the
// same as what we would put in a .catch() call on the returned Promise object.
//
// In the syntax below, I am defining an anonymous function, and calling it
// immediately. The function definition is in outer ()'s, and the function
// invocation is caused by the trailing ()'s after the outer ()'s around the
// function definition.
//
// The "async" modifier before a function definition causes the function to be
// executed on another thread, and to return a Promise object. 
(async () => {
    try {
        // this call returns a Promise object from promiseFunction(), but
        // execution of the code doesn't continue until the Promise is resolved
        // or rejected.
        const successResult = await promiseFunction();
        // if the promise is resolved, flow continues with the next statement...
        console.log(`${successResult} - (async call)`);
        // if the promise is rejected, flow continues with the first statement in
        // the catch() block. "errorResult" (which can be called anything... here
        // I've just called it "errorResult") is the value thatis passed to the
        // Promise.reject() method.
    } catch (errorResult) {
        console.log(`${errorResult} - (async call)`);
        // regardless of whether the promise is resolved or rejected, the code
        // in this "finally" block will be executed, just as with the .finally()
        // call above.
    } finally {
        console.log(`${atTime(new Date())} : Finally! - (async call)`);
    }
})();
// we should see this log entry in the console before the log entries up above.
// The call to the async function immediately returns a Promise object. But we
// don't use that promise object to register our handler functions. The handler
// code is actually inside the async function. We could use the returned Promise
// for other things... but calling .then() and .catch() isn't necessary, as the
// try..catch block inside the async() function takes care of it for us.
console.log(`${atTime(new Date())} : done calling async() method`);

