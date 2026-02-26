import { create } from 'zustand'
import type { PortfolioContent } from '../../actions'

interface PortfolioEditorState {
  editMode: boolean
  editedContent: PortfolioContent | null
  setEditMode: (value: boolean) => void
  setEditedContent: (content: PortfolioContent | null) => void
  resetFromServer: (content: PortfolioContent | null) => void
}

export const usePortfolioEditorStore = create<PortfolioEditorState>((set) => ({
  editMode: false,
  editedContent: null,
  setEditMode: (value) => set({ editMode: value }),
  setEditedContent: (content) => set({ editedContent: content }),
  resetFromServer: (content) => set({ editedContent: content, editMode: false }),
}))
