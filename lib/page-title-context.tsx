"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

const PageTitleContext = createContext<{
  title: string;
  setTitle: (t: string) => void;
}>({ title: "", setTitle: () => {} });

export function PageTitleProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState("");
  return (
    <PageTitleContext.Provider value={{ title, setTitle }}>
      {children}
    </PageTitleContext.Provider>
  );
}

export function usePageTitle() {
  return useContext(PageTitleContext);
}

export function PageTitleSetter({ title }: { title: string }) {
  const { setTitle } = usePageTitle();
  useEffect(() => { setTitle(title); }, [title, setTitle]);
  return null;
}
