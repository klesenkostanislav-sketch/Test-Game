import { useGameStore } from './store'

function Cell({ row, col }) {
  const cell = useGameStore((state) => state.getCell(row, col))
  const tillCell = useGameStore((state) => state.tillCell)

  const handleClick = () => {
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
        return 'bg-blue-500 hover:bg-blue-600'
      case 'CROP_BLOOD_CORN':
        return 'bg-red-500 hover:bg-red-600'
      default:
        return 'bg-gray-200 hover:bg-gray-300'
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`w-12 h-12 border border-gray-400 ${getCellClasses()} transition-colors duration-150 flex items-center justify-center text-xs font-semibold`}
      title={`${cell.type} (${row}, ${col})`}
    >
      {cell.type === 'GENERATOR' && '⚡'}
      {cell.type === 'CROP_BLOOD_CORN' && '🌽'}
      {cell.type === 'TILLED' && '🟫'}
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

function App() {
  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <h1 className="text-3xl font-bold text-white mb-6 text-center">Zombie Farm</h1>
      <div className="flex flex-col items-center">
        <Resources />
        <Grid />
        <p className="mt-4 text-gray-400 text-sm">
          Click on EMPTY cells to till them (costs 10 energy)
        </p>
      </div>
    </div>
  )
}

export default App
