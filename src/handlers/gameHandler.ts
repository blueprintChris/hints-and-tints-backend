import { Events } from '../constants/events';
import { GameStates } from '../constants/game';
import { Square, grid } from '../constants/grid';
import { HINTER, SPECTATOR, TINTER } from '../constants/roles';
import { Colour } from '../models/Colour';
import { Player } from '../models/Player';
import { getInnerColours, getOuterColours } from '../utils';
import { Handler, Payload } from './types';

export default ({ io, socket, roomController }: Handler) => {
  const updateGameState = ({ roomId, gameState }: GameStateUpdate) => {
    try {
      roomController.setRoomState(roomId, gameState);

      io.to(roomId).emit(Events.GAME_UPDATE_STATE, { gameState });
    } catch (err) {
      console.error(`error updating game state ${err.message}`);
    }
  };

  const joinGame = ({ roomId, playerId, role }) => {
    try {
      const spectator = roomController.getSpectatorById(roomId, playerId);

      roomController.joinGame(roomId, spectator);
      roomController.setPlayerRole(roomId, playerId, role);

      const player = roomController.getPlayerById(roomId, playerId);

      socket.emit(Events.PLAYER_UPDATE, { player });

      const players = roomController.getAllPlayers(roomId);
      const spectators = roomController.getAllSpectators(roomId);

      io.to(roomId).emit(Events.GAME_JOIN, { players, spectators });

      console.log(`${player.getName()} joined the game ${role}`);
    } catch (err) {
      console.error(`error joining game: ${err.message}`);
    }
  };

  const startGame = ({ roomId }: GameStateUpdate) => {
    try {
      const room = roomController.getRoomById(roomId);

      // reset everything
      roomController.resetAllGuesses(roomId);
      roomController.resetAllScores(roomId);
      roomController.setFirstHint(roomId, '');
      roomController.setSecondHint(roomId, '');
      roomController.setWinner(roomId, null);
      roomController.setRoomState(roomId, GameStates.SELECTION_ONE);

      // get players in the room
      const currentPlayers = room.getAllPlayers();
      const sortedList: Player[] = [];

      // put the hinter at the start of the array, put the rest in after
      const hinter = currentPlayers.filter(pl => pl.getRole() === HINTER);
      const tinters = currentPlayers.filter(pl => pl.getRole() === TINTER);
      sortedList.push(...hinter, ...tinters);

      // update the player list
      roomController.setPlayers(roomId, sortedList);

      io.to(roomId).emit(Events.GAME_START, {
        gameState: room.getState(),
        players: room.getAllPlayers(),
        firstHint: room.getFirstHint(),
        secondHint: room.getSecondHint(),
        winner: room.getWinner(),
      });

      console.log(`game started`);
    } catch (err) {
      console.error(`error starting game: ${err.message}`);
    }
  };

  const startRound = ({ roomId, selectedColour, gameState, firstHint }: GameRoundStart) => {
    try {
      const room = roomController.getRoomById(roomId);
      const currentPlayers = room.getAllPlayers();

      // get first tinter and make it their turn
      const player = currentPlayers.filter(pl => pl.getRole() === TINTER)[0];

      // set the current selected colour, hint and update the game state
      const colour = new Colour(
        selectedColour.ref,
        selectedColour.hex,
        selectedColour.col,
        selectedColour.x,
        selectedColour.y
      );

      roomController.setCurrentTurn(roomId, player.getId());
      roomController.setRoomState(roomId, gameState);
      roomController.setSelectedColour(roomId, colour);
      roomController.setFirstHint(roomId, firstHint);

      io.to(roomId).emit(Events.GAME_ROUND_START, {
        selectedColour: room.getSelectedColour(),
        gameState: room.getState(),
        players: room.getAllPlayers(),
        currentTurn: room.getCurrentTurn(),
        firstHint: room.getFirstHint(),
      });

      console.log(`current turn ${room.getCurrentTurn().getName()}`);
    } catch (err) {
      console.error(`error starting round: ${err.message}`);
    }
  };

  const continueRound = ({ roomId, secondHint, gameState }: GameRoundStartSecondHalf) => {
    try {
      // get player list
      const room = roomController.getRoomById(roomId);
      const players = room.getAllPlayers();

      // get the last tinter and make it their turn
      const player = players.filter(pl => pl.getRole() === TINTER)[players.length - 2];

      // set the game state and the 2nd hint
      roomController.setCurrentTurn(roomId, player.getId());
      roomController.setRoomState(roomId, gameState);
      roomController.setSecondHint(roomId, secondHint);

      io.to(roomId).emit(Events.GAME_ROUND_CONTINUE, {
        gameState: room.getState(),
        currentTurn: room.getCurrentTurn(),
        secondHint: room.getSecondHint(),
      });

      console.log(`current turn ${room.getCurrentTurn().getName()}`);
    } catch (err) {
      console.error(`error continuing round: ${err.message}`);
    }
  };

  const endTurn = ({ roomId, selectedSquare, playerId }: GameUpdateTurn) => {
    try {
      const room = roomController.getRoomById(roomId);

      if (room.getState() === GameStates.GUESSING_ONE) {
        const players = room.getAllPlayers();
        // update players colour guess so it shows on the board for everyone
        const colour = new Colour(
          selectedSquare.ref,
          selectedSquare.hex,
          selectedSquare.col,
          selectedSquare.x,
          selectedSquare.y
        );

        roomController.setFirstTintForPlayer(roomId, playerId, colour);

        io.to(roomId).emit(Events.PLAYERS_UPDATE, { players: room.getAllPlayers() });

        // get the position of the current player in the list
        const indexOfCurrentPlayer = players.findIndex(pl => pl.getId() === playerId);
        const nextPlayer = players[indexOfCurrentPlayer + 1];

        // if there is a next player, end this players turn and move onto next
        if (nextPlayer) {
          roomController.setCurrentTurn(roomId, nextPlayer.getId());

          io.to(roomId).emit(Events.GAME_TURN_END, {
            currentTurn: roomController.getCurrentTurn(roomId),
          });
        } else {
          // if there is no next player, all players have had a turn - onto the next hint
          roomController.setRoomState(roomId, GameStates.SELECTION_TWO);

          // we dont need to update the current player as they go again after selection
          io.to(roomId).emit(Events.GAME_UPDATE_STATE, { gameState: room.getState() });
        }
      }

      if (room.getState() === GameStates.GUESSING_TWO) {
        // update players colour guess
        const colour = new Colour(
          selectedSquare.ref,
          selectedSquare.hex,
          selectedSquare.col,
          selectedSquare.x,
          selectedSquare.y
        );

        roomController.setSecondTintForPlayer(roomId, playerId, colour);

        const players = roomController.getAllPlayers(roomId);
        io.to(roomId).emit(Events.PLAYERS_UPDATE, { players });

        // get the position of the current player in the list and find the next player
        const indexOfCurrentPlayer = players.findIndex(pl => pl.getId() === playerId);
        const nextPlayer = players[indexOfCurrentPlayer - 1];

        if (nextPlayer) {
          // if the next player is the hinter, then everyone has had their turn, its time to reveal the hinters colour
          if (nextPlayer.getRole() === HINTER) {
            roomController.setRoomState(roomId, GameStates.REVEAL);

            const square = roomController.getSelectedColour(roomId);

            // get all surrounding squares
            const innerSquares = getInnerColours(square.getX(), square.getY(), grid);
            const outerSquares = getOuterColours(square.getX(), square.getY(), grid);

            roomController.updateScores(roomId, players, innerSquares, outerSquares);

            //check if a player has won
            roomController.determineWinner(roomId);

            // the client game will continue if the winner is null
            const winner = roomController.getWinner(roomId);

            io.to(roomId).emit(Events.GAME_UPDATE_SCORES, {
              players,
              gameState: room.getState(),
              winner,
            });
          }
          roomController.setCurrentTurn(roomId, nextPlayer.getId());
          const currentTurn = roomController.getCurrentTurn(roomId);

          io.to(roomId).emit(Events.GAME_TURN_END, { currentTurn });
        }
      }
    } catch (err) {
      console.error(`error ending turn: ${err.message}`);
    }
  };

  const updateScores = ({ roomId }: Payload) => {
    try {
      const room = roomController.getRoomById(roomId);
      const winner = roomController.getWinner(roomId);

      if (winner) {
        roomController.setRoomState(roomId, GameStates.GAME_END);

        io.to(roomId).emit(Events.GAME_UPDATE_STATE, {
          gameState: room.getState(),
          winner,
        });
      } else {
        roomController.setRoomState(roomId, GameStates.SCORING);

        io.to(roomId).emit(Events.GAME_UPDATE_STATE, {
          gameState: room.getState(),
        });
      }
    } catch (err) {
      console.error(`error updating scores: ${err.message}`);
    }
  };

  const endRound = ({ roomId }: Payload) => {
    try {
      // reset everyones guesses and the hinters hints
      roomController.resetAllGuesses(roomId);
      roomController.setFirstHint(roomId, '');
      roomController.setSecondHint(roomId, '');
      roomController.setRoomState(roomId, GameStates.SELECTION_ONE);

      // get current hinter, who should always be at position zero and remove them from the list
      const room = roomController.getRoomById(roomId);
      const players = roomController.getAllPlayers(roomId);

      const updatedPlayers: Player[] = [...players];
      const currentHinter = updatedPlayers.shift();

      // set their role to tinter and put them at the back
      currentHinter.setPlayerRole(TINTER);
      updatedPlayers.push(currentHinter);

      // get the position of the first person in the list and set them as hinter
      const nextHinter = updatedPlayers[0];
      nextHinter.setPlayerRole(HINTER);

      roomController.setPlayers(roomId, updatedPlayers);

      io.to(roomId).emit(Events.GAME_ROUND_END, {
        players: updatedPlayers,
        gameState: room.getState(),
        firstHint: room.getFirstHint(),
        secondHint: room.getSecondHint(),
      });
    } catch (err) {
      console.error(`error ending round: ${err.message}`);
    }
  };

  const handleEndGame = ({ roomId }: Payload) => {
    try {
      roomController.setRoomState(roomId, GameStates.GAME_END);

      const winner = roomController.getWinner(roomId);

      io.to(roomId).emit(Events.GAME_END, {
        gameState: GameStates.GAME_END,
        winner,
      });
    } catch (err) {
      console.error(`error ending game: ${err.message}`);
    }
  };

  const handleGameReset = ({ roomId }: Payload) => {
    try {
      // reset all player scores and guesses
      roomController.resetAllGuesses(roomId);
      roomController.resetAllScores(roomId);

      // reset hints and winner
      roomController.setFirstHint(roomId, '');
      roomController.setSecondHint(roomId, '');
      roomController.setWinner(roomId, null);

      roomController.setCurrentTurn(roomId, null);
      roomController.setSelectedColour(roomId, null);

      const room = roomController.getRoomById(roomId);
      const players = roomController.getAllPlayers(roomId);

      // move all players back to spectator and reset role to spectator
      for (var i = 0; i < players.length; i++) {
        players[i].setPlayerRole(SPECTATOR);

        roomController.joinRoom(roomId, players[i]);
        roomController.leaveGame(roomId, players[i]);

        i--;
      }

      // update the room state
      roomController.setRoomState(roomId, GameStates.LOBBY);

      io.to(roomId).emit(Events.GAME_RESET, {
        players: room.getAllPlayers(),
        spectators: room.getAllSpectators(),
        gameState: room.getState(),
        firstHint: room.getFirstHint(),
        secondHint: room.getSecondHint(),
        currentTurn: room.getCurrentTurn(),
        selectedColour: room.getSelectedColour(),
        winner: room.getWinner(),
      });
    } catch (err) {
      console.error(`error resetting game: ${err.message}`);
    }
  };

  socket.on(Events.GAME_JOIN, joinGame);
  socket.on(Events.GAME_TURN_END, endTurn);
  socket.on(Events.GAME_ROUND_START, startRound);
  socket.on(Events.GAME_UPDATE_STATE, updateGameState);
  socket.on(Events.GAME_UPDATE_SCORES, updateScores);
  socket.on(Events.GAME_START, startGame);
  socket.on(Events.GAME_ROUND_CONTINUE, continueRound);
  socket.on(Events.GAME_ROUND_END, endRound);
  socket.on(Events.GAME_END, handleEndGame);
  socket.on(Events.GAME_RESET, handleGameReset);
};

interface GameStateUpdate extends Payload {
  gameState: string;
}

interface GameRoundStart extends Payload {
  selectedColour: Square;
  gameState: string;
  firstHint: string;
}

interface GameRoundStartSecondHalf extends Payload {
  gameState: string;
  secondHint: string;
}

interface GameUpdateTurn extends Payload {
  selectedSquare: Square;
  playerId: string;
}
