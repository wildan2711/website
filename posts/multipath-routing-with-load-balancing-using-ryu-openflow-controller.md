This is a write up article of the program of my undergraduate thesis with the title "Multipath Routing with Load Balancing with OpenFlow Software-Defined Networking", using [this source code in Github](https://github.com/wildan2711/multipath/blob/master/ryu_multipath.py).

### Background
Multipath routing is a routing method which finds multiple routes to a destination in a network topology. By providing multiple routes to a destination, it is possible for network traffic to be distributed fairly through multiple paths in the network, or a mechanism known as load-balancing, thus increasing the efficiency of network utility.
Basically what we want is this:

![](https://wildanmsyah.files.wordpress.com/2017/11/output.gif)

Source: [Dario Banfi](https://www.youtube.com/watch?v=hkgf7l9Lshw)

Why?

* Network Utility: means a more balanced network.
* Bandwidth: possibly an increased bandwidth through parallel transport.
* Security: harder to sniff packets.

This specific topic has been researched for quite awhile, a simple [Wikipedia](https://en.wikipedia.org/wiki/Multipath_routing) search results in the earliest research being in 2001.

With the rise of *Software-Defined Networks* recently through the OpenFlow protocol, Multipath Routing has been made simpler, with a more programmable approach to computer networks. Since version 1.1, the OpenFlow protocol supported __Group Tables__, which basically allows us to define or apply multiple actions to a specific flow. [Atlassian, for the Floodlight controller](https://floodlight.atlassian.net/wiki/spaces/floodlightcontroller/pages/7995427/How+to+Work+with+Fast-Failover+OpenFlow+Groups), has a comprehensive explanation of this specific feature, but basically there are 4 types of Group Tables, and the [OpenFlow Specification](https://www.opennetworking.org/images/stories/downloads/sdn-resources/onf-specifications/openflow/openflow-switch-v1.5.0.noipr.pdf) has quite a lazy but effective explanation of these:

> – All - used for multicast and flooding

> – ***Select - used for multipath***

> – Indirect - simple indirection

> – Fast Failover - use first live port

Oh, yeah..

### Implementation

So here I implemented using that specific feature of OpenFlow to create a simple Multipath Routing app/module with the [Ryu OpenFlow controller](https://osrg.github.io/ryu/). To put it simply, what I needed to achieve this was identify:

[1. A multiple path finding algorithm: DFS](#1-path-finding-using-dfs)

[2. Path cost calculation.](#2-path-cost-calculation)

[3. How to use the OpenFlow Protocol.](#3-the-openflow)

### 1. Path Finding using DFS

As pointed out in [this site](http://eddmann.com/posts/depth-first-search-and-breadth-first-search-in-python/), the *Depth First Search (DFS)* path finding algorithm explores possible vertices in a graph by finding the deepest vertex in the graph first before it backtracks to find other possible vertices using a *stack*. This is a useful feature (uses a stack) of this algorithm, for multipath routing specifically, because we are able to tweak the algorithm to find <em>all </em>the possible paths between two vertices.

To put it into context, we are able find all the possible paths between two nodes (switches) in a network.

So for an example topology:

![](https://wildanmsyah.files.wordpress.com/2017/11/topo.png)

For h1 to reach h2, we can use the DFS algorithm to find two possible paths:

1. s1 - s2 - s4
2. 1 - s3 - s5 - s4

Let's see how that translates into code, here's a snippet of [my Github](https://github.com/wildan2711/multipath/blob/master/ryu_multipath.py):

```python
    def get_paths(self, src, dst):
        '''
        Get all paths from src to dst using DFS algorithm
        '''
        if src == dst:
            # host target is on the same switch
            return [[src]]
        paths = []
        stack = [(src, [src])]
        while stack:
            (node, path) = stack.pop()
            for next in set(self.adjacency[node].keys()) - set(path):
                if next is dst:
                    paths.append(path + [next])
                else:
                    stack.append((next, path + [next]))
        print "Available paths from ", src, " to ", dst, " : ", paths
        return paths
```

Some key points:

* `src`, `dst` is the routing target, which are switches (uses an integer OpenFlow dpid) connecting the hosts.
* `self.adjacency` holds the adjacency matrix of the network/graph.
* Returns a list of `paths`.

### 2. Path Cost Calculation

Because the DFS algorithm returns an unweighted list of paths, we need to be able to measure the cost of a path. Another use of the costs is for the bucket weights of the path (explained later). A simple approach that I used was:

1. Calculate the link cost [OSPF style](https://www.cisco.com/c/en/us/support/docs/ip/open-shortest-path-first-ospf/7039-1.html#t6).
2. Total the link costs of the links in the path.

```python
    def get_link_cost(self, s1, s2):
        '''
        Get the link cost between two switches
        '''
        e1 = self.adjacency[s1][s2]
        e2 = self.adjacency[s2][s1]
        bl = min(self.bandwidths[s1][e1], self.bandwidths[s2][e2])
        ew = REFERENCE_BW/bl
        return ew

    def get_path_cost(self, path):
        '''
        Get the path cost
        '''
        cost = 0
        for i in range(len(path) - 1):
            cost += self.get_link_cost(path[i], path[i+1])
        return cost

    def get_optimal_paths(self, src, dst):
        '''
        Get the n-most optimal paths according to MAX_PATHS
        '''
        paths = self.get_paths(src, dst)
        paths_count = len(paths) if len(
            paths) &amp;amp;amp;amp;amp;amp;amp;amp;gt; MAX_PATHS else MAX_PATHS
        return sorted(paths, key=lambda x: self.get_path_cost(x))[0:(paths_count)]
```

Some key points:

* `self.bandwidth` contains a switch's interfaces bandwidth.
* `REFERENCE_BW` is the reference bandwidth constant used as in OSPF cost.
* `MAX_PATHS` is a constant set to limit number of paths used for routing.

### 3. The OpenFlow

So now we've got the basic algorithm and code for routing out of the way, let's head to focus on the elephant in the room. OpenFlow. What we've got to focus on is that OpenFlow works by having a SDN Controller (Ryu) setting up and controlling a network of OpenFlow switches.

There are two options, (i) have the controller make all the routing decisions, (ii) or teach the switches to make those decisions themselves, aka install OpenFlow rules to the switches. For a more performant network, certainly we would pick the second option, so the switch does not have to ask the controller what to do every time a packet arrives to the switch.

That is what we'll do, from the paths found in the previous step, we will install those paths to each switch.

#### install_path(self, src, first_port, dst, last_port, ip_src, ip_dst)
[This](https://github.com/wildan2711/multipath/blob/f8c9ce712593c0746409ae142b8ae861a17ea458/ryu_multipath.py#L122) is where the magic happens. What it basically does is:

1. List the paths available from source to destination.
2. Loop through all the switches that contain a path.
⋅⋅1. List all the ports in the switch that contains a path.</li>
⋅⋅If multiple ports in the switch contain a path, create a group table flow with type __select (OFPGT_SELECT), or else just install a normal flow. To create a group table, we create __*buckets*__, which means group of actions, where we must specify:
⋅⋅* bucket weight: the weight of the bucket (duh),
⋅⋅* watch port: the port to be watched (not needed for select group),
⋅⋅* watch group: other group tables to be watched (not needed),
⋅⋅* actions: your ordinary openflow action, i.e: output port.

#### Installing a Flow

A flow is defined as a set of *actions* to be applied on a *criteria* of a network packet. For example, it answers what should be done to a packet which has a source IP address 10.0.0.1 and destination IP address 10.0.0.2 (the criteria). We can either forward the packet or drop the packet (the action), or do other crazy things.
Flow criteria used in this [program](https://github.com/wildan2711/multipath/blob/f8c9ce712593c0746409ae142b8ae861a17ea458/ryu_multipath.py#L153):

```
match_ip = ofp_parser.OFPMatch(
        eth_type=0x0800,
        ipv4_src=ip_src,
        ipv4_dst=ip_dst
)
match_arp = ofp_parser.OFPMatch(
        eth_type=0x0806,
        arp_spa=ip_src,
        arp_tpa=ip_dst
)
```

Here we emulate a router, where we identify a packet by their destination IP *(ipv4_dst)*. Interesting to note that there is an extra field *eth_type*, which specifies the __*EtherType*__, where we can ask Wikipedia for the [codes](https://en.wikipedia.org/wiki/EtherType#Examples).

As you can see, marked clearly by the variable names, we will identify IP and ARP packets that arrives at the switch.

Why ARP? For L3 (IP Address) routing, we need to be able resolve the corresponding MAC address for an IP, which is important for host discovery in a topology. It literally is the first packet sent from a host if it wants to reach or communicate with another host in the network, by sending a broadcast packet, so it is essential we handle it correctly. Otherwise, bad things could happen, i.e: ARP packets flooding in a loop, which could cause a network to be unusable.

#### The Group Action

```python
    buckets = []
    for port, weight in out_ports:
        bucket_weight = int(round((1 - weight/sum_of_pw) * 10))
        bucket_action = [ofp_parser.OFPActionOutput(port)]
        buckets.append(
            ofp_parser.OFPBucket(
                weight=bucket_weight,
                watch_port=port,
                watch_group=ofp.OFPG_ANY,
                actions=bucket_action
            )
        )

    if group_new:
        req = ofp_parser.OFPGroupMod(
            dp, ofp.OFPGC_ADD, ofp.OFPGT_SELECT, group_id,
            buckets
        )
        dp.send_msg(req)
    else:
        req = ofp_parser.OFPGroupMod(
            dp, ofp.OFPGC_MODIFY, ofp.OFPGT_SELECT,
            group_id, buckets)
        dp.send_msg(req)
```

Above is the code for how we create a group table. As I have explained previously, we specify buckets, here which we insert multiple output actions for each port that contains a path to the group table.

![](https://wildanmsyah.files.wordpress.com/2018/01/topo.png)

Going back to the topology above, for a packet from `h2` to reach `h1`, it is first sent to `s4` where is has two available ports that contain a path. So we set output port 1 and 2 of `s4` as a bucket in the group table.

#### The bucket weight

For the bucket weight, I used a simple weight formula which utilizes the path cost/weight in the previous step:

![](https://wildanmsyah.files.wordpress.com/2017/12/capture.jpg)

Where for a path __*p*__:

* __*bw*__ is the bucket weight, __*0 ≤ bw(p) < 10*__
* __*pw*__ is the path weight/cost (uses OSPF cost in previous step),
* __*n*__ is the total number of paths available.

Basically, it finds the ratio of the path weight of __*p*__ with the total path weight of the available paths.

Why did I use this formula you ask?

To put it simply, when it comes to ___*path weight or cost*___ where ideally we want to use the shortest path first, then **lower is better**. While in the context of *buckets* in OpenFlow Group tables, the priority of choosing a bucket is with the __*highest bucket weight*__, hence __higher is better__.

By using that formula, we can expect that the *lower* the path weight, then the *higher* the bucket weight.

![](https://wildanmsyah.files.wordpress.com/2017/11/topo.png)

Looking back at our beloved topology, we can calculate the path weight for the two paths available, assuming every link/edge is assigned a weight of 1:


⋅⋅pw1 = (s4-s2) + (s2-s1) = 2

⋅⋅pw2  = (s4-s5) + (s5+s3) + (s3-s1) = 3

⋅⋅bw1 = (1 - 2/5) * 10 = 6

⋅⋅bw2 = (1 - 3/5) * 10 = 4

So as expected, the shorter path (lower pw), is assigned a higher bucket weight.

Probably, that is it.

All in all, that is how we installed the multipath.

One more thing...

#### `_packet_in_handler(self, ev)`

The Ryu API exposes event handlers using decorators, where we can listen for OpenFlow events, such as when a switch enters the network, or when a new link is connected, etc. [Here](https://github.com/wildan2711/multipath/blob/f8c9ce712593c0746409ae142b8ae861a17ea458/ryu_multipath.py#L250) we listen the `​ofp_event.EventOFPPacketIn` event, which handles whenever a packet arrives at the controller. We can try sniffing the packets by extracting it from the event object:

```python
msg = ev.msg
pkt = packet.Packet(msg.data)
print pkt
```

For most TCP/IP network traffic, you will see that the first packet sent from a host is an ARP packet, like explained previously. That is what we will be processing in this method. We can extract the ARP packet headers like this:

```python
arp_pkt = pkt.get_protocol(arp.arp)
```

Ryu has [an extensive packet library](http://ryu.readthedocs.io/en/latest/library_packet_ref.html#protocol-header-classes) that we can use to process packets. Pretty cool if you ask me.

```python
        if src not in self.hosts:
            self.hosts[src] = (dpid, in_port)

        out_port = ofproto.OFPP_FLOOD

        if arp_pkt:
            src_ip = arp_pkt.src_ip
            dst_ip = arp_pkt.dst_ip
            if arp_pkt.opcode == arp.ARP_REPLY:
                self.arp_table[src_ip] = src
                h1 = self.hosts[src]
                h2 = self.hosts[dst]
                out_port = self.install_paths(h1[0], h1[1], h2[0], h2[1], src_ip, dst_ip)
                self.install_paths(h2[0], h2[1], h1[0], h1[1], dst_ip, src_ip) # reverse
            elif arp_pkt.opcode == arp.ARP_REQUEST:
                if dst_ip in self.arp_table:
                    self.arp_table[src_ip] = src
                    dst_mac = self.arp_table[dst_ip]
                    h1 = self.hosts[src]
                    h2 = self.hosts[dst_mac]
                    out_port = self.install_paths(h1[0], h1[1], h2[0], h2[1], src_ip, dst_ip)
                    self.install_paths(h2[0], h2[1], h1[0], h1[1], dst_ip, src_ip) # reverse
```

Next, we process the packet as above. First we maintain a host map in the topology as `self.hosts` ,  that maps the host MAC address to its connecting switch (identified by `dpid` or datapath ID in OpenFlow) and the port number it is connected on the switch.

We initialize `out_port`, guessing by the name, it is where we specify the output port, which port the switch will forward the packet to. As a fallback, we set it as `ofproto.OFPP_FLOOD` which means we flood all ports of the switch.

Now the `arp_pkt`. We can extract the source and destination IP address of the packet, and the ARP opcode.  From the opcode, we can differentiate if the packet is an ARP reply packet or an ARP request. First we check if it is ARP reply, which means a host replied the ARP broadcast. We also maintain an ARP table to map IP addresses to its corresponding MAC addresses as `self.arp_table`. So whenever ARP reply is received, we save its source to the ARP table.

From that, we can be sure the destination host exists and a path(s) are available, thus we can install a path to the switches.

Happily ever after. The end.

...

In theory that is how [this code](https://github.com/wildan2711/multipath/blob/master/ryu_multipath.py) works.

Stay tuned, next article I will show how to test out the code and be sure the multipath works.

Thank you, and I hope you find your way in OpenFlow networks.
