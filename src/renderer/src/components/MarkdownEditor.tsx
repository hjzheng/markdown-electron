import { useState, useEffect } from 'react'
import { SimpleMdeReact } from "react-simplemde-editor"
import { Options } from "easymde"
import "easymde/dist/easymde.min.css"
import "github-markdown-css/github-markdown.css"
import useWindowSize from '../utils/resize'

interface IProps {
    fileContent: string
    onChange: (value: string) => void
}

function MarkdownEditor({fileContent, onChange}: IProps): JSX.Element {
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

    return <>
        <SimpleMdeReact 
            // getMdeInstance={getMdeInstanceCallback}
            options={options}
            value={fileContent} 
            onChange={(value) => onChange(value)} />
    </>
}   

export default MarkdownEditor
