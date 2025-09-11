// ResizeFormContext.tsx
"use client";
import { createContext, useContext } from "react";

export type ResizeFormFn = () => void;
export const ResizeFormContext = createContext<ResizeFormFn>(() => {});

export const useResizeForm = () => useContext(ResizeFormContext);
