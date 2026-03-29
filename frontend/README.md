the reason I am Building This is to implement Websockets learning
 
 # ```First
 - The first goal was to create a websocket at client and server side
 -  connecting the client  to server and resonding
 - connectoing multiple browser meanr msg is broadcasted to every browser connected to the ws (Easy bits)
 # ```Second
 - Crating a room is done
 - First thoght was storing array of object containing roomid and User[list of sockets]
- Using array here is really bad practice we obviously dont want duplicates her so useing a set is so obvious here still at v1 i  did used the array then i also found why it more bad because of the nested loops 0(n^2) using set will make sure add and delting becomes fater due less timecomplexities as per my understanding sets are fast 
# ```Third
will  use to maps  one is for going from room id to sockets and another will be socke o room id it will be help us to get while sending msg we dont have to send roomid with it each time joining room and sending msg will be faster has lookup timee has been reduced  
# ```Forth
Implementedd leave fuction which cuts connection from server side  while leaving also implemented a function it removes ther user from other room before ccreating and leaving and also if connection dissconectes from the client ide 
