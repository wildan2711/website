import 'react';

declare module 'react' {
  interface StyleHTMLAttributes<T> extends React.HTMLAttributes<T> {
    jsx?: boolean;
    global?: boolean;
  }

  interface AnchorHTMLAttributes<T> extends React.HTMLAttributes<T> {
    name?: string;
  }
}
