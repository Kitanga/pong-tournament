# Pong Tournament

Created this pong clone and added a tournament bracket to it.

The original tournament code is here: [tournament-bracket](https://github.com/Kitanga/tournament-bracket)

You can play this game here: [PLAY GAME](http://htmlpreview.github.io/?https://github.com/Kitanga/pong-tournament/blob/master/index.html)

## Tournament Bracket

First of all, the code uses the canvas' dimensions to create boxs and such. It does this once and will not do it again (I think. I hope. I think I hope. Anyways...), this means you can make it resize according to the canvas' dimensions on the resize event. I honestly don't know why I'm telling you this...

### ...Creating players

You can create a new player by clicking the [Create Player] button. You add the name of the player and then take a quick photo of them.

### The Contenders List

This is a list of players that are going to participate in the tournament. The code picks a random 8 players from the list you give. So going over the maximum (8 players) in the list, is OK.

### Starting the tournament

After creating the players and adding them to the contenders list (Make sure that they are at least 8 unique players in contenders list), you can click the [Start!] button or press the Enter key.
After that, just press enter to move through the phases until you reach the actual game.

### Playing the pong clone

The controls for Player 1 (player on the left) are W for Up and S for Down.
The controls for Player 2 (player on the right) are UP ARROW for Up and DOWN ARROW for Down.

## Bugs in the game

- The tournament starts from the bottom right and not the bottom left. So matches move from right to left and not from left to right. This means that the eighth and seventh player in the tournament will play first (just in case you didn't get it).
- The pong game has an 'issue' to put it lightly, you'll notice it as soon as you start playing the game. This bug came in as I was trying to fix an issue where the ball got stuck in a rebound loop, it would only deviate a little from it's current path. This made the game extremely predictable and boring. Before this it worked just fine, played a few games against my brother (in case you were wondering, I won), we had fun. Moved the tournament code into the game suddenly the game stops working right. Anyways, this bug is staying in here until some unknown day.

## License

This is licensed under MIT.