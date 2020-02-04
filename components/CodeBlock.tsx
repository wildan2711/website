import React, { useEffect, useRef } from 'react';
import { string } from 'prop-types';
import hljs from 'highlight.js/lib/highlight';
import java from 'highlight.js/lib/languages/java';
import python from 'highlight.js/lib/languages/python';

hljs.registerLanguage('java', java);
hljs.registerLanguage('python', python);

interface CodeBlockProps {
    value: string;
    language?: string;
}

function CodeBlock(props: CodeBlockProps) {
    const codeEl = useRef<HTMLElement | null>(null);

    const highlightCode = () => {
        if (codeEl?.current) {
            hljs.highlightBlock(codeEl.current);
        }
    };

    useEffect(() => {
        highlightCode();
    }, [props]);

    return (
        <pre>
            <code ref={codeEl} className={`language-${props.language}`}>
                {props.value}
            </code>
        </pre>
    );
}

CodeBlock.defaultProps = {
    language: ''
};

CodeBlock.propTypes = {
    value: string.isRequired,
    language: string
};

export default CodeBlock;
