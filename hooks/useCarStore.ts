import { create } from 'zustand'
import { CAR_PARTS, CarPartData, findCarPartByMeshName } from '@/data/carParts'

interface CarStoreState {
  selectedPart: CarPartData | null
  selectedMeshName: string | null
  hoveredPart: CarPartData | null
  hoveredMeshName: string | null

  isExploded: boolean
  isShowcaseActive: boolean
  showcaseIndex: number
  isLowPowerMode: boolean

  setSelectedPart: (partIdOrMeshName: string | null, meshName?: string | null) => void
  setHoveredPart: (partIdOrMeshName: string | null, meshName?: string | null) => void
  toggleExploded: () => void
  setExploded: (val: boolean) => void
  toggleShowcase: () => void
  setShowcaseActive: (val: boolean) => void
  nextShowcasePart: () => void
  resetView: () => void
  setLowPowerMode: (val: boolean) => void
}

const SHOWCASE_PARTS_KEYS = [
  "front-wing",
  "nose",
  "sidepods",
  "floor",
  "rear-wing",
  "drs",
  "halo",
  "cockpit",
  "steering-wheel",
  "front-wheel",
  "rear-wheel",
  "brake-disc",
  "engine",
  "turbo",
  "mgu-k",
  "battery",
  "exhaust",
  "gearbox",
  "differential",
  "shark-fin",
];

export const useCarStore = create<CarStoreState>((set, get) => ({
  selectedPart: null,
  selectedMeshName: null,
  hoveredPart: null,
  hoveredMeshName: null,

  isExploded: false,
  isShowcaseActive: false,
  showcaseIndex: 0,
  isLowPowerMode: false,

  setSelectedPart: (partIdOrMeshName, meshName = null) => {
    if (!partIdOrMeshName) {
      set({ selectedPart: null, selectedMeshName: null })
      return
    }

    const part =
      CAR_PARTS[partIdOrMeshName] || findCarPartByMeshName(partIdOrMeshName)

    set({
      selectedPart: part,
      selectedMeshName: meshName || partIdOrMeshName,
    })
  },

  setHoveredPart: (partIdOrMeshName, meshName = null) => {
    if (!partIdOrMeshName) {
      set({ hoveredPart: null, hoveredMeshName: null })
      return
    }

    const part =
      CAR_PARTS[partIdOrMeshName] || findCarPartByMeshName(partIdOrMeshName)

    set({
      hoveredPart: part,
      hoveredMeshName: meshName || partIdOrMeshName,
    })
  },

  toggleExploded: () => {
    const current = get().isExploded
    set({ isExploded: !current })
  },

  setExploded: (val) => set({ isExploded: val }),

  toggleShowcase: () => {
    const current = get().isShowcaseActive
    const nextState = !current
    if (nextState) {
      const firstPart = CAR_PARTS[SHOWCASE_PARTS_KEYS[0]]
      set({
        isShowcaseActive: true,
        showcaseIndex: 0,
        selectedPart: firstPart,
        isExploded: false,
      })
    } else {
      set({ isShowcaseActive: false, selectedPart: null })
    }
  },

  setShowcaseActive: (val) => set({ isShowcaseActive: val }),

  nextShowcasePart: () => {
    const { showcaseIndex } = get()
    const nextIndex = (showcaseIndex + 1) % SHOWCASE_PARTS_KEYS.length
    const nextPartKey = SHOWCASE_PARTS_KEYS[nextIndex]
    const nextPart = CAR_PARTS[nextPartKey]

    set({
      showcaseIndex: nextIndex,
      selectedPart: nextPart,
    })
  },

  resetView: () => {
    set({
      selectedPart: null,
      selectedMeshName: null,
      hoveredPart: null,
      hoveredMeshName: null,
      isExploded: false,
      isShowcaseActive: false,
      showcaseIndex: 0,
    })
  },

  setLowPowerMode: (val) => set({ isLowPowerMode: val }),
}))
