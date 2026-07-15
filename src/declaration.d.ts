declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}
