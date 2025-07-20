import '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Theme {
    transitions: {
      create: (props: string | string[], options?: object) => string;
      duration: {
        enteringScreen: number;
        leavingScreen: number;
      };
      easing: {
        sharp: string;
        easeOut: string;
        easeIn: string;
        easeInOut: string;
      };
    };
    breakpoints: {
      up: (key: string) => string;
      down: (key: string) => string;
    };
    spacing: (...values: number[]) => string | number;
    mixins: {
      toolbar: object;
    };
  }
  interface ThemeOptions {
    transitions?: {
      create?: (props: string | string[], options?: object) => string;
      duration?: {
        enteringScreen?: number;
        leavingScreen?: number;
      };
      easing?: {
        sharp?: string;
        easeOut?: string;
        easeIn?: string;
        easeInOut?: string;
      };
    };
    breakpoints?: {
      up?: (key: string) => string;
      down?: (key: string) => string;
    };
    spacing?: (...values: number[]) => string | number;
    mixins?: {
      toolbar?: object;
    };
  }
}