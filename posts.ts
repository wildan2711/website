export const posts = [
    {
        id: '0x99',
        title:
            'Multipath Routing with Load Balancing using RYU OpenFlow Controller',
        created: '2018-01-13T09:44:00+07:00',
        text: `
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

<!--more-->


### 1. Path Finding using DFS

As pointed out in [this site](http://eddmann.com/posts/depth-first-search-and-breadth-first-search-in-python/), the *Depth First Search (DFS)* path finding algorithm explores possible vertices in a graph by finding the deepest vertex in the graph first before it backtracks to find other possible vertices using a *stack*. This is a useful feature (uses a stack) of this algorithm, for multipath routing specifically, because we are able to tweak the algorithm to find <em>all </em>the possible paths between two vertices.

To put it into context, we are able find all the possible paths between two nodes (switches) in a network.

So for an example topology:

![](https://wildanmsyah.files.wordpress.com/2017/11/topo.png)

For h1 to reach h2, we can use the DFS algorithm to find two possible paths:

1. s1 - s2 - s4
2. 1 - s3 - s5 - s4

Let's see how that translates into code, here's a snippet of [my Github](https://github.com/wildan2711/multipath/blob/master/ryu_multipath.py):

\`\`\`python
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
\`\`\`

Some key points:

* \`src\`, \`dst\` is the routing target, which are switches (uses an integer OpenFlow dpid) connecting the hosts.
* \`self.adjacency\` holds the adjacency matrix of the network/graph.
* Returns a list of \`paths\`.

### 2. Path Cost Calculation

Because the DFS algorithm returns an unweighted list of paths, we need to be able to measure the cost of a path. Another use of the costs is for the bucket weights of the path (explained later). A simple approach that I used was:

1. Calculate the link cost [OSPF style](https://www.cisco.com/c/en/us/support/docs/ip/open-shortest-path-first-ospf/7039-1.html#t6).
2. Total the link costs of the links in the path.

\`\`\`python
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
\`\`\`

Some key points:

* \`self.bandwidth\` contains a switch's interfaces bandwidth.
* \`REFERENCE_BW\` is the reference bandwidth constant used as in OSPF cost.
* \`MAX_PATHS\` is a constant set to limit number of paths used for routing.

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

\`\`\`
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
\`\`\`

Here we emulate a router, where we identify a packet by their destination IP *(ipv4_dst)*. Interesting to note that there is an extra field *eth_type*, which specifies the __*EtherType*__, where we can ask Wikipedia for the [codes](https://en.wikipedia.org/wiki/EtherType#Examples).

As you can see, marked clearly by the variable names, we will identify IP and ARP packets that arrives at the switch.

Why ARP? For L3 (IP Address) routing, we need to be able resolve the corresponding MAC address for an IP, which is important for host discovery in a topology. It literally is the first packet sent from a host if it wants to reach or communicate with another host in the network, by sending a broadcast packet, so it is essential we handle it correctly. Otherwise, bad things could happen, i.e: ARP packets flooding in a loop, which could cause a network to be unusable.

#### The Group Action

\`\`\`python
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
\`\`\`

Above is the code for how we create a group table. As I have explained previously, we specify buckets, here which we insert multiple output actions for each port that contains a path to the group table.

![](https://wildanmsyah.files.wordpress.com/2018/01/topo.png)

Going back to the topology above, for a packet from \`h2\` to reach \`h1\`, it is first sent to \`s4\` where is has two available ports that contain a path. So we set output port 1 and 2 of \`s4\` as a bucket in the group table.

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

#### \`_packet_in_handler(self, ev)\`

The Ryu API exposes event handlers using decorators, where we can listen for OpenFlow events, such as when a switch enters the network, or when a new link is connected, etc. [Here](https://github.com/wildan2711/multipath/blob/f8c9ce712593c0746409ae142b8ae861a17ea458/ryu_multipath.py#L250) we listen the \`​ofp_event.EventOFPPacketIn\` event, which handles whenever a packet arrives at the controller. We can try sniffing the packets by extracting it from the event object:

\`\`\`python
msg = ev.msg
pkt = packet.Packet(msg.data)
print pkt
\`\`\`

For most TCP/IP network traffic, you will see that the first packet sent from a host is an ARP packet, like explained previously. That is what we will be processing in this method. We can extract the ARP packet headers like this:

\`\`\`python
arp_pkt = pkt.get_protocol(arp.arp)
\`\`\`

Ryu has [an extensive packet library](http://ryu.readthedocs.io/en/latest/library_packet_ref.html#protocol-header-classes) that we can use to process packets. Pretty cool if you ask me.

\`\`\`python
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
\`\`\`

Next, we process the packet as above. First we maintain a host map in the topology as \`self.hosts\` ,  that maps the host MAC address to its connecting switch (identified by \`dpid\` or datapath ID in OpenFlow) and the port number it is connected on the switch.

We initialize \`out_port\`, guessing by the name, it is where we specify the output port, which port the switch will forward the packet to. As a fallback, we set it as \`ofproto.OFPP_FLOOD\` which means we flood all ports of the switch.

Now the \`arp_pkt\`. We can extract the source and destination IP address of the packet, and the ARP opcode.  From the opcode, we can differentiate if the packet is an ARP reply packet or an ARP request. First we check if it is ARP reply, which means a host replied the ARP broadcast. We also maintain an ARP table to map IP addresses to its corresponding MAC addresses as \`self.arp_table\`. So whenever ARP reply is received, we save its source to the ARP table.

From that, we can be sure the destination host exists and a path(s) are available, thus we can install a path to the switches.

Happily ever after. The end.

...

In theory that is how [this code](https://github.com/wildan2711/multipath/blob/master/ryu_multipath.py) works.

Stay tuned, next article I will show how to test out the code and be sure the multipath works.

Thank you, and I hope you find your way in OpenFlow networks.
`
    },
    {
        id: '0x91',
        title: 'MQTT Android Client Tutorial',
        created: '2017-05-11T09:54:00+07:00',
        text: `
MQTT is one of the popular data communication or messaging protocols that are becoming widely used for machine-to-machine (M2M) communication, or the computer network trend that is popularly coined as "Internet of Things". MQTT (Message Queue Transport Telemetry) is a messaging protocol with a publish-subscribe pattern, one of the messaging protocol regarded as "light-weight", which is important for the Internet of Things architecture, because it heavily involves low-powered devices, such as sensor nodes, microcontrollers, and the like.

One of the many uses of the MQTT protocol is to send sensor data from embedded devices. Sometimes we want those data to be sent to our smartphones which could help us monitor some important things from afar, and that's what I'll be showing you here in this tutorial, specifically using the Android OS.

If you're too busy or too lazy to be reading this tutorial, you can get the full code in my [Github](https://github.com/wildan2711/mqtt-android-tutorial) page.

Software used in this tutorial, be sure to have them installed:
* Android Studio
* Python 2.7

Outline what I will be covering:

[1. Sorting out MQTT dependencies in Android Studio](#1-dependencies)

[2. Setting up a cloud MQTT broker in CloudMQTT](#2-setting-up-cloud-mqtt-broker-with-cloudmqtt)

[3. Setting up a basic MQTT client and service in Android](#3-setting-up-mqtt-client-and-service)

[4. Setting up a mock data publisher with Python](#4-setting-up-a-mock-data-publisher-with-python)

[5. Visualizing data with MPAndroidCharts library](#5-visualizing-data-with-mpandroidcharts-library)

<!--more-->

You may skip some steps if you think you know what you're doing. I've structured this tutorial as modular as possible so you can replace any of the steps with your own way.

### 1. Dependecies

First we need to sort out dependencies which are libraries needed to setup an MQTT client and service in an Android app. We will be using the Paho MQTT Client and Android Service provided by Eclipse.

According to official Paho Eclipse [Github](https://github.com/eclipse/paho.mqtt.android), we can install the library to our app using Maven, Gradle, or from source, but in this tutorial I will be using Gradle. So to sort out the dependency, simply add these lines to our \`build.gradle\` of our Android Studio project.
\`\`\`
repositories {
    maven {
        url "https://repo.eclipse.org/content/repositories/paho-snapshots/"
    }
}
\`\`\`
And in our \`build.gradle\` of our Android app.

\`\`\`
dependencies {
    compile 'org.eclipse.paho:org.eclipse.paho.client.mqttv3:1.1.0'
    compile 'org.eclipse.paho:org.eclipse.paho.android.service:1.1.1'
}
\`\`\`

A notification will come up about our Gradle configuration being changed, if so click \`Sync Now\`. Oh, and please to have your internet on in this process or the Gradle sync will fail.

Well that's it, eventually Gradle will converge our Android app with the Paho MQTT Client and Android Service libraries.

### 2. Setting up cloud MQTT broker with CloudMQTT

There are a couple of cloud MQTT brokers that are available in the internet right now, like CloudMQTT and HiveMQ, but in this tutorial, I will teach how to set up a free private cloud MQTT broker using CloudMQTT. You can sign up for a free account at [https://customer.cloudmqtt.com/login](https://customer.cloudmqtt.com/login), just follow the instructions to sign up.

![cloudmqtt](https://wildanmsyah.files.wordpress.com/2017/03/cloudmqtt.jpg)

Next, you will be redirected to the CloudMQTT instances page. Click the + Create button to create a new CloudMQTT instance. Now you would be in the Create new CloudMQTT instance page. Insert an instance name, choose any Data center available, and make sure for the "Plan" choose the "Cute Cat", because we like free stuff.

![instance](https://wildanmsyah.files.wordpress.com/2017/03/instance.jpg)

In the next page, you can see your new created instance, click the details button of that instance. This is what you will see, (never mind the red scribbles):

![account](https://wildanmsyah.files.wordpress.com/2017/03/account.jpg)

Done! We have our own private cloud MQTT broker. Later we will use those credentials to connect our MQTT Android client to the broker.

### 3. Setting up MQTT Client and Service

Before we code anything, we need to set up our \`AndroidManifest.xml\` file to let our app have permissions to access the Internet, access the network state, and let our app to stay alive as a service. Add these lines before the opening \`<application\` tag in our \`AndroidManifest.xml\`.

\`\`\`
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE"/>
<uses-permission android:name="android.permission.WAKE_LOCK"/>
\`\`\`

And register our MQTT Android Service in our app before the closing \`application\` tag using this piece of code:

\`\`\`
<service android:name="org.eclipse.paho.android.service.MqttService" />
\`\`\`

So it should look like this: 

![manifest](https://wildanmsyah.files.wordpress.com/2017/05/manifest1.jpg) 

Ok great, now lets begin to code shall we.

So first, lets create a new package called \`helpers\` in our app, which will contain our MQTT helper class. Then create a new Java Class inside that package called \`MQTTHelper\`.

Add the following code inside our MqttHelper class, please adjust the credentials (serverUri, username, password) accordingly with your CloudMQTT instance from the previous step. Please note: the format of the server URI is tcp://server:port

\`\`\`java
public class MqttHelper {
    public MqttAndroidClient mqttAndroidClient;

    final String serverUri = "tcp://m12.cloudmqtt.com:11111";

    final String clientId = "ExampleAndroidClient";
    final String subscriptionTopic = "sensor/+";

    final String username = "xxxxxxx";
    final String password = "yyyyyyyyyy";

    public MqttHelper(Context context){
        mqttAndroidClient = new MqttAndroidClient(context, serverUri, clientId);
        mqttAndroidClient.setCallback(new MqttCallbackExtended() {
            @Override
            public void connectComplete(boolean b, String s) {
                Log.w("mqtt", s);
            }

            @Override
            public void connectionLost(Throwable throwable) {

            }

            @Override
            public void messageArrived(String topic, MqttMessage mqttMessage) throws Exception {
                Log.w("Mqtt", mqttMessage.toString());
            }

            @Override
            public void deliveryComplete(IMqttDeliveryToken iMqttDeliveryToken) {

            }
        });
        connect();
    }

    public void setCallback(MqttCallbackExtended callback) {
        mqttAndroidClient.setCallback(callback);
    }

    private void connect(){
        MqttConnectOptions mqttConnectOptions = new MqttConnectOptions();
        mqttConnectOptions.setAutomaticReconnect(true);
        mqttConnectOptions.setCleanSession(false);
        mqttConnectOptions.setUserName(username);
        mqttConnectOptions.setPassword(password.toCharArray());

        try {

            mqttAndroidClient.connect(mqttConnectOptions, null, new IMqttActionListener() {
                @Override
                public void onSuccess(IMqttToken asyncActionToken) {

                    DisconnectedBufferOptions disconnectedBufferOptions = new DisconnectedBufferOptions();
                    disconnectedBufferOptions.setBufferEnabled(true);
                    disconnectedBufferOptions.setBufferSize(100);
                    disconnectedBufferOptions.setPersistBuffer(false);
                    disconnectedBufferOptions.setDeleteOldestMessages(false);
                    mqttAndroidClient.setBufferOpts(disconnectedBufferOptions);
                    subscribeToTopic();
                }

                @Override
                public void onFailure(IMqttToken asyncActionToken, Throwable exception) {
                    Log.w("Mqtt", "Failed to connect to: " + serverUri + exception.toString());
                }
            });


        } catch (MqttException ex){
            ex.printStackTrace();
        }
    }


    private void subscribeToTopic() {
        try {
            mqttAndroidClient.subscribe(subscriptionTopic, 0, null, new IMqttActionListener() {
                @Override
                public void onSuccess(IMqttToken asyncActionToken) {
                    Log.w("Mqtt","Subscribed!");
                }

                @Override
                public void onFailure(IMqttToken asyncActionToken, Throwable exception) {
                    Log.w("Mqtt", "Subscribed fail!");
                }
            });

        } catch (MqttException ex) {
            System.err.println("Exception whilst subscribing");
            ex.printStackTrace();
        }
    }
}
\`\`\`

Now go to our \`activity_main.xml\` or any other activity you may have created, and you may see the Hello World text view which is added by default by Android Studio, let's give it an ID so we can access it in our Java code, here I give it an ID \`dataReceived\`.

![id](https://wildanmsyah.files.wordpress.com/2017/05/id.jpg)

So our MainActivity java class should look like this, let Android Studio resolve the imports if needed.

\`\`\`java
public class MainActivity extends AppCompatActivity {
    MqttHelper mqttHelper;

    TextView dataReceived;

    @Override

    protected void onCreate(Bundle savedInstanceState) {
         super.onCreate(savedInstanceState);
         setContentView(R.layout.activity_main);

         dataReceived = (TextView) findViewById(R.id.dataReceived);

         startMqtt();
    }

    private void startMqtt(){
         mqttHelper = new MqttHelper(getApplicationContext());
         mqttHelper.setCallback(new MqttCallbackExtended() {
             @Override
             public void connectComplete(boolean b, String s) {

             }

             @Override
             public void connectionLost(Throwable throwable) {

             }

             @Override
             public void messageArrived(String topic, MqttMessage mqttMessage) throws Exception {
                 Log.w("Debug",mqttMessage.toString());
                 dataReceived.setText(mqttMessage.toString());
             }

             @Override
             public void deliveryComplete(IMqttDeliveryToken iMqttDeliveryToken) {

             }
         });
    }
}
\`\`\`
So what we do here is set the callback functions for the MQTT client, the only callback function we need right now is the messageArrived function which is called every time the MQTT client receives a message. Whenever a message is received, it will set the text of our TextView in our activity according to the message received.

Now let's try to send some data to our app.

Go back to your CloudMQTT instance and open the Websocket UI. In the topic input, enter the topic set in our app, in my case is "sensor/+". If you have done your research about MQTT, you may recall that the "+" sign is a wildcard which simply means "any subtopic". So let's try sending data with the "sensor/temp" topic.

![send](https://wildanmsyah.files.wordpress.com/2017/05/send.jpg)

And in our app:

![](https://wildanmsyah.files.wordpress.com/2017/05/screenshot_2017-05-11-05-35-49-859_com-frost-mqtttutorial.png)

Magic! It's like our computer and phones are telepathic right now!

Well, so far, our Android Project structure will look like this:

![structure](https://wildanmsyah.files.wordpress.com/2017/05/structure.jpg)

### 4. Setting up a mock data publisher with python

So now since we can be sure that our Android App can communicate using the MQTT Protocol, we can use any device with any programming language to communicate our app with the MQTT Protocol, be it your own web server, your Arduino temperature monitoring device, or even your very own smart underwear! All you need is an MQTT broker, which we have covered in step 2.

Here I will show you an example of that case, by making a mock data publisher using python 2.7.

First you will need to install the paho.mqtt client library in python.

\`\`\`
pip install paho-mqtt
\`\`\`

And the code:

\`\`\`python
import json
import paho.mqtt.client as mqtt
import random
import time
import threading
import sys

mqttc = mqtt.Client("client1", clean_session=False)
mqttc.username_pw_set("#User", "#password")
mqttc.connect("#Server", #port, 60)


def pub():
    mqttc.publish("sensor/temp", payload=random.normalvariate(30, 0.5), qos=0)
    threading.Timer(1, pub).start()

pub()
\`\`\`

Please change the credentials accordingly with your CloudMQTT Instance (the hash tagged words). This piece of code will periodically (every 1 second) publish a random number somewhere around 30.

After running the above python code, you will see that your app will show a different number every second, which means the code works.

### 5. Visualizing data with MPAndroidCharts library

Usually for sensor data monitoring, just showing the raw data may look ugly, like your sister HAH (sorry bad joke), and that is why it may be a good idea to visualize our data using charts. Here I will use one of the most popular chart libraries available for Android, when I mean popular, I mean "the first search result on Google" popular. Try googling "android chart", and you will find [MPAndroidChart](https://github.com/PhilJay/MPAndroidChart) as the first result (not the ads, psst).

First things first, dependencies dependencies...

In our project's \`build.gradle\` below the previous MQTT dependency, add 

\`\`\`
maven { url "https://jitpack.io" }
\`\`\`

So now it should look like:

\`\`\`
maven {
    url "https://repo.eclipse.org/content/repositories/paho-snapshots/"
}
maven { url "https://jitpack.io" }
\`\`\`

and our app's \`build.gradle\` add it below our MQTT dependency too:

\`\`\`
compile 'com.github.PhilJay:MPAndroidChart:v3.0.2'
\`\`\`

so now it should look like:

\`\`\`
compile 'org.eclipse.paho:org.eclipse.paho.client.mqttv3:1.1.0'
compile 'org.eclipse.paho:org.eclipse.paho.android.service:1.1.1'
compile 'com.github.PhilJay:MPAndroidChart:v3.0.2'
\`\`\`

Okay gradle, \`Sync Now!!\`

Now add a new Java Class in our \`helpers\` package named \`ChartHelper\`​, with the following code inside:

\`\`\`java
public class ChartHelper implements OnChartValueSelectedListener {

    private LineChart mChart;

    public ChartHelper(LineChart chart) {
        mChart = chart;
        mChart.setOnChartValueSelectedListener(this);

        // no description text
        mChart.setNoDataText("You need to provide data for the chart.");

        // enable touch gestures
        mChart.setTouchEnabled(true);

        // enable scaling and dragging
        mChart.setDragEnabled(true);
        mChart.setScaleEnabled(true);
        mChart.setDrawGridBackground(false);

        // if disabled, scaling can be done on x- and y-axis separately
        mChart.setPinchZoom(true);

        // set an alternative background color
        mChart.setBackgroundColor(Color.WHITE);
        mChart.setBorderColor(Color.rgb(67,164,34));


        LineData data = new LineData();
        data.setValueTextColor(Color.WHITE);

        // add empty data
        mChart.setData(data);

        // get the legend (only possible after setting data)
        Legend l = mChart.getLegend();

        // modify the legend ...
        // l.setPosition(LegendPosition.LEFT_OF_CHART);
        l.setForm(Legend.LegendForm.LINE);
        l.setTypeface(Typeface.MONOSPACE);
        l.setTextColor(Color.rgb(67, 164, 34));

        XAxis xl = mChart.getXAxis();
        xl.setTypeface(Typeface.MONOSPACE);
        xl.setTextColor(Color.rgb(67, 164, 34));
        xl.setDrawGridLines(false);
        xl.setAvoidFirstLastClipping(true);
        xl.setEnabled(true);

        YAxis leftAxis = mChart.getAxisLeft();
        leftAxis.setTypeface(Typeface.MONOSPACE);
        leftAxis.setTextColor(Color.rgb(67, 164, 34));

        leftAxis.setDrawGridLines(true);

        YAxis rightAxis = mChart.getAxisRight();
        rightAxis.setEnabled(false);

    }

    public void setChart(LineChart chart){ this.mChart = chart; }

    public void addEntry(float value) {

        LineData data = mChart.getData();

        if (data != null){

            ILineDataSet set = data.getDataSetByIndex(0);
            // set.addEntry(...); // can be called as well

            if (set == null) {
                set = createSet();
                data.addDataSet(set);
            }

            data.addEntry(new Entry(set.getEntryCount(),value),0);
            Log.w("chart", set.getEntryForIndex(set.getEntryCount()-1).toString());

            data.notifyDataChanged();

            // let the chart know it's data has changed
            mChart.notifyDataSetChanged();

            // limit the number of visible entries
            mChart.setVisibleXRangeMaximum(10);
            // mChart.setVisibleYRange(30, AxisDependency.LEFT);

            // move to the latest entry
            mChart.moveViewTo(set.getEntryCount()-1, data.getYMax(), YAxis.AxisDependency.LEFT);

            // this automatically refreshes the chart (calls invalidate())
            // mChart.moveViewTo(data.getXValCount()-7, 55f,
            // AxisDependency.LEFT);
        }
    }

    private LineDataSet createSet() {
        LineDataSet set = new LineDataSet(null, "Data");
        set.setAxisDependency(YAxis.AxisDependency.LEFT);
        set.setColor(Color.rgb(67, 164, 34));
        //set.setCircleColor(Color.WHITE);
        set.setLineWidth(2f);
        //set.setCircleRadius(4f);
        set.setFillAlpha(65);
        set.setFillColor(Color.rgb(67, 164, 34));
        set.setHighLightColor(Color.rgb(67, 164, 34));
        set.setValueTextColor(Color.rgb(67, 164, 34));
        set.setValueTextSize(9f);
        set.setDrawValues(false);
        return set;
    }

    @Override
    public void onValueSelected(Entry e, Highlight h) {
        Log.i("Entry selected", e.toString());
    }

    @Override
    public void onNothingSelected(){
        Log.i("Nothing selected", "Nothing selected.");
    }

}
\`\`\`

Ok so let Android Studio resolve the imports for you.

Now add the chart layout to our \`activity_main.xml\`, by using the text editor. Add the below code under our \`<TextView\` layout:

\`\`\`xml
<com.github.mikephil.charting.charts.LineChart
        android:id="@+id/chart"
        android:layout_width="match_parent"
        android:layout_height="match_parent"/>
\`\`\`\

Go back to the Design editor, and rearrange the layouts accordingly (or maybe any other way you want).

![layout](https://wildanmsyah.files.wordpress.com/2017/05/layout.jpg)

So as we can see, our chart is a Line Chart with an ID \`chart\`​, which we'll reference in our Java code. Okay, so we want this chart to update in real time when ever a new data arrives from our MQTT Publisher.

Now let's modify our \`MainActivity.java\`, first import our \`ChartHelper\`:

\`\`\`java
import helpers.ChartHelper;
\`\`\`

and declare a \`ChartHelper\` and \`LineChart\` object below our \`MqttHelper\` object declaration.

\`\`\`java
ChartHelper mChart;
LineChart chart;
\`\`\`

Below our \`dataReceived\` initialization in the \`onCreate\` function, initialize our \`chart\`​ and our \`ChartHelper\`​

\`\`\`java
chart = (LineChart) findViewById(R.id.chart);
mChart = new ChartHelper(chart);
\`\`\`

And in our Mqtt callback, add the below line in our \`messageArrived\` function:

\`\`\`java
mChart.addEntry(Float.valueOf(mqttMessage.toString()));
\`\`\`

So all in all, our code will look like this:

\`\`\`java
import helpers.ChartHelper;
import helpers.MqttHelper;

public class MainActivity extends AppCompatActivity {

    MqttHelper mqttHelper;
    ChartHelper mChart;
    LineChart chart;

    TextView dataReceived;

    @Override

    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        dataReceived = (TextView) findViewById(R.id.dataReceived);
        chart = (LineChart) findViewById(R.id.chart);
        mChart = new ChartHelper(chart);

        startMqtt();
    }

    private void startMqtt(){
        mqttHelper = new MqttHelper(getApplicationContext());
        mqttHelper.mqttAndroidClient.setCallback(new MqttCallbackExtended() {
            @Override
            public void connectComplete(boolean b, String s) {
                Log.w("Debug","Connected");
            }

            @Override
            public void connectionLost(Throwable throwable) {

            }

            @Override
            public void messageArrived(String topic, MqttMessage mqttMessage) throws Exception {
                Log.w("Debug",mqttMessage.toString());
                dataReceived.setText(mqttMessage.toString());
                mChart.addEntry(Float.valueOf(mqttMessage.toString()));
            }

            @Override
            public void deliveryComplete(IMqttDeliveryToken iMqttDeliveryToken) {

            }
        });
    }
}
\`\`\`

Now run our app.

![](https://wildanmsyah.files.wordpress.com/2017/05/screenshot_2017-05-11-09-33-31-128_com-frost-mqtttutorial.png)

Holy crap it moves! Feel like a magician now?

Thank you, you've reached the end! If you had a wonderful time finishing this tutorial, please await for more tutorials from me.

https://github.com/wildan2711/mqtt-android-tutorial

`
    }
];
