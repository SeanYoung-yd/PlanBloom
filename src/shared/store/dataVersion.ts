import { create } from "zustand";

type DataVersionState = {
  version: number;
  touch: () => void;
};

export const useDataVersion = create<DataVersionState>((set) => ({
  version: 0,
  touch: () => set((state) => ({ version: state.version + 1 })),
}));

export const touchData = () => useDataVersion.getState().touch();
