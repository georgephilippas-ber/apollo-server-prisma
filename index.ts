import {berlinServer} from "./berlin-server";

berlinServer().then(value => value.getExpress().get("/", (req, res) => res.sendFile(__dirname + "/depot/berlin/stefan-widua-iPOZf3tQfHA-unsplash.jpg")));
