import React, { useEffect, useRef } from 'react';
import { string } from 'prop-types';
import hljs from 'highlight.js/lib/highlight';
import java from 'highlight.js/lib/languages/java';
import python from 'highlight.js/lib/languages/python';
import go from 'highlight.js/lib/languages/go';

hljs.registerLanguage('java', java);
hljs.registerLanguage('python', python);
hljs.registerLanguage('go', go);

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

    const className = props.language ? `language-${props.language}` : undefined;

    return (
        <pre>
            <code ref={codeEl} className={className}>
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
