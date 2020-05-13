# sb-user-issue-8437
Github issue - https://github.com/Azure/azure-sdk-for-js/issues/8437

Prerequisites
1. Create 2 servicebus namespaces
2. Both with 
    - a queue "queue-name"
    - a topic "topic-name" 
    - a subscription for that topic "subscription-name" with auto-forward to "queue-name"
3. Populate the connection-string values in `sample.ts`(from https://github.com/HarshaNalluru/sb-user-issue-8437/pull/1/files), update the entity names if you picked different names.

Running the sample
1. Install `@azure/service-bus@1.1.5`
2. Run `ts-node sample.ts`

Steps to repro the user-issue
1. By default, the sample picks up namespace-1 to send messages to the topic
2. Delete the topic in namespace-1, this would make the code send messages to namespace-2
3. Both the receivers are active through out the time
4. Recreate topic in namespace-1 (and the subscription with auto-forwarding)
5. Delete the topic in namespace-2, this would make the code send messages to namespace-1 again
