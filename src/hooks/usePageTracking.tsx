import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const SESSION_KEY = "suina_session_id";
const ANON_DOMAIN = "anonymous.local";

const getSessionId = () => {
  try {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = (crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`);
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
};

export const PageTracker = () => {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith("/admin")) return;

    const sessionId = getSessionId();
    const userName = localStorage.getItem("suina_user_name") || "Visitante anônimo";
    const userEmail = localStorage.getItem("suina_user_email") || `${sessionId}@${ANON_DOMAIN}`;

    supabase
      .from("acessos_pagina")
      .insert({ page: path, user_name: userName, user_email: userEmail })
      .then(() => {}, () => {});
  }, [location.pathname]);

  return null;
};
