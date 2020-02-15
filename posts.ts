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
        created: '2020-02-04T15:16:11.122Z',
        text: `This is a tutorial for building a simple REST API authentication app using the Dgraph database and the [Dgman](https://github.com/dolan-in/dgman) library, showcasing the features and convenience provided by the Dgman library. Dgman allows working with the [Dgraph type system](https://docs.dgraph.io/query-language/#type-system) using the [Dgraph go client](https://github.com/dgraph-io/dgo) in a simple and convenient manner, providing automatic type, schema, and index syncing, node type injection, unique checking in mutations, and query helpers. The aim is to provide a library with ORM-like convenience found in SQL ecosystems for Dgraph clients.`
    }
];

export default posts.sort(
    (a, b) => Date.parse(b.created) - Date.parse(a.created)
);
