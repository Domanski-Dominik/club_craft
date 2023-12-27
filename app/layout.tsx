import "@/styles/globals.css";
import type { Metadata } from "next";
import TopNav from "@/components/navigation/Nav";
import Provider from "@/context/Provider";
import BottomNav from "@/components/navigation/BottomNav";
import ThemeRegistry from "@/theme/ThemeRegistry";
import { Container } from "@mui/material";

export const metadata: Metadata = {
  title: "Sportify",
  description: "Organize, rule, and much more!",
};
export default function RootLayout({
  children,
}: {
  children?: React.ReactNode;
}) {
  //if (status==="loading") return <div>Loading...</div>;

  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
      </head>
      <ThemeRegistry>
        <body>
          <Provider>
            <TopNav />
            <Container
              component="main"
              sx={{
                position: "relative",
                zIndex: "10",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
                marginLeft: "auto",
                marginRight: "auto",
                paddingLeft: "2px",
                paddingRight: "2px",
                paddingTop: "7rem",
                paddingBottom: "7rem",
                minHeight: "100vh",
                maxWidth: "64rem",
              }}>
              {children}
            </Container>
            <BottomNav />
          </Provider>
        </body>
      </ThemeRegistry>
    </html>
  );
}
