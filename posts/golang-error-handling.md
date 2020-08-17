> 'Don't just check errors, handle them gracefully', - Go Proverb

**TLDR**: wrap unexpected errors with "github.com/pkg/errors".Wrap, or `fmt.Errorf("%w", err)` (Go 1.13+) adding context.

In my opinion, a developer writing Golang code will encounter ***3 phases*** in their journey in error handling, as per my personal experience and in the teams I've been in:

1. Blindly returning all errors, losing track of where it came from.
2. Logging all errors, causing duplicate error logs.
3. Wrapping errors with a context.

## Introduction

Like many things in the Go language, error handling is one of the many programming language features that have been simplified and stripped down by the Go language, where an error is just a simple value that is passed around. An advantage is that the flow of the program is relatively more linear and simple, whereas *Exception*-based error handling highly used in many other languages may cause the flow of the program to jump around unexpectedly. But the drawback to this is that, in larger and more complex projects, errors become harder to track, if no accepted or standard convention or system of error handling exists in the project.

## Phase 1: Return all errors

When we first learn the go language, we find that to do error handling is simple, we just return an error from our function if an error exists. Then the caller will check if the error is `nil` and so on.

Code 1:
```go
func doSomething() error {
    err := doSomethingElse()
    if err != nil {
        return err
    }
    ...
    return nil
}
```

Or

Code 2:

```go
func doSomething() error {
    err := doSomethingElse()
    if err != nil {
        return errors.New("error while doing something else")
    }
    ...
    return nil
}
```

In a small or a beginning of a large project, this way of error handling works well. When an error is returned from a function, it indicates that an error happened on the function then the function will not continue and return early. Though later, we will find when our projects get bigger, error handling such as this is not enough, as it will get increasingly difficult to track unexpected errors.

A system may comprise of many layers. For example in a web service, there is the database layer, business logic layer, service endpoint layer, etc. When the most inner layer, in this example the database layer, returns an error, it will go through a life cycle, or a long chain that propagates the error to the most outer layer, the service endpoint layer. This long chain can easily break if we're not careful, and crucial information regarding the error may get lost.

Like in Code 2 above, the chain is broken because we returned a new error `errors.New("error while doing something else")`, without knowing what error happened from calling the function `doSomethingElse()`, causing the outer function, the function that called `doSomething()` to not know what error actually happened.

### Multiple Error Branches

Another case is for multiple error branches. In a single function, multiple errors can happen from calling multiple functions or operations. Just blindly returning the error will result in not knowing in which part of the function the error occurred.

For example:

Code 3

```go
func doSomething() error {
    err := function1()
    if err != nil {
        return err
    }

    err = function2()
    if err != nil {
        return err
    }

    return nil
}
```

From Code 3 above, an error can occur from calling `function1()` or `function2()`. In the point of view of a caller of `doSomething()`:

```go
func run() {
    err := doSomething()
    if err != nil {
        // did the error come from function1 or function2?
    }
}
```

How can we know if the error came from `function1()` or `function2()`?

## Phase 2: Log All Errors

A quick fix for the above problems is to simply log any errors that are returned, thereby ensuring all error cases are covered and tracked.

For example:

Code 4:

```go
func doSomething() error {
    err := function1()
    if err != nil {
        log.Println("error on function1:", err)
        return err
    }

    err := function2()
    if err != nil {
        log.Println("error on function2:", err)
        return err
    }
    ...
    return nil
}
```

Nice! Now we can know what error specifically happened on calling `doSomething()`, whether it came from `function1()` or `function2()`.

Not so easy...

Now we found a new problem. What if the caller of the function `doSomething()` does the same thing, i.e: log the error?

Code 5:

```go
func run() {
    err := doSomething()
    if err != nil {
        log.Println("error while doing something:", err)
        return
    }
}
```

Now we will find that we have created duplicated logs! 

An example log:
```
2020/02/17 08:59:13.724473 error on function 1: error while....
2020/02/17 08:59:13.724473 error while doing something: error while....
```

In the example above, it is demonstrated that the same error is being logged twice. This can be a waste of space, and in some cases fatal. If we are using a more sophisticated logging systems (which you should in larger projects), which provides multiple log levels, like debug, info, warn, error, fatal, etc., and hooked up into a log stash with counters and statistic dashboards, this can be counted as 2-3 errors! 

This may be deemed fatal if we are processing our logs for statistics and analytics.

## Phase 3: Error Wrapping

A solution that is somewhat accepted in the Golang community for error handling, accounting for the problems above, is by "wrapping" or "annotating" our errors with a context message. This solution is popularized by a library authored by [Dave Cheney](https://dave.cheney.net/), the [github.com/pkg/errors](https://github.com/pkg/errors) package.

A simple example:

Code 6

```go
import (
    "log"

    "github.com/pkg/errors"
)

func doSomething() error {
    err := function1()
    if err != nil {
        return errors.Wrap(err, "function1 failed")
    }

    err := function2()
    if err != nil {
        return errors.Wrap(err, "function2 failed")
    }

    return nil
}

func run() {
    err := doSomething()
    if err != nil {
        log.Println("error while doing something:", err)
        return
    }
}
```
Here, we annotate our error with a simple context message `function1 failed`. When the error hits, a single line of log will return like below:

```
2020/02/17 08:59:13.724473 error while doing something: function 1 failed: error while....
```

Neat! Here we can easily track what errors occurred and where it came from.

Now, you may be wondering, doesn't this already exist on the standard `fmt` library?

Code 6

```go
func doSomething() error {
    err := function1()
    if err != nil {
        return fmt.Errorf("function1 failed: %v", err)
    }
    ...
}
```

Yes, on the surface it does the same thing, annotating the error with a context message. 

The downside is that, now the the caller of `doSomething()` lose any ability to inspect the error programmatically from its raw error value.

For example, it is common that we need to check and process specific errors by its value:

Code 7

```go
func run() {
    err := doSomething()
    if err != nil {
        if err == io.EOF {
            // ignore or handle reading the end of files
        }
    }
}
```

By annotating the error with `fmt.Errorf("%v", err)`, we cannot check an error by its value, and resort to workarounds by checking its error string, such as:

```go
strings.Contains(err.Error(), "EOF")
``` 

which is highly discouraged and unreliable, as `Error()` exists to return a human-readable error string.

### errors.Cause(err)

An advantage of using the `github.com/pkg/errors` way of error wrapping is that we can return or *unwrap* the original error by using the `Cause(err)` function.

Code 8

```go
import (
    "log"

    "github.com/pkg/errors"
)

func run() {
    err := doSomething()
    if err != nil {
        originalErr := errors.Cause(err)
        if originalErr == io.EOF {
            // ignore or handle reading the end of files
        } else {
            log.Println("error while doing something:", err)
            return
        }
    }
}
```

By using the `github.com/pkg/errors` package, errors are now inspectable by both humans and (programmatically by) computers.

## The Future, Go 1.13+

The above way of error handling have become highly accepted and prevalent in the Golang community, high profile Golang codebases such as Docker, Kubernetes, Hugo, etc. have all used the [github.com/pkg/errors](github.com/pkg/errors) package for error handling. So popular, the above technique of error wrapping have made it to the standard Golang library since Go 1.13.

In Go 1.13, the `fmt.Errorf` function supports a new `%w` verb, that allows annotating the error, but also allowing inspection of the original error with the `errors.Is` and `errors.As` functions.

Code 9

```go
import (
    "errors"
    "fmt"
    "io"
    "json"
)

func doSomething() error {
    err := function1()
    if err != nil {
        return fmt.Errorf("function1 failed: %w", err)
    }
    ...
}

func run() {
    err := doSomething()
    if err != nil {
        if errors.Is(err, io.EOF) {
            // ignore or handle reading the end of files
        } else if unmarshalErr := json.UnmarshalTypeError{}; errors.As(err, &unmarshalErr) {
            // handle json.UnmarshalTypeError
        }
        } else {
            log.Println("error while doing something:", err)
            return
        }
    }
}
```

Looking at Code 9 above, we can check if the wrapped error using `fmt.Errorf("%w", err)` equals to a specific error value using the `errors.Is` function, in this example: `io.EOF`. We can also check if the error is a specific error type using the `errors.As` function, in this example, we check that the error is of type `json.UnmarshalTypeError`.

For an in-depth explanation, read the official blog post, [Working with Errors in Go 1.13](https://blog.golang.org/go1.13-errors).

## Conclusion

Errors in Golang are just simple values that are returned from and checked on functions. While making error handling greatly simple, special care is needed to avoid errors being untrackable, duplicated, and not programmatically inspectable.

A highly accepted and prevalent technique is by doing error wrapping. First popularized by the [github.com/pkg/errors](https://github.com/pkg/errors) package, the technique has since made it to the standard Golang library since v1.13.

In Go 1.13 `fmt.Errorf` function supports a new `%w` verb, that allows annotating the error, but also allowing inspection of the original error with the `errors.Is` and `errors.As` functions.

References:
- https://dave.cheney.net/2016/04/27/dont-just-check-errors-handle-them-gracefully
- https://blog.golang.org/go1.13-errors
- https://godoc.org/github.com/pkg/errors?importers