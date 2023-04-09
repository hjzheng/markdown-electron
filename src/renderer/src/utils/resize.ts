import { useState, useEffect } from "react"

export default function useWindowSize() {
    
    const [rect, setRect] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    })

    useEffect(() => {
        const resizeHandler = () => {
            setRect({
                width: window.innerWidth,
                height: window.innerHeight,
            })
        }
       
        window.addEventListener("resize", resizeHandler)

        return () => {
            window.removeEventListener("resize", resizeHandler)
        }
    }, [])
    
    return rect
}