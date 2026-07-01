import http from "k6/http";
import ws from "k6/ws";
import { check, sleep } from "k6";

export const options = {
    vus: 300,         
    duration: "1m",
};

const BASE_URL = "http://localhost:3000";
const WS_URL = "ws://localhost:3000/ws";

// Make sure these rooms already exist
const ROOMS = [1,2,3,4,5,6,7,8,9,10];

export default function () {

    const id = `${__VU}-${__ITER}`;

    const email = `user${id}@test.com`;
    const username = `user${id}`;
    const password = "password123";

    const roomId = ROOMS[(__VU - 1) % ROOMS.length];

    // ---------------- REGISTER ----------------

    let res = http.post(
        `${BASE_URL}/register`,
        JSON.stringify({
            email,
            username,
            password,
        }),
        {
            headers: {
                "Content-Type": "application/json",
            },
        }
    );

    const registerOk = check(res, {
        "register": (r) =>
            r &&
            (r.status === 201 || r.status === 409),
    });

    if (!registerOk) {
        console.log(`Register failed for ${email}`);
        return;
    }

    // ---------------- LOGIN ----------------

    res = http.post(
        `${BASE_URL}/login`,
        JSON.stringify({
            email,
            password,
        }),
        {
            headers: {
                "Content-Type": "application/json",
            },
        }
    );

    const loginOk = check(res, {
        "login": (r) => r && r.status === 201,
    });

    if (!loginOk) {
        console.log(`Login failed for ${email}`);
        return;
    }

    let token;

    try {
        token = res.json("accestoken");
    } catch (e) {
        console.log(`Unable to parse token for ${email}`);
        return;
    }

    if (!token) {
        console.log(`No token returned`);
        return;
    }

    // ---------------- WEBSOCKET ----------------

    const response = ws.connect(
        `${WS_URL}?token=${token}`,
        {},
        function (socket) {

            socket.on("open", function () {

                socket.send(JSON.stringify({
                    type: "join_room",
                    roomid: roomId,
                }));

                socket.setInterval(function () {

                    socket.send(JSON.stringify({
                        type: "send_message",
                        roomid: roomId,
                        content: `Hello from ${username}`,
                    }));

                },1000);

            });

            socket.on("message", function (msg) {

          
            });

            socket.on("error", function (err) {

                console.log("WS ERROR:", err);

            });

            socket.on("close", function () {

           

            });

            socket.setTimeout(function () {

                socket.close();

            },30000);

        }
    );

    check(response,{
        "ws connected":(r)=>r && r.status===101,
    });

    sleep(1);
}