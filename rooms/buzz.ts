import { Room, Client } from "colyseus";
import { Schema, type, MapSchema } from "@colyseus/schema";

export class Player extends Schema {
    @type("string")
    name = "";

    @type("number")
    buzzerWinner = 0;
}

export class State extends Schema {
    @type({ map: Player })
    players = new MapSchema<Player>();
    
    @type("string")
    winnerId = "";

    something = "This attribute won't be sent to the client-side";

    createPlayer (id: string, name: string) {
        var p = new Player();
        p.name = name;

        this.players[ id ] = p;
    }

    removePlayer (id: string) {
        delete this.players[ id ];
    }

    buzz (id: string) {
        console.log("buzz");
        if (!this.winnerId) {
            this.players[ id ].buzzerWinner = 1;
            this.winnerId = id;
        }
    }

    reset () {
        console.log("reset");
        if (this.winnerId) {
            this.players[ this.winnerId ].buzzerWinner = 0;
            this.winnerId = "";
        }
    }

}

export class BuzzRoom extends Room<State> {
    maxClients = 4;

    onCreate (options) {
        console.log("BuzzRoom created!", options);
        if (options.roomCode != "") {
            console.log("onCreate: "+this.roomId);
            this.roomId = options.roomCode;
        }

        this.setState(new State());      
    }

    onAuth(client, options, req) {
        console.log(req.headers.cookie);
        return true;
    }

    onJoin (client: Client, options: any) {
        if (options.roomCode != "") {
            console.log("onjoin: "+this.roomId);
            this.roomId = options.roomCode;
        }
        this.state.createPlayer(client.sessionId, options.name);
    }

    onLeave (client) {
        console.log("onLeave: "+client.sessionId);
        this.state.reset();
        this.state.removePlayer(client.sessionId);
    }

    onMessage (client, data) {
        console.log("BuzzRoom received message from", client.sessionId, ":", data);
        if (data.buzz) {
            this.state.buzz(client.sessionId);
        } else if (data.reset) {
            this.state.reset();
        }      
    }

    onDispose () {
        console.log("Dispose BuzzRoom");
    }

}
