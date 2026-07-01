# Why I Built This

The reason I am building this project is to learn how WebSockets actually work under the hood and understand how a real-time chat system is designed.
# First
- The first goal was to create a WebSocket on both the client and server side.
- Connect the client to the server and respond back.
- Connect multiple browsers so that a message is broadcast to every browser connected to the WebSocket.
These were the easy bits and helped me understand the basic flow.
 # Second
 - Crating a room is done
 - First thoght was storing array of object containing roomid and User[list of sockets]
- Using array here is really bad practice we obviously dont want duplicates her so useing a set is so obvious here still at v1 i  did used the array then i also found why it more bad because of the nested loops 0(n^2) using set will make sure add and delting becomes fater due less timecomplexities as per my understanding sets are fast 
# Third
I then introduced two `Map`s.
- One goes from **Room ID → Set<WebSocket>**
- The other goes from **WebSocket → Set<Room ID>**

The first map makes broadcasting messages to everyone inside a room much easier.

The second map helps during cleanup. When a socket disconnects, I can immediately know every room it belongs to and remove it without searching through every room.

# Forth
-Implementedd leave fuction which cuts connection from server side  while leaving also implemented a function it removes ther user from other room before ccreating and leaving and also if connection dissconectes from the client ide 
# Fifth 
till here i solved evry problem there are still some place  where i can add to check more things but real bottlneck is 
When i broadcast it loops throgh every socket present in the room and as per my understanding about websockets we cannot share in-memory room state across horizontally scaled servers
which are in two diff server we cannot keep them in one room here coomes something called Pub-sub instance  its nothing but traffic is spread between servers and server are all connnect to a pub sub server  

The next step was moving the application from purely in-memory storage to persistent storage
I added PostgreSQL so messages are no longer lost after restarting the server.
The  schema I came up with was:
![Design](./image12.png)
Adding PostgreSQL solved message persistence.
 
 and one more thing is add the pub sub and understood more intuitively like pub sub is basically a broker  has which has  connection with all the server instance it uusuallly has two connection on publlishing the events and another to subscribing the events but we still have to main two Maps for sending /broadcasting the msgs



Load Testing
I tested te app using k6 with concurrent users performing the full application flow:
-Register
-Login
-Authenticate via JWT
-Establish a WebSocket connection or upgrding the protocol
-Join a chat room
-Exchange chat messages
Results

Users	Result
100	    Stable
200	    Stable
300	    Registration failures (~19%) and increased latency

The system reliably handled 200 concurrent users executing the complete workflow. At 300 concurrent users, registration became the primary bottleneck while login and WebSocket communication continued to succeed for users who completed registration


During load testing, CPU utilization reached approximately 98%. Likely contributors include password hashing, database operations, Redis messaging, JSON serialization, and broadcasting messages to connected clients. taking alot of memory probably like 200 sockets i think this afe spot to leave this project main goal was to design a system which can be scallable but i dont know how much i acheivedit in this but i can say with surety that it is implemented the basic building blocks required for horizontal scaling    
i have implemnete presistance  of the mssseges and for scalling purpose i have added redis pub sub model which was off the reson to start this basic project at the first place 
and also learnt about handling the http to ws upgradition myself also got to know that express cant handle the upgrade it self 


what i could improve 
- i wanna fix the the structure of the json msg i was sending 
- i could more close to production close by polishing adding more try/catch but the goal for me here is completed 