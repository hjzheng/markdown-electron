import { useState, useEffect } from 'react'
import { SimpleMdeReact } from "react-simplemde-editor"
import { Options } from "easymde"
import "github-markdown-css/github-markdown.css"
import useWindowSize from '../utils/resize'

import { getPreferredScheme } from '../utils/colorScheme'

if (getPreferredScheme() === 'dark') {
    import("easymde/dist/easymde.min.css")
    // override some style to support dark mode
    import("@renderer/assets/easymde.dark.min.css")
} else {
    import("easymde/dist/easymde.min.css")
}

interface IProps {
    fileContent: string
    isActived: boolean
    onChange: (value: string) => void
}

function MarkdownEditor({fileContent, isActived, onChange}: IProps): JSX.Element {
    const [options, setOptions] = useState<Options>({
        maxHeight: "300px",
        previewClass: "markdown-body",
        spellChecker: false,
    });

    const { width: _width, height } = useWindowSize()

    // const [simpleMdeInstance, setMdeInstance] = useState(null);

    // const getMdeInstanceCallback = useCallback((simpleMde) => {
    //     setMdeInstance(simpleMde);
    // }, [])

    // useEffect(() => {
    //     simpleMdeInstance &&
    //     console.info("Hey I'm editor instance!", simpleMdeInstance);
    // }, [simpleMdeInstance])

    useEffect(() => {
        setOptions((_it) => {
            return {
                maxHeight: height - 180 + 'px',
                previewClass: ["markdown-body", "markdown-preview-fix"],
                spellChecker: false,
            }
        })
    }, [height])

    useEffect(() => {
        if (isActived) {
            setOptions((_it) => {
                return {
                    maxHeight: height - 180 + 'px',
                    previewClass: ["markdown-body", "markdown-preview-fix"],
                    spellChecker: false,
                }
            })
        }
    }, [isActived])

    return <>
        <SimpleMdeReact 
            // getMdeInstance={getMdeInstanceCallback}
            options={options}
            value={fileContent} 
            onChange={(value) => onChange(value)} />
    </>
}   

export default MarkdownEditor
