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

According to official Paho Eclipse [Github](https://github.com/eclipse/paho.mqtt.android), we can install the library to our app using Maven, Gradle, or from source, but in this tutorial I will be using Gradle. So to sort out the dependency, simply add these lines to our `build.gradle` of our Android Studio project.
```
repositories {
    maven {
        url "https://repo.eclipse.org/content/repositories/paho-snapshots/"
    }
}
```
And in our `build.gradle` of our Android app.

```
dependencies {
    compile 'org.eclipse.paho:org.eclipse.paho.client.mqttv3:1.1.0'
    compile 'org.eclipse.paho:org.eclipse.paho.android.service:1.1.1'
}
```

A notification will come up about our Gradle configuration being changed, if so click `Sync Now`. Oh, and please to have your internet on in this process or the Gradle sync will fail.

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

Before we code anything, we need to set up our `AndroidManifest.xml` file to let our app have permissions to access the Internet, access the network state, and let our app to stay alive as a service. Add these lines before the opening `<application` tag in our `AndroidManifest.xml`.

```
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE"/>
<uses-permission android:name="android.permission.WAKE_LOCK"/>
```

And register our MQTT Android Service in our app before the closing `application` tag using this piece of code:

```
<service android:name="org.eclipse.paho.android.service.MqttService" />
```

So it should look like this: 

![manifest](https://wildanmsyah.files.wordpress.com/2017/05/manifest1.jpg) 

Ok great, now lets begin to code shall we.

So first, lets create a new package called `helpers` in our app, which will contain our MQTT helper class. Then create a new Java Class inside that package called `MQTTHelper`.

Add the following code inside our MqttHelper class, please adjust the credentials (serverUri, username, password) accordingly with your CloudMQTT instance from the previous step. Please note: the format of the server URI is tcp://server:port

```java
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
```

Now go to our `activity_main.xml` or any other activity you may have created, and you may see the Hello World text view which is added by default by Android Studio, let's give it an ID so we can access it in our Java code, here I give it an ID `dataReceived`.

![id](https://wildanmsyah.files.wordpress.com/2017/05/id.jpg)

So our MainActivity java class should look like this, let Android Studio resolve the imports if needed.

```java
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
```
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

```
pip install paho-mqtt
```

And the code:

```python
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
```

Please change the credentials accordingly with your CloudMQTT Instance (the hash tagged words). This piece of code will periodically (every 1 second) publish a random number somewhere around 30.

After running the above python code, you will see that your app will show a different number every second, which means the code works.

### 5. Visualizing data with MPAndroidCharts library

Usually for sensor data monitoring, just showing the raw data may look ugly, like your sister HAH (sorry bad joke), and that is why it may be a good idea to visualize our data using charts. Here I will use one of the most popular chart libraries available for Android, when I mean popular, I mean "the first search result on Google" popular. Try googling "android chart", and you will find [MPAndroidChart](https://github.com/PhilJay/MPAndroidChart) as the first result (not the ads, psst).

First things first, dependencies dependencies...

In our project's `build.gradle` below the previous MQTT dependency, add 

```
maven { url "https://jitpack.io" }
```

So now it should look like:

```
maven {
    url "https://repo.eclipse.org/content/repositories/paho-snapshots/"
}
maven { url "https://jitpack.io" }
```

and our app's `build.gradle` add it below our MQTT dependency too:

```
compile 'com.github.PhilJay:MPAndroidChart:v3.0.2'
```

so now it should look like:

```
compile 'org.eclipse.paho:org.eclipse.paho.client.mqttv3:1.1.0'
compile 'org.eclipse.paho:org.eclipse.paho.android.service:1.1.1'
compile 'com.github.PhilJay:MPAndroidChart:v3.0.2'
```

Okay gradle, `Sync Now!!`

Now add a new Java Class in our `helpers` package named `ChartHelper`​, with the following code inside:

```java
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
```

Ok so let Android Studio resolve the imports for you.

Now add the chart layout to our `activity_main.xml`, by using the text editor. Add the below code under our `<TextView` layout:

```xml
<com.github.mikephil.charting.charts.LineChart
        android:id="@+id/chart"
        android:layout_width="match_parent"
        android:layout_height="match_parent"/>
```\

Go back to the Design editor, and rearrange the layouts accordingly (or maybe any other way you want).

![layout](https://wildanmsyah.files.wordpress.com/2017/05/layout.jpg)

So as we can see, our chart is a Line Chart with an ID `chart`​, which we'll reference in our Java code. Okay, so we want this chart to update in real time when ever a new data arrives from our MQTT Publisher.

Now let's modify our `MainActivity.java`, first import our `ChartHelper`:

```java
import helpers.ChartHelper;
```

and declare a `ChartHelper` and `LineChart` object below our `MqttHelper` object declaration.

```java
ChartHelper mChart;
LineChart chart;
```

Below our `dataReceived` initialization in the `onCreate` function, initialize our `chart`​ and our `ChartHelper`​

```java
chart = (LineChart) findViewById(R.id.chart);
mChart = new ChartHelper(chart);
```

And in our Mqtt callback, add the below line in our `messageArrived` function:

```java
mChart.addEntry(Float.valueOf(mqttMessage.toString()));
```

So all in all, our code will look like this:

```java
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
```

Now run our app.

![](https://wildanmsyah.files.wordpress.com/2017/05/screenshot_2017-05-11-09-33-31-128_com-frost-mqtttutorial.png)

Holy crap it moves! Feel like a magician now?

Thank you, you've reached the end! If you had a wonderful time finishing this tutorial, please await for more tutorials from me.

https://github.com/wildan2711/mqtt-android-tutorial

