import { create } from 'zustand'

const initialData = {
  "gameState": {
    "day": 14,
    "timeOfDay": "NIGHT",
    "resources": {
      "biomass": 450,
      "energy": 12,
      "caps": 85,
      "noiseLevel": 3
    },
    "grid": [
      {
        "id": "cell_0_1",
        "type": "GENERATOR",
        "assignedZombie": {
          "id": "z_992",
          "type": "WALKER",
          "stamina": 45,
          "outputPerTick": 2
        }
      },
      {
        "id": "cell_1_2",
        "type": "CROP_BLOOD_CORN",
        "growthStage": 2,
        "timeToHarvest": 120,
        "fertilizerLevel": "HIGH"
      }
    ],
    "zombiePen": [
      {
        "id": "z_104",
        "type": "BLOATER",
        "status": "CONTAINED",
        "dangerTimer": 300
      }
    ],
    "activeEvents": [
      {
        "type": "RAIDERS_APPROACHING",
        "eta": 60
      }
    ]
  }
}

// Helper to convert grid array to 8x8 map
const createGridMap = (gridArray) => {
  const gridMap = {}
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const cellId = `cell_${row}_${col}`
      const existingCell = gridArray.find(c => c.id === cellId)
      if (existingCell) {
        gridMap[cellId] = existingCell
      } else {
        gridMap[cellId] = {
          id: cellId,
          type: 'EMPTY',
          row,
          col
        }
      }
    }
  }
  return gridMap
}

export const useGameStore = create((set, get) => ({
  day: initialData.gameState.day,
  timeOfDay: initialData.gameState.timeOfDay,
  resources: initialData.gameState.resources,
  grid: createGridMap(initialData.gameState.grid),
  zombiePen: initialData.gameState.zombiePen,
  activeEvents: initialData.gameState.activeEvents,

  // Action to till a cell (change EMPTY to TILLED, costs 10 energy)
  tillCell: (row, col) => {
    const cellId = `cell_${row}_${col}`
    const { grid, resources } = get()
    const cell = grid[cellId]

    // Check if cell is EMPTY and we have enough energy
    if (cell.type !== 'EMPTY') {
      console.log('Cell is not EMPTY')
      return false
    }

    if (resources.energy < 10) {
      console.log('Not enough energy')
      return false
    }

    set((state) => ({
      grid: {
        ...state.grid,
        [cellId]: {
          ...cell,
          type: 'TILLED'
        }
      },
      resources: {
        ...state.resources,
        energy: state.resources.energy - 10
      }
    }))

    return true
  },

  // Get cell by row and col
  getCell: (row, col) => {
    const cellId = `cell_${row}_${col}`
    return get().grid[cellId]
  }
}))
