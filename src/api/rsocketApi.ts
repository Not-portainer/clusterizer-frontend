import {
    RSocketClient,
    JsonSerializers,
    encodeCompositeMetadata,
    encodeRoute,
    MESSAGE_RSOCKET_ROUTING,
} from "rsocket-core";
import RSocketWebSocketClient from "rsocket-websocket-client";
import { Flowable } from "rsocket-flowable";

const rsocketClient = new RSocketClient({
    serializers: JsonSerializers,
    setup: {
        keepAlive: 60000,
        lifetime: 180000,
        dataMimeType: "application/json",
        metadataMimeType: "message/x.rsocket.composite-metadata.v0",
    },
    transport: new RSocketWebSocketClient({
        url: "ws://localhost:8080/rsocket",
    }),
});

const connectionPromise: Promise<any> = new Promise((resolve, reject) => {
    rsocketClient.connect().subscribe({
        onComplete: (s: any) => {
            resolve(s);
        },
        onError: (error: any) => reject(error),
        onSubscribe: (cancel: any) => {
            console.log("Подписка на соединение:", cancel);
        },
    });
});

function createRoutingMetadata(route: string): Uint8Array {
    return encodeCompositeMetadata([[MESSAGE_RSOCKET_ROUTING, encodeRoute(route)]]);
}

function requestStream<T>(route: string, data: any): Flowable<T> {
    const metadata = createRoutingMetadata(route);
    return new Flowable<T>((subscriber) => {
        connectionPromise.then((socket) => {
            socket
                .requestStream({
                    data,
                    metadata,
                })
                .subscribe({
                    onSubscribe: (subscription: any) => {
                        subscription.request(Number.MAX_SAFE_INTEGER);
                    },
                    onNext: (payload: any) => subscriber.onNext(payload.data),
                    onError: (error: any) => subscriber.onError(error),
                    onComplete: () => subscriber.onComplete(),
                });
        });
    });
}

export function pullImage(configId: string, request: any): Flowable<any> {
    const route = `docker.image.${configId}.pullImage`;
    return requestStream(route, request);
}

export function events(configId: string): Flowable<any> {
    const route = `docker.client.${configId}.events`;
    return requestStream(route, null);
}

export function logContainer(
    configId: string,
    request: { id: string; follow: boolean; tail?: number }
): Flowable<any> {
    const route = `docker.client.${configId}.logContainer`;
    return requestStream(route, request);
}
