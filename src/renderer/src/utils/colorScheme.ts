

import { useState, useEffect } from "react"

export const getPreferredScheme = () => window?.matchMedia?.('(prefers-color-scheme:dark)')?.matches ? 'dark' : 'light';

export default function useColorScheme() {

    const [mode, setMode] = useState<'light'|'dark'>(getPreferredScheme())

    useEffect(() => {

        
        const handler = () => {
            event => {
                const colorScheme = event.matches ? "dark" : "light";
                setMode(colorScheme)
            }
        }

        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', handler);
    

        return () => {
            window.matchMedia('(prefers-color-scheme: dark)').removeEventListener("resize", handler)
        }
    }, [])
    
    return mode
}