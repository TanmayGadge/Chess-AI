import React from 'react'
import { useBoard } from '../../context/BoardContext'

const LogButton = () => {
    const {boardState, setBoardState} = useBoard();

  return (
    <button
          className="fixed bottom-10 right-10 p-2 rounded-lg bg-white"
          onClick={() => {
            console.dir(boardState);
          }}
        >
          Log board state
        </button>
  )
}

export default LogButton