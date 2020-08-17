export const posts: Post[] = [
  {
    id: 1,
    title: 'MQTT Android Client Tutorial',
    created: '2017-05-11T09:54:00+07:00',
    text: `MQTT is one of the popular data communication or messaging protocols that are becoming widely used for machine-to-machine (M2M) communication, or the computer network trend that is popularly coined as "Internet of Things". MQTT (Message Queue Transport Telemetry) is a messaging protocol with a publish-subscribe pattern, one of the messaging protocol regarded as "light-weight", which is important for the Internet of Things architecture, because it heavily involves low-powered devices, such as sensor nodes, microcontrollers, and the like.`
  },
  {
    id: 2,
    title:
      'Multipath Routing with Load Balancing using RYU OpenFlow Controller',
    created: '2018-01-13T09:44:00+07:00',
    text: `This is a write up article of the program of my undergraduate thesis with the title "Multipath Routing with Load Balancing with OpenFlow Software-Defined Networking", using [this source code in Github](https://github.com/wildan2711/multipath/blob/master/ryu_multipath.py).
### Background
Multipath routing is a routing method which finds multiple routes to a destination in a network topology. By providing multiple routes to a destination, it is possible for network traffic to be distributed fairly through multiple paths in the network, or a mechanism known as load-balancing, thus increasing the efficiency of network utility.`
  },
  {
    id: 3,
    title:
      'Building a Simple REST API Authentication App using Dgraph with Dgman',
    created: '2020-02-15T15:16:11.122Z',
    text: `This is a tutorial for building a simple REST API authentication app using the Dgraph database and the [Dgman](https://github.com/dolan-in/dgman) library, showcasing the features and convenience provided by the Dgman library. Dgman allows working with the [Dgraph type system](https://docs.dgraph.io/query-language/#type-system) using the [Dgraph go client](https://github.com/dgraph-io/dgo) in a simple and convenient manner, providing automatic type, schema, and index syncing, node type injection, unique checking in mutations, and query helpers. The aim is to provide a library with ORM-like convenience found in SQL ecosystems for Dgraph clients.`
  },
  {
    id: 4,
    title: 'Golang Error Handling',
    created: '2020-08-17T13:59:57.196Z',
    text: `> 'Don't just check errors, handle them gracefully', - Go Proverb

**TLDR**: wrap unexpected errors with "github.com/pkg/errors".Wrap, or fmt.Errorf("%w", err) (Go 1.13+) adding context.

In my opinion, a developer writing Golang code will encounter ***3 phases*** in their journey in error handling, as per my personal experience and in the teams I've been in:

1. Blindly returning all errors, losing track of where it came from.
2. Logging all errors, causing duplicate error logs.
3. Wrapping errors with a context.

## Introduction
Like many things in the Go language, error handling is one of the many programming language features that have been simplified and stripped down by the Go language, where an error is just a simple value that is passed around. An advantage is that the flow of the program is relatively more linear and simple, whereas *Exception*-based error handling highly used in many other languages may cause the flow of the program to jump around unexpectedly. But the drawback to this is that, in larger and more complex projects, errors become harder to track, if no accepted or standard convention or system of error handling exists in the project.`
  }
];

export default posts.sort(
  (a, b) => Date.parse(b.created) - Date.parse(a.created)
);
