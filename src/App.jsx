import { useGameStore } from './store'
import { useEffect } from 'react'

// Game tick interval in milliseconds
const GAME_TICK_INTERVAL = 1000

function Cell({ row, col }) {
  const cell = useGameStore((state) => state.getCell(row, col))
  const tillCell = useGameStore((state) => state.tillCell)
  const assignZombieToGenerator = useGameStore((state) => state.assignZombieToGenerator)
  const selectedZombie = useGameStore((state) => state.selectedZombie)
  const selectZombie = useGameStore((state) => state.selectZombie)
  
  const handleClick = () => {
    // If a zombie is selected and this is a GENERATOR without assigned zombie
    if (selectedZombie && cell.type === 'GENERATOR' && !cell.assignedZombie) {
      assignZombieToGenerator(cell.id, selectedZombie.id)
      selectZombie(null) // Deselect after assignment
      return
    }
    
    // Default action: till the cell
    tillCell(row, col)
  }
  
  // Determine cell appearance based on type
  const getCellClasses = () => {
    switch (cell.type) {
      case 'EMPTY':
        return 'bg-gray-200 hover:bg-gray-300'
      case 'TILLED':
        return 'bg-amber-700 hover:bg-amber-800'
      case 'GENERATOR':
        return cell.assignedZombie 
          ? 'bg-green-500 hover:bg-green-600 ring-2 ring-yellow-400' 
          : 'bg-blue-500 hover:bg-blue-600'
      case 'CROP_BLOOD_CORN':
        return 'bg-red-500 hover:bg-red-600'
      default:
        return 'bg-gray-200 hover:bg-gray-300'
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`w-12 h-12 border border-gray-400 ${getCellClasses()} transition-colors duration-150 flex items-center justify-center text-xs font-semibold relative`}
      title={`${cell.type} (${row}, ${col})${cell.assignedZombie ? ` - ${cell.assignedZombie.type}` : ''}`}
    >
      {cell.type === 'GENERATOR' && '⚡'}
      {cell.type === 'CROP_BLOOD_CORN' && '🌽'}
      {cell.type === 'TILLED' && '🟫'}
      {cell.assignedZombie && (
        <span className="absolute -top-1 -right-1 text-sm">
          {cell.assignedZombie.type === 'WALKER' ? '🚶' : '🧟'}
        </span>
      )}
    </button>
  )
}

function Grid() {
  return (
    <div className="grid grid-cols-8 gap-0 border-2 border-gray-600">
      {Array.from({ length: 8 }).map((_, row) =>
        Array.from({ length: 8 }).map((_, col) => (
          <Cell key={`cell_${row}_${col}`} row={row} col={col} />
        ))
      )}
    </div>
  )
}

function Resources() {
  const resources = useGameStore((state) => state.resources)
  const day = useGameStore((state) => state.day)
  const timeOfDay = useGameStore((state) => state.timeOfDay)

  return (
    <div className="mb-4 p-4 bg-gray-800 text-white rounded-lg">
      <h2 className="text-xl font-bold mb-2">Day {day} - {timeOfDay}</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <span className="text-green-400">Biomass:</span> {resources.biomass}
        </div>
        <div>
          <span className="text-yellow-400">Energy:</span> {resources.energy}
        </div>
        <div>
          <span className="text-blue-400">Caps:</span> {resources.caps}
        </div>
        <div>
          <span className="text-red-400">Noise Level:</span> {resources.noiseLevel}
        </div>
      </div>
    </div>
  )
}

function ZombiePen() {
  const zombiePen = useGameStore((state) => state.zombiePen)
  const selectZombie = useGameStore((state) => state.selectZombie)
  const selectedZombie = useGameStore((state) => state.selectedZombie)
  
  const handleSelectZombie = (zombie) => {
    if (zombie.status === 'CONTAINED') {
      selectZombie(zombie)
    }
  }
  
  // Filter only WALKER zombies for assignment to generators
  const walkerZombies = zombiePen.filter(z => z.type === 'WALKER')
  
  return (
    <div className="p-4 bg-gray-800 text-white rounded-lg h-full">
      <h2 className="text-xl font-bold mb-4">🧟 Zombie Pen</h2>
      
      {walkerZombies.length === 0 ? (
        <p className="text-gray-400 text-sm">No WALKER zombies available</p>
      ) : (
        <div className="space-y-2">
          {walkerZombies.map((zombie) => (
            <div
              key={zombie.id}
              onClick={() => handleSelectZombie(zombie)}
              className={`p-3 rounded-lg cursor-pointer transition-all ${
                selectedZombie?.id === zombie.id
                  ? 'bg-yellow-600 ring-2 ring-yellow-400'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">🚶</span>
                <div>
                  <div className="font-semibold">{zombie.type}</div>
                  <div className="text-xs text-gray-300">
                    Stamina: {zombie.stamina || 'N/A'}
                  </div>
                  <div className="text-xs text-gray-400">
                    Status: {zombie.status}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-4 p-3 bg-gray-700 rounded-lg">
        <p className="text-sm text-gray-300">
          💡 Select a WALKER zombie, then click on a GENERATOR cell to assign it.
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Assigned zombies will generate energy and lose stamina over time.
        </p>
      </div>
    </div>
  )
}

function App() {
  const startGameTick = useGameStore((state) => state.startGameTick)
  const stopGameTick = useGameStore((state) => state.stopGameTick)
  
  useEffect(() => {
    // Start game tick on mount
    startGameTick()
    
    // Cleanup on unmount
    return () => {
      stopGameTick()
    }
  }, [startGameTick, stopGameTick])
  
  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <h1 className="text-3xl font-bold text-white mb-6 text-center">Zombie Farm</h1>
      <div className="flex gap-8 justify-center">
        <div className="flex flex-col items-center">
          <Resources />
          <Grid />
          <p className="mt-4 text-gray-400 text-sm max-w-md">
            Click on EMPTY cells to till them (costs 10 energy). 
            Select a WALKER from the pen and click on a GENERATOR to assign it.
          </p>
        </div>
        <div className="w-64">
          <ZombiePen />
        </div>
      </div>
    </div>
  )
}

export default App
