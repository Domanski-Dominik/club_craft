'use client'

import { createTheme, ThemeOptions, ThemeProvider} from "@mui/material/styles"
import Nav from '@/components/Nav'
import { NextAppDirEmotionCacheProvider } from "./EmotionCache"
import CssBaseline from "@mui/material/CssBaseline"
import {Roboto} from 'next/font/google'
import { useState,useEffect } from "react"


const roboto = Roboto({
  weight: ["300","400", "500", "700"],
  style: ["italic","normal"],
  subsets: ["latin"]
});

const ThemeOptions :ThemeOptions ={
  typography: {
    fontFamily: roboto.style.fontFamily,
    fontSize: 12,
  },
  palette: {
    background: {
        // pink
        default: "#e1bee7",
        
      },
      primary: {
        light: '#af52bf',
        main: '#9c27b0',
        dark: '#6d1b7b',
        contrastText: '#fff',
      },
      secondary: {
        light: '#6573c3',
        main: '#3f51b5',
        dark: '#2c387e',
        contrastText: '#000',
      },
      text: {
        primary: "#300000",
      },
  }, 
  components: {
    MuiBottomNavigation: {
        
    }
  }
};
const lightTheme:ThemeOptions = createTheme({
    // Twój motyw jasny
  });
  const darkTheme:ThemeOptions = createTheme({
    // Twój motyw ciemny
  });
const theme = createTheme(ThemeOptions);

export default function ThemeRegistry({children}: {children: React.ReactNode}){
    return (
        <NextAppDirEmotionCacheProvider options={{key: 'mui'}}>
            <ThemeProvider theme={theme}>
                <CssBaseline/>
                {children}
            </ThemeProvider>
        </NextAppDirEmotionCacheProvider>
    );
}