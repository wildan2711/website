import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Header } from 'semantic-ui-react';
import CodeBlock from './CodeBlock';

const imageSizeRegex = /_33B2BF251EFD_([0-9]+x|x[0-9]+|[0-9]+x[0-9]+)$/;
const imagePreprocessor = (source: string) =>
  source.replace(
    /(!\[[^\]]*\]\([^)\s]+) =([0-9]+x|x[0-9]+|[0-9]+x[0-9]+)\)/g,
    '$1_33B2BF251EFD_$2)'
  );

function imageRenderer({ src, ...props }: { src: string; props: any }) {
  const match = imageSizeRegex.exec(src);

  if (!match) {
    return <img src={src} {...props} />;
  }

  const [width, height] = match[1]
    .split('x')
    .map(s => (s === '' ? undefined : Number(s)));
  return (
    <img
      src={src.replace(imageSizeRegex, '')}
      width={width}
      height={height}
      {...props}
    />
  );
}

function headerRenderer({
  level,
  children
}: {
  level: number;
  children: React.Component<
    { nodeKey: string; children: string; value: string },
    {}
  >[];
}) {
  const anchor = encodeURIComponent(
    children[0].props.value
      .split(' ')
      .join('-')
      .replace('.', '')
      .toLowerCase()
  );
  return (
    <a href={`#${anchor}`} name={anchor}>
      <Header as={`h${level}`}>{children}</Header>
    </a>
  );
}

const Markdown = ({
  source,
  className,
  ...props
}: {
  source?: string;
  className: string;
  props?: any;
}) => {
  const renderers: { [nodeType: string]: React.ElementType } = {};

  source = imagePreprocessor(source || '');
  renderers['image'] = imageRenderer;
  renderers['code'] = CodeBlock;
  renderers['heading'] = headerRenderer;

  return (
    <ReactMarkdown
      source={source}
      renderers={renderers}
      className={className}
      {...props}
    />
  );
};

export default Markdown;
