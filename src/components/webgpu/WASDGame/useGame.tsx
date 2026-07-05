import { create } from 'zustand'

export const useGame = create<any>((set, get) => {
    return {
        player: false,
        keyboard: false,
        game: false,
    }
})
