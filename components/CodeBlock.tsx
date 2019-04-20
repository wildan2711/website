import React from 'react';
import PropTypes from 'prop-types';
import hljs from 'highlight.js/lib/highlight';
import java from 'highlight.js/lib/languages/java';
import python from 'highlight.js/lib/languages/python';
import 'highlight.js/styles/github.css';

hljs.registerLanguage('java', java);
hljs.registerLanguage('python', python);

export default class CodeBlock extends React.PureComponent<
    CodeBlocksProps,
    {}
> {
    public static defaultProps = {
        language: ''
    };
    public static propTypes = {
        value: PropTypes.string.isRequired,
        language: PropTypes.string
    };

    private codeEl: HTMLElement | null = null;

    public constructor(props: CodeBlocksProps) {
        super(props);
        this.setRef = this.setRef.bind(this);
    }

    public setRef(el: HTMLElement) {
        this.codeEl = el;
    }

    public componentDidMount() {
        this.highlightCode();
    }

    public componentDidUpdate() {
        this.highlightCode();
    }

    private highlightCode() {
        if (this.codeEl) hljs.highlightBlock(this.codeEl);
    }

    public render() {
        return (
            <pre>
                <code
                    ref={this.setRef}
                    className={`language-${this.props.language}`}
                >
                    {this.props.value}
                </code>
            </pre>
        );
    }
}
