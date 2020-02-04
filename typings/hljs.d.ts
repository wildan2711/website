declare module 'highlight.js/lib/highlight' {
    import hljs from 'highlight.js';
    export default hljs;
}

declare module 'highlight.js/lib/languages/java' {
    import { HLJSStatic, IModeBase } from 'highlight.js';
    export default (hljs?: HLJSStatic) => IModeBase;
}

declare module 'highlight.js/lib/languages/python' {
    import { HLJSStatic, IModeBase } from 'highlight.js';
    export default (hljs?: HLJSStatic) => IModeBase;
}
