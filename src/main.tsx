import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { StoryViewer } from "@/components/story-viewer";
import { TooltipProvider } from "@/components/ui/tooltip";
import "@fontsource-variable/geist";
import "@fontsource-variable/geist-mono";
import "@xyflow/react/dist/style.css";
import "./globals.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TooltipProvider>
      <StoryViewer />
    </TooltipProvider>
  </StrictMode>,
);
