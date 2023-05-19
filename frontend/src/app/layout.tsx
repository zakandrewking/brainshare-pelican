// Make sure nothing is SSG because the parallel routes, (e.g. nav) are dynamic
export const revalidate = 10;

import "./globals.css";
import "@fortawesome/fontawesome-svg-core/styles.css";

import { Inter } from "next/font/google";
import { ReactNode } from "react";

import { config as faConfig } from "@fortawesome/fontawesome-svg-core";

import ClientSideDrawerHandler from "./components/ClientSideDrawerHandler";
import NavigationProgress from "./components/NavigationProgress";
import SideMenu from "./components/SideMenu";
import { AuthProvider } from "./supabase/auth";
import { composeProviders } from "./util";

// Tell Font Awesome to skip adding the CSS automatically since it's already
// imported above
faConfig.autoAddCss = false;

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout(props: {
  children: ReactNode;
  sideMenuDynamic: ReactNode;
}) {
  const Providers = composeProviders([AuthProvider]);

  return (
    <Providers>
      <html lang="en">
        <body className={inter.className}>
          <NavigationProgress />
          <div className="drawer drawer-mobile">
            <input
              id="top-nav-drawer"
              type="checkbox"
              className="drawer-toggle"
            />
            <ClientSideDrawerHandler />
            <div className="drawer-content">
              <nav className="navbar border-b">
                <label
                  htmlFor="top-nav-drawer"
                  className="btn btn-square btn-ghost lg:hidden"
                >
                  <svg
                    width="20"
                    height="20"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="inline-block w-6 h-6 stroke-current"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16"
                    ></path>
                  </svg>
                </label>
                <div className="px-2 mx-2">
                  <h1
                    style={{
                      fontSize: "30px",
                      fontWeight: "bolder",
                    }}
                  >
                    Pelican
                  </h1>
                </div>
              </nav>
              <main className="p-6">{props.children}</main>
            </div>
            <div className="drawer-side">
              <label htmlFor="top-nav-drawer" className="drawer-overlay" />
              <SideMenu>{props.sideMenuDynamic}</SideMenu>
            </div>
          </div>
        </body>
      </html>
    </Providers>
  );
}
