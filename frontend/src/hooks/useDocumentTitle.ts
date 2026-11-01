import { useEffect } from "react";

const BASE_TITLE = "ShopMind AI";

export const useDocumentTitle = (title?: string | null) => {
  useEffect(() => {
    document.title = title ? `${title} · ${BASE_TITLE}` : `${BASE_TITLE} — Intelligent Shopping`;
  }, [title]);
};
