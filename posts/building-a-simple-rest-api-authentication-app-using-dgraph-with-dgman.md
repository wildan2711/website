This is a tutorial for building a simple REST API authentication app using the Dgraph database and the [Dgman](https://github.com/dolan-in/dgman) library, showcasing the features and convenience provided by the Dgman library. Dgman allows working with the [Dgraph type system](https://docs.dgraph.io/query-language/#type-system) using the [Dgraph go client](https://github.com/dgraph-io/dgo) in a simple and convenient manner, providing automatic type, schema, and index syncing, node type injection, unique checking in mutations, and query helpers. The aim is to provide a library with ORM-like convenience found in SQL ecosystems for Dgraph clients.

## Creating the Schema

First, let's define our schema in a `User` struct.

```go
type User struct {
	UID      string     `json:"uid,omitempty"`
	Fullname string     `json:"fullname,omitempty" dgraph:"index=term"`
	Email    string     `json:"email,omitempty" dgraph:"index=exact unique"`
	Password string     `json:"password,omitempty" dgraph:"type=password"`
	Dob      *time.Time `json:"dob,omitempty"`
	DType    []string   `json:"dgraph.type,omitempty"`
}
```

Dgman allows to map our struct into a Dgraph schema by using the `json` and `dgraph` tags. The `json` tag defines our predicate name, while the `dgraph` tag defines our index, value type, or other dgraph directives. There is also a Dgman specific directive here in use, the `unique` directive to be used in mutations, which we will get into later.

Next, We would like to create the Dgraph type and schema when the app starts. Let's do this in our `main()` function, with establishing our Dgraph client connection.

```go
package main

import (
	"fmt"
	"log"

	"github.com/dgraph-io/dgo/v2"
	"github.com/dgraph-io/dgo/v2/protos/api"
	"github.com/dolan-in/dgman"
	"google.golang.org/grpc"
)

type User struct {
	UID      string     `json:"uid,omitempty"`
	Fullname string     `json:"fullname,omitempty" dgraph:"index=term"`
	Email    string     `json:"email,omitempty" dgraph:"index=exact unique"`
	Password string     `json:"password,omitempty" dgraph:"type=password"`
	Dob      *time.Time `json:"dob,omitempty"`
	DType    []string   `json:"dgraph.type,omitempty"`
}

func newDgraphClient() *dgo.Dgraph {
	d, err := grpc.Dial("localhost:9080", grpc.WithInsecure())
	if err != nil {
		panic(err)
	}

	return dgo.NewDgraphClient(
		api.NewDgraphClient(d),
	)
}

func main() {
	dg := newDgraphClient()

	schema, err := dgman.CreateSchema(dg, &User{})
	if err != nil {
		log.Fatalln("create schema", err)
	}

	fmt.Println(schema)
}

```

As seen above, we call `dgman.CreateSchema(dg, &User{})` to create our type and schema. You can pass multiple pointer structs into `CreateSchema` to create multiples types and schemas, it will automatically detect any schema conflicts and duplicates. When we log the returned `schema` variable, it will display the generated Dgraph schema and types as sent to Dgraph.

```
fullname: string @index(term) .
email: string @index(exact) @upsert .
password: password .
dob: datetime .

type User {
        email
        password
        dob
        fullname
}
```

## Data store logic

Next, we will define a few common data store logic used in user authentication, e.g: register, check password, and get user.

For example using the below struct and interfaces:
```go
type Login struct {
	Email    string
	Password string
}

type User struct {
	UID      string     `json:"uid,omitempty"`
	Fullname string     `json:"fullname,omitempty" dgraph:"index=term"`
	Email    string     `json:"email,omitempty" dgraph:"index=exact unique"`
	Password string     `json:"password,omitempty" dgraph:"type=password"`
	Dob      *time.Time `json:"dob,omitempty"`
	DType    []string   `json:"dgraph.type,omitempty"`
}

type checkPassword struct {
	Valid bool `json:"valid"`
}

type UserStore interface {
	Create(context.Context, *User) error
	CheckPassword(context.Context, *Login) (bool, error)
	Get(ctx context.Context, uid string) (*User, error)
}
```

### Create User

For creating users in a web application, we would normally require for a user's email to be unique. In Dgraph, this would consist of two operations in an upsert block: first, query whether a user with the email exists, then if no user is found, create the user. This is because Dgraph's lack of support for a unique index (though since v1.2 there is a [@noconflict](https://docs.dgraph.io/master/query-language/#noconflict-directive) directive, an experimental feature, only avoiding conflicts in the predicate level, not types yet). This requires us, when using Dgraph client libraries, to construct these upsert logic ourselves.

Using Dgman, ensuring whether a field/predicate is unique for a node type is simple. Add the `unique` keyword in the `dgraph` struct tag, then use one of the [available mutation helpers](https://github.com/dolan-in/dgman#create-mutate-with-unique-checking). 

As you can see on the `User` struct, we added the keyword `unique` on the `Email` field.

```go
type User struct {
	UID      string     `json:"uid,omitempty"`
	Fullname string     `json:"fullname,omitempty" dgraph:"index=term"`
	Email    string     `json:"email,omitempty" dgraph:"index=exact unique"`
	Password string     `json:"password,omitempty" dgraph:"type=password"`
	Dob      *time.Time `json:"dob,omitempty"`
	DType    []string   `json:"dgraph.type,omitempty"`
}
```

Then we implement the `UserStore.Create` method as below, using the `dgman.Create` mutation helper.

```go
type userStore struct {
	c *dgo.Dgraph
}

func (s *userStore) Create(ctx context.Context, user *User) error {
	err := dgman.NewTxnContext(ctx, s.c).Create(user, true)
	if err != nil {
		if uniqueErr, ok := err.(*dgman.UniqueError); ok {
			if uniqueErr.Field == "email" {
				return ErrEmailExists
			}
		}
		return err
	}
	return nil
}
```

As seen above, the `Create` method will create a node with the type `User`. If a `User` node with the passed email already exists, it will return an error with the type `*dgman.UniqueError`. From there, you can check which field/predicate has failed the uniqueness check. Here we check if the unique error is on the `"email"` field and return an error that can be checked on the caller, in this case, our HTTP handlers later.

### Check Password

Dgraph supports a [password](https://docs.dgraph.io/query-language/#extended-types) type which we can use to store passwords securely. We will use the `checkpwd` query function on Dgraph to check if the given password matches the stored password hash. Using Dgman, you can use query helpers to help generate, send, and parse our queries, as shown below.

```go
type Login struct {
	Email    string
	Password string
}

type checkPassword struct {
	Valid bool `json:"valid"`
}

func (s *userStore) CheckPassword(ctx context.Context, login *Login) (bool, error) {
	result := &checkPassword{}

	tx := dgman.NewReadOnlyTxnContext(ctx, s.c)
	err := tx.Get(&User{}).
		Filter("eq(email, $1)", login.Email).
		Query(`{ valid: checkpwd(password, $1) }`, login.Password).
		Node(result)
	if err != nil {
		if err == dgman.ErrNodeNotFound {
			return false, ErrUserNotFound
		}
	}

	return result.Valid, nil
}
```

Here, the `tx.Get(&User{})` method call will prepare a query for querying nodes with the `User` type. `.Filter("eq(email, $1)", login.Email)` will generate the filter to find a matching `User` node with the passed email parameter, `$1` denoting the ordinal index of the passed parameters on the `Filter` method. Here we only passed 1 parameter, but if we want to pass more than one parameter, we can position it on the filter using the ordinal index, e.g: `$2`, `$3`, etc. This also applies for the `Query` method. The `Query` method is where we define the inner query portion, what fields/values to be returned from the Dgraph query. 

As mentioned above, we will return the result of the `checkpwd` Dgraph function and store it on the `valid` alias. The `Node` method will execute the query and determines that we want to return a single node result from the query, with an optional parameter to define the struct pointer destination of the query result (a JSON object). Here, we pass the `result` variable, an instance of a `checkPassword` struct, as the result destination.

From there, we can return the `result.Valid` field which indicates whether the password was valid. Another case is whether we did not find a `User` node with the passed email, then the query method will return a `dgman.ErrNodeNotFound` error value.

### Get User

Next, we define a method to get the user node by UID.

```go
func (s *userStore) Get(ctx context.Context, uid string) (*User, error) {
	user := &User{}
	err := dgman.NewReadOnlyTxnContext(ctx, s.c).
		Get(user).
		UID(uid).
		Node()
	if err != nil {
		if err == dgman.ErrNodeNotFound {
			return nil, ErrUserNotFound
		}
	}
	return user, nil
}
```

Here we will get a `User` node, if we don't specify a `Query` portion, it will call the `expand(_all_)` function on the first depth.

All in all, this is the query that it generates:

```
data(func: uid($uid)) {
	uid
	expand(_all_)
}
```

If we wanted expand on multiple depths, we can call the `.All(n)` method, where `n` denotes the depth of the query expansion.

## HTTP Handlers

We won't go in detail in creating HTTP handlers, but we will use the [Gin framework](https://github.com/gin-gonic/gin) to help create our REST API.

```go
import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

type userAPI struct {
	store UserStore
}

func (a *userAPI) Register(c *gin.Context) {
	var user User
	if err := c.Bind(&user); err != nil {
		c.AbortWithStatus(http.StatusBadRequest)
		return
	}

	if err := a.store.Create(c, &user); err != nil {
		if err == ErrEmailExists {
			c.AbortWithStatusJSON(http.StatusConflict, gin.H{
				"id":      "emailExists",
				"message": "User with the email already exists",
			})
			return
		}
		log.Println("create user error", err)
		c.AbortWithStatus(http.StatusInternalServerError)
		return
	}

	c.JSON(http.StatusCreated, user.UID)
}

func (a *userAPI) Login(c *gin.Context) {
	var login Login
	if err := c.Bind(&login); err != nil {
		c.AbortWithStatus(http.StatusBadRequest)
		return
	}

	valid, err := a.store.CheckPassword(c, &login)
	if err != nil {
		if err == ErrUserNotFound {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"id":      "invalidEmail",
				"message": "No user associated with the email",
			})
			return
		}
		log.Println("check password", err)
		c.AbortWithStatus(http.StatusInternalServerError)
		return
	}

	if !valid {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
			"id":      "invalidPassword",
			"message": "Invalid password for the email",
		})
		return
	}

	user, err := a.store.Get(c, result.UserID)
	if err != nil {
		log.Println("get user", err)
		c.AbortWithStatus(http.StatusInternalServerError)
		return
	}

	c.AbortWithStatusJSON(http.StatusOK, user)
}
```

As seen above, it is just a minimal implementation of register and login endpoints for a REST API (you won't find it to be that simple in production ;D), but you can see the big picture of how Dgman simplifies development of a Dgraph client in Go.

## Stiching it All Together

Next, let's stich all those parts together, by modifiying our `main()` function as below.

```go
func newApi(dgoClient *dgo.Dgraph) *userAPI {
	return &userAPI{
		store: &userStore{c: dgoClient},
	}
}

func main() {
	dg := newDgraphClient()

	schema, err := dgman.CreateSchema(dg, &User{})
	if err != nil {
		log.Fatalln("create schema", err)
	}

	fmt.Println(schema)

	api := newApi(dg)

	server := gin.New()
	server.POST("/register", api.Register)
	server.POST("/auth", api.Login)
	server.Run(":4000")
}
```

Here, we create a gin server with 2 endpoints, `/register` and `/auth` which calls our `Register` and `Login` HTTP handlers, and run it on port `4000`.

## Testing It Out

Let's use [Postman](https://www.postman.com/) to test out our API.

### Register

Let's send the below JSON data as the registration payload.

```json
{
	"fullname": "Wildan Maulana Syahidillah",
	"email": "wildan2711@gmail.com",
	"password": "qwerty123",
	"dob": "1995-11-27T00:00:00.000Z"
}
```

![Register Postman](/register.png)

As shown above, we sent our user registration payload, which successfully created the user and returned the generated uid "0x30d4c" as the API response.

Now, let's check if the unique checking on the "email" field works, by sending the same JSON payload again.

![Register failed existing email Postman](/register-exists.png)

As you can see, the unique check works as an error is returned indicating the same email already exists. From that, we demonstrated how easy it is to check for uniqueness using the Dgman library.

### Login

Now, after the user is registered, let's try to authenticate the user by sending the below payload.

```json
{
	"email": "wildan2711@gmail.com",
	"password": "qwerty123"
}
```

![Login with Postman](/login.png)

On successful login, it will return the user information as created previously.

Now for the error cases:

*Wrong Password*

![Login wrong password Postman](/login-bad-password.png)

*Wrong Email*

![Login wrong email Postman](/login-bad-email.png)

## Summary

In this tutorial, we learned how to use the Dgman library to help build a simple REST API authentication app, and explored how Dgman helps in managing our Dgraph schema in our apps by providing automatic type and schema creation, node type injection, unique checking in mutations, and query helpers.

The full code is available in the [Dgman Github repository](https://github.com/dolan-in/dgman/tree/master/examples/authapp).

Thank you, hopefully this tutorial helps you create awesome apps using Dgraph and Dgman. Await for more Dgman features and tutorials from me.
