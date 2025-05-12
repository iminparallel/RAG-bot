import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
// Standard tailwind stuff
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
