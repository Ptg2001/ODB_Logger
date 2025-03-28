// This file contains global type declarations for the project

declare module 'puppeteer' {
  export interface Page {
    goto(url: string, options?: {
      waitUntil?: string | string[];
      timeout?: number;
    }): Promise<Response | null>;
    setViewport(options: {width: number, height: number}): Promise<void>;
    waitForSelector(selector: string, options?: {
      timeout?: number;
    }): Promise<any>;
    setDefaultNavigationTimeout(timeout: number): void;
    evaluate<T>(fn: (...args: any[]) => Promise<T> | T, ...args: any[]): Promise<T>;
    pdf(options?: {
      format?: string;
      printBackground?: boolean;
      margin?: {
        top?: string;
        right?: string;
        bottom?: string;
        left?: string;
      }
    }): Promise<Buffer>;
    close(): Promise<void>;
    on(event: string, callback: (...args: any[]) => void): void;
  }
  
  export interface Response {
    ok(): boolean;
    status(): number;
  }
  
  export interface Browser {
    newPage(): Promise<Page>;
    close(): Promise<void>;
  }
  
  export interface LaunchOptions {
    headless?: boolean | string;
    args?: string[];
    executablePath?: string;
    ignoreDefaultArgs?: string[] | boolean;
    pipe?: boolean;
  }
  
  export default {
    launch(options?: LaunchOptions): Promise<Browser>;
  }
} 