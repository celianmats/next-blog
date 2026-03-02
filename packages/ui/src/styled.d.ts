import 'styled-components';

declare module 'styled-components' {
    export interface DefaultTheme {
        colors: {
            primary: string;
            secondary: string;
            background: string;
            surface: string;
            text: string;
            border: string;
            error: string;
            success: string;
            [key: string]: string;
        };
    }
}
