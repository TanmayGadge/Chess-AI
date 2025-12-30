import React from 'react'
import { useBoard } from '../../context/BoardContext'

const AlphaBetaButton = () => {

    const {isAlphaBeta, setIsAlphaBeta} = useBoard();

  return (
    <button
      className=" top-10 right-10 p-2 rounded-lg bg-white"
      onClick={() => {
        setIsAlphaBeta((prev)=>{return !prev})
      }}
    >
      Alpha-Beta Pruning: {isAlphaBeta ? 'ON' : "OFF"}
    </button>
  )
}

export default AlphaBetaButton