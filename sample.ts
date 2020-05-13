
import { ServiceBusClient, delay, Sender, TopicClient, ReceiveMode, OnMessage, OnError } from "@azure/service-bus";

const connString1 = "<conn-string-1>";
const connString2 = "<conn-string-2>";
const queueName = "queue-name";
const topicName = "topic-name";
// const subscriptionName = "subscription-name";

function pickConnString(namespace: "namespace-1" | "namespace-2") {
    if (namespace === "namespace-1") return connString1;
    else return connString2;
}

async function sendMessages() {
    let namespace: "namespace-1" | "namespace-2" = "namespace-1";
    let sbClient: ServiceBusClient;
    let topicClient: TopicClient;
    let sender: Sender;
    while (true) {
        try {
            sbClient = ServiceBusClient.createFromConnectionString(pickConnString(namespace));
            topicClient = sbClient.createTopicClient(topicName);
            sender = topicClient.createSender();
            let index = 0;
            while (true) {
                index++;
                await delay(1000);
                await sender.send({ body: `message ${index}` });
                console.log(`Sent message ${index} to ${topicName} of ${namespace}`);
            }
        } catch (error) {
            await sender.close();
            await topicClient.close();
            await sbClient.close();
            console.log(`${namespace} threw an error ${error}, switching to the other namespace`);
            namespace === "namespace-1" ? namespace = "namespace-2" : namespace = "namespace-1";
        }
    }
}

async function receiveMessages(namespace: "namespace-1" | "namespace-2") {
    const sbClient = ServiceBusClient.createFromConnectionString(pickConnString(namespace));
    const receiver = sbClient.createQueueClient(queueName
    ).createReceiver(ReceiveMode.peekLock);
    const onMessageHandler: OnMessage = async (brokeredMessage) => {
        console.log(`Received message from ${namespace}: `, brokeredMessage.body);
        await delay(3000);
        await brokeredMessage.complete();
        console.log("Completed message: ", brokeredMessage.body);
    };

    const onErrorHandler: OnError = (err) => {
        console.log("Error thrown by user's OnError handler", err);
        throw err;
    };

    receiver.registerMessageHandler(onMessageHandler, onErrorHandler, {
        autoComplete: false,
        maxMessageAutoRenewLockDurationInSeconds: 3600
    });
    await delay(1000000000);
}

async function main() {
    const sending = sendMessages();
    const receivingFrom1 = receiveMessages("namespace-1");
    const receivingFrom2 = receiveMessages("namespace-2");
    [await sending, await receivingFrom1, await receivingFrom2];
}

main().catch((err) => {
    console.log("Error occurred: ", err);
});