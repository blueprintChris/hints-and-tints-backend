import express, { Express } from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { RoomController } from './controller/RoomController';
import { Player } from './models/Player';
import { HINTER, TINTER } from './constants/roles';

export class Application {
  private roomController: RoomController;
  private port: number;

  constructor(port: number) {
    this.port = port;
  }

  public async start() {
    const app = express();
    const server = createServer(app);

    const io = new Server(server, {
      cors: {
        origin: 'http://localhost:3000',
      },
    });

    this.roomController = new RoomController();

    this.initRoutes(app);
    this.initSocket(io);

    server.listen(this.port, () => {
      console.log(`server running at http://localhost:${this.port}`);
    });
  }

  private initSocket(io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) {
    io.on('connection', async socket => {
      try {
        console.log(`a user connected to the server`);

        const createRoom = ({ roomId }) => {
          this.roomController.createRoom(roomId);

          socket.emit('room-create', { roomId });
        };

        const joinRoom = ({ roomId, nickname }) => {
          socket.join(roomId);

          const player = new Player(socket.id, nickname);
          socket.emit('update-player', { player });

          this.roomController.joinRoom(roomId, player);
          const room = this.roomController.getRoomById(roomId);

          io.to(roomId).emit('room-join', {
            roomId,
            players: room.getPlayers(),
            gameState: room.getState(),
          });

          console.log(`user ${nickname} joined room: ${roomId}`);
        };

        const roomSearch = ({ roomId }) => {
          const doesRoomExist = this.roomController.getRoomById(roomId);

          socket.emit('room-search', { doesRoomExist, roomId });
        };

        const updatePlayerRole = ({ roomId, playerId, role }) => {
          const player = this.roomController.setPlayerRole(roomId, playerId, role);
          socket.emit('update-player', { player });

          const players = this.roomController.getPlayers(roomId);
          io.to(roomId).emit('update-players', { players });

          console.log(`${player.getName()} updated their role to ${role}`);
        };

        const updateGameState = ({ roomId, gameState }) => {
          this.roomController.setRoomState(roomId, gameState);

          io.to(roomId).emit('update-game-state', { gameState });
        };

        const startGame = ({ roomId, gameState }) => {
          // get players in the room
          const currentPlayers = this.roomController.getPlayers(roomId);
          const sortedList: Player[] = [];

          // put the hinter at the start of the array
          const hinter = currentPlayers.find(pl => pl.getRole() === HINTER);
          sortedList.push(hinter);

          // put the rest of the players in
          const tinters = currentPlayers.filter(pl => pl.getRole() === TINTER);
          sortedList.push(...tinters);

          // update the player list
          this.roomController.setPlayers(roomId, sortedList);
          const players = this.roomController.getPlayers(roomId);

          // update the room state
          this.roomController.setRoomState(roomId, gameState);
          io.to(roomId).emit('game-start', { gameState, players });
        };

        const startRound = ({ roomId, selectedColour, gameState, firstHint }) => {
          // get players in the room
          const currentPlayers = this.roomController.getPlayers(roomId);

          // get first tinter and make it their turn
          const player = currentPlayers.filter(pl => pl.getRole() === TINTER)[0];
          this.roomController.setCurrentTurn(roomId, player.getId());

          // set the current selected colour, hint and update the game state
          this.roomController.setRoomState(roomId, gameState);
          this.roomController.setSelectedColour(roomId, selectedColour);
          this.roomController.setFirstHint(roomId, firstHint);

          const room = this.roomController.getRoomById(roomId);

          console.log(`current turn ${room.getCurrentTurn().getName()}`);

          io.to(roomId).emit('round-start', {
            selectedColour: room.getSelectedColour(),
            gameState: room.getState(),
            players: room.getPlayers(),
            currentTurn: room.getCurrentTurn(),
            firstHint: room.getFirstHint(),
          });
        };

        const startSecondRound = ({ roomId, secondHint, gameState }) => {
          // get player list
          const players = this.roomController.getPlayers(roomId);

          // get the last tinter and make it their turn
          const player = players.filter(pl => pl.getRole() === TINTER)[players.length - 2];
          this.roomController.setCurrentTurn(roomId, player.getId());

          // set the game state and the 2nd hint
          this.roomController.setRoomState(roomId, gameState);
          this.roomController.setSecondHint(roomId, secondHint);

          const room = this.roomController.getRoomById(roomId);

          console.log(`current turn ${room.getCurrentTurn().getName()}`);

          io.to(roomId).emit('round-start-2', {
            gameState: room.getState(),
            currentTurn: room.getCurrentTurn(),
            secondHint: room.getSecondHint(),
          });
        };

        const makeTurn = ({ roomId, selectedSquare, playerId }) => {
          const room = this.roomController.getRoomById(roomId);

          if (room.getState() === 'GUESSING_ONE') {
            // update players colour guess so it shows on the board for everyone
            this.roomController.setFirstTintForPlayer(roomId, playerId, selectedSquare);
            const players = this.roomController.getPlayers(roomId);
            console.log(players);

            io.to(roomId).emit('update-players', { players });

            // get the position of the current player in the list
            const indexOfCurrentPlayer = players.findIndex(pl => pl.getId() === playerId);
            const nextPlayer = players[indexOfCurrentPlayer + 1];

            // if there is a next player, make it their turn
            if (nextPlayer) {
              this.roomController.setCurrentTurn(roomId, nextPlayer.getId());
              const currentTurn = this.roomController.getCurrentTurn(roomId);

              io.to(roomId).emit('make-turn', { currentTurn });
            } else {
              // if there is no next player, all players have had a turn - onto the next hint
              this.roomController.setRoomState(roomId, 'SELECTION_TWO');

              // we dont need to update the current player as they go again after selection
              io.to(roomId).emit('update-game-state', { gameState: room.getState() });
            }
          }

          if (room.getState() === 'GUESSING_TWO') {
            // update players colour guess
            this.roomController.setSecondTintForPlayer(roomId, playerId, selectedSquare);
            const players = this.roomController.getPlayers(roomId);

            io.to(roomId).emit('update-players', { players });

            // get the position of the current player in the list and find the next player
            const indexOfCurrentPlayer = players.findIndex(pl => pl.getId() === playerId);
            const nextPlayer = players[indexOfCurrentPlayer - 1];

            if (nextPlayer) {
              // we are back at the hinter, so all players have had 2 guesses
              // we need to select the next new hinter
              if (nextPlayer.getRole() === HINTER) {
                // reset everyones guesses and both hints
                this.roomController.resetAllGuesses(roomId);
                this.roomController.setFirstHint(roomId, '');
                this.roomController.setSecondHint(roomId, '');

                // get current hinter, who should always be at position zero and put them at the bacl
                const updatedPlayers: Player[] = [...players];
                const currentHinter = updatedPlayers.shift();

                // set their role to tinter and put them at the back
                currentHinter.setPlayerRole(TINTER);
                updatedPlayers.push(currentHinter);

                // get the position of the current hinter in the list and select the next hinter
                const nextHinter = updatedPlayers[0];
                nextHinter.setPlayerRole(HINTER);

                this.roomController.setPlayers(roomId, updatedPlayers);

                io.to(roomId).emit('end-round', {
                  players,
                  gameState: 'SELECTION',
                  firstHint: room.getFirstHint(),
                  secondHint: room.getSecondHint(),
                });
              }

              this.roomController.setCurrentTurn(roomId, nextPlayer.getId());
              const currentTurn = this.roomController.getCurrentTurn(roomId);

              io.to(roomId).emit('make-turn', { currentTurn });
            }
          }
        };

        const disconnecting = () => {
          const socketRoom = [...socket.rooms];

          const playerId = socketRoom[0];
          const roomId = socketRoom[1];

          const room = this.roomController.getRoomById(roomId);

          if (room) {
            const player = room.getPlayerById(playerId);
            const players = this.roomController.leaveRoom(roomId, player);

            io.to(roomId).emit('room-leave', { players });

            const isRoomEmpty = this.roomController.isRoomEmpty(roomId);

            if (isRoomEmpty) {
              this.roomController.deleteRoom(roomId);
            }
          }
        };

        socket.on('room-create', createRoom);
        socket.on('room-join', joinRoom);
        socket.on('room-search', roomSearch);
        socket.on('game-start', startGame);
        socket.on('round-start', startRound);
        socket.on('round-start-2', startSecondRound);
        socket.on('make-turn', makeTurn);
        socket.on('update-player-role', updatePlayerRole);
        socket.on('update-game-state', updateGameState);
        socket.on('disconnecting', disconnecting);

        socket.on('disconnect', () => {
          console.log(`a user disconnected`);
        });
      } catch (err) {
        console.error('there was an error', err.message);
      }
    });
  }

  private initRoutes(app: Express) {
    app.get('/', (req, res) => {
      res.send('root');
    });

    app.get('/rooms', (req, res) => {
      const rooms = this.roomController.getRooms();

      res.send(rooms);
    });
  }
}
