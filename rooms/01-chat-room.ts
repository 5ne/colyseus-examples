import { Room } from "colyseus";

export class ChatRoom extends Room {
    // this room supports only 4 clients connected
    maxClients = 4;

    onCreate (options) {
        console.log("BasicRoom created yo!", options);
    }

    onJoin (client) {
        this.broadcast(`${ client.sessionId } joined yo.`);
    }

    onLeave (client) {
        this.broadcast(`${ client.sessionId } left yo.`);
    }

    onMessage (client, data) {
        console.log("BasicRoom received message from", client.sessionId, ":", data);
        this.broadcast(`(${ client.sessionId }) ${ data.message }`);
    }

    onDispose () {
        console.log("Dispose BasicRoom");
    }

}
