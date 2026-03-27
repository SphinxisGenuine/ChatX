the reason I am Building This is to implement Websockets learning
 
 # ```First
 - The first goal was to create a websocket at client and server side
 -  connecting the client  to server and resonding
 - connectoing multiple browser meanr msg is broadcasted to every browser connected to the ws (Easy bits)
 # ```Second
 - Crating a room is done
 - First thoght was storing array of object containing roomid and User[list of sockets]
- Using array here is really bad practice we obviously dont want duplicates her so useing a set is so obvious here still at v1 i  did used the array then i also found why it more bad because of the nested loops 0(n^2) using set will make sure add and delting becomes fater due less timecomplexities as per my understanding sets are fast 



