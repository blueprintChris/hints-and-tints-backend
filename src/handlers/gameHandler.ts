import { Events } from '../constants/events';
import { GameStates } from '../constants/game';
import { Square, grid } from '../constants/grid';
import { HINTER, TINTER } from '../constants/roles';
import { Colour } from '../models/Colour';
import { Player } from '../models/Player';
import { getInnerColours, getOuterColours } from '../utils';
import { Handler, Payload } from './types';

export default ({ io, socket, roomController }: Handler) => {
  const updateGameState = ({ roomId, gameState }: GameStateUpdate) => {
    roomController.setRoomState(roomId, gameState);

    io.to(roomId).emit(Events.GAME_UPDATE_STATE, { gameState });
  };

  const startGame = ({ roomId }: GameStateUpdate) => {
    roomController.resetAllGuesses(roomId);
    roomController.resetAllScores(roomId);
    roomController.setFirstHint(roomId, '');
    roomController.setSecondHint(roomId, '');
    roomController.setWinner(roomId, null);

    // get players in the room
    const currentPlayers = roomController.getPlayers(roomId);
    const sortedList: Player[] = [];

    // put the hinter at the start of the array
    const hinter = currentPlayers.find(pl => pl.getRole() === HINTER);
    sortedList.push(hinter);

    // put the rest of the players in
    const tinters = currentPlayers.filter(pl => pl.getRole() === TINTER);
    sortedList.push(...tinters);

    // update the player list
    const room = roomController.getRoomById(roomId);

    roomController.setPlayers(roomId, sortedList);
    const players = room.getPlayers();

    // update the room state
    roomController.setRoomState(roomId, GameStates.SELECTION_ONE);

    io.to(roomId).emit(Events.GAME_START, {
      gameState: roomController.getGameState(roomId),
      players,
      firstHint: room.getFirstHint(),
      secondHint: room.getSecondHint(),
      winner: null,
    });
  };

  const startRound = ({ roomId, selectedColour, gameState, firstHint }: GameRoundStart) => {
    // get players in the room
    const currentPlayers = roomController.getPlayers(roomId);

    // get first tinter and make it their turn
    const player = currentPlayers.filter(pl => pl.getRole() === TINTER)[0];
    roomController.setCurrentTurn(roomId, player.getId());

    // set the current selected colour, hint and update the game state
    roomController.setRoomState(roomId, gameState);

    const colour = new Colour(
      selectedColour.ref,
      selectedColour.hex,
      selectedColour.col,
      selectedColour.x,
      selectedColour.y
    );

    roomController.setSelectedColour(roomId, colour);
    roomController.setFirstHint(roomId, firstHint);

    const room = roomController.getRoomById(roomId);

    console.log(`current turn ${room.getCurrentTurn().getName()}`);

    io.to(roomId).emit(Events.GAME_ROUND_START, {
      selectedColour: room.getSelectedColour(),
      gameState: room.getState(),
      players: room.getPlayers(),
      currentTurn: room.getCurrentTurn(),
      firstHint: room.getFirstHint(),
    });
  };

  const continueRound = ({ roomId, secondHint, gameState }: GameRoundStartSecondHalf) => {
    // get player list
    const players = roomController.getPlayers(roomId);

    // get the last tinter and make it their turn
    const player = players.filter(pl => pl.getRole() === TINTER)[players.length - 2];
    roomController.setCurrentTurn(roomId, player.getId());

    // set the game state and the 2nd hint
    roomController.setRoomState(roomId, gameState);
    roomController.setSecondHint(roomId, secondHint);

    const room = roomController.getRoomById(roomId);

    console.log(`current turn ${room.getCurrentTurn().getName()}`);

    io.to(roomId).emit(Events.GAME_ROUND_CONTINUE, {
      gameState: room.getState(),
      currentTurn: room.getCurrentTurn(),
      secondHint: room.getSecondHint(),
    });
  };

  const endTurn = ({ roomId, selectedSquare, playerId }: GameUpdateTurn) => {
    const room = roomController.getRoomById(roomId);

    if (room.getState() === GameStates.GUESSING_ONE) {
      // update players colour guess so it shows on the board for everyone
      const colour = new Colour(
        selectedSquare.ref,
        selectedSquare.hex,
        selectedSquare.col,
        selectedSquare.x,
        selectedSquare.y
      );

      roomController.setFirstTintForPlayer(roomId, playerId, colour);
      const players = roomController.getPlayers(roomId);

      io.to(roomId).emit(Events.PLAYERS_UPDATE, { players });

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

      const players = roomController.getPlayers(roomId);
      io.to(roomId).emit(Events.PLAYERS_UPDATE, { players });

      // get the position of the current player in the list and find the next player
      const indexOfCurrentPlayer = players.findIndex(pl => pl.getId() === playerId);
      const nextPlayer = players[indexOfCurrentPlayer - 1];

      if (nextPlayer) {
        // if the next player is the hinter, then everyone has had their turn, its time to score
        if (nextPlayer.getRole() === HINTER) {
          const square = roomController.getSelectedColour(roomId);

          // get all surrounding squares
          const innerSquares = getInnerColours(square.getX(), square.getY(), grid);
          const outerSquares = getOuterColours(square.getX(), square.getY(), grid);

          roomController.updateScores(roomId, players, innerSquares, outerSquares);

          //check if a player has won
          roomController.determineWinner(roomId);
          const winner = roomController.getWinner(roomId);

          if (!winner) {
            io.to(roomId).emit(Events.GAME_UPDATE_SCORES, {
              players,
              gameState: GameStates.SCORING,
            });
          } else {
            roomController.setRoomState(roomId, GameStates.GAME_END);

            io.to(roomId).emit(Events.GAME_END, {
              gameState: GameStates.GAME_END,
              winner,
            });
          }
        }

        roomController.setCurrentTurn(roomId, nextPlayer.getId());
        const currentTurn = roomController.getCurrentTurn(roomId);

        io.to(roomId).emit(Events.GAME_TURN_END, { currentTurn });
      }
    }
  };

  const endRound = ({ roomId }: Payload) => {
    // reset everyones guesses and the hinters hints
    roomController.resetAllGuesses(roomId);
    roomController.setFirstHint(roomId, '');
    roomController.setSecondHint(roomId, '');

    // get current hinter, who should always be at position zero and remove them from the list
    const room = roomController.getRoomById(roomId);
    const players = roomController.getPlayers(roomId);

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
      gameState: GameStates.SELECTION_ONE,
      firstHint: room.getFirstHint(),
      secondHint: room.getSecondHint(),
    });
  };

  socket.on(Events.GAME_TURN_END, endTurn);
  socket.on(Events.GAME_ROUND_START, startRound);
  socket.on(Events.GAME_UPDATE_STATE, updateGameState);
  socket.on(Events.GAME_START, startGame);
  socket.on(Events.GAME_ROUND_CONTINUE, continueRound);
  socket.on(Events.GAME_ROUND_END, endRound);
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
