"use client";

import { useEffect, useRef, useState } from "react";
import type { TransportStatus } from "@pixel-realms/protocol";
import {
  GAME_STATUS_EVENT,
  GAME_TOAST_EVENT,
  type GameStatusDetail,
  type GameToastDetail,
} from "@/game/game-events";
import type { TransportMode } from "@/game/transports/world-transport";

interface NetworkState {
  mode: TransportMode;
  status: TransportStatus;
  ping: number;
}

const STATUS_LABELS: Record<TransportStatus, string> = {
  connecting: "Connexion",
  online: "En ligne",
  reconnecting: "Reconnexion",
  offline: "Hors ligne",
};

export function GameShell() {
  const hostRef = useRef<HTMLDivElement>(null);
  const toastTimerRef = useRef<number | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [network, setNetwork] = useState<NetworkState>({
    mode: "local-authority",
    status: "connecting",
    ping: 0,
  });

  useEffect(() => {
    const handleStatus = (event: Event) => {
      setNetwork((event as CustomEvent<GameStatusDetail>).detail);
    };
    const handleToast = (event: Event) => {
      const { message } = (event as CustomEvent<GameToastDetail>).detail;
      setToast(message);
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current);
      }
      toastTimerRef.current = window.setTimeout(() => setToast(null), 1_900);
    };

    window.addEventListener(GAME_STATUS_EVENT, handleStatus);
    window.addEventListener(GAME_TOAST_EVENT, handleToast);
    return () => {
      window.removeEventListener(GAME_STATUS_EVENT, handleStatus);
      window.removeEventListener(GAME_TOAST_EVENT, handleToast);
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let game: { destroy(removeCanvas: boolean): void } | null = null;
    let cancelled = false;

    async function bootGame() {
      const host = hostRef.current;
      if (!host) return;

      try {
        const { createPixelRealmsGame } = await import("@/game/create-game");
        if (cancelled) return;
        game = createPixelRealmsGame(host);
        window.requestAnimationFrame(() => {
          if (!cancelled) setReady(true);
        });
      } catch (bootError) {
        console.error("Unable to boot Pixel Realms", bootError);
        if (!cancelled) {
          setError("Le moteur du jeu n’a pas pu démarrer sur cet appareil.");
        }
      }
    }

    void bootGame();

    return () => {
      cancelled = true;
      game?.destroy(true);
    };
  }, []);

  const modeLabel =
    network.mode === "websocket" ? "Serveur MMO" : "Simulation autoritaire";
  const pingLabel = network.ping > 0 ? ` · ${network.ping} ms` : "";

  return (
    <main className="game-shell" aria-label="Pixel Realms MMO">
      <div ref={hostRef} className="game-canvas-host" />

      <div className={`game-hud ${ready ? "game-hud--visible" : ""}`}>
        <section className="game-status-card" aria-label="État du jeu">
          <div className="game-status-emblem" aria-hidden="true">
            PR
          </div>
          <div className="game-status-copy">
            <strong>Pixel Realms</strong>
            <span>Le Passage d’Émeraude</span>
            <small>
              <i
                className={`network-dot network-dot--${network.status}`}
                aria-hidden="true"
              />
              {modeLabel} · {STATUS_LABELS[network.status]}
              {pingLabel}
            </small>
          </div>
        </section>

        <div className="game-control-hint">
          <span aria-hidden="true">✦</span>
          Touchez le sol pour vous déplacer
        </div>

        <div className={`game-toast ${toast ? "game-toast--visible" : ""}`}>
          {toast}
        </div>
      </div>

      <div
        className={`game-loading-screen ${ready && !error ? "game-loading-screen--hidden" : ""}`}
        aria-live="polite"
      >
        <div className="game-loading-emblem" aria-hidden="true">
          PR
        </div>
        <h1>Pixel Realms</h1>
        <p>{error ?? "Ouverture du Passage d’Émeraude…"}</p>
        {!error && <div className="game-loading-bar" aria-hidden="true" />}
      </div>
      <noscript>JavaScript est nécessaire pour lancer le jeu.</noscript>
    </main>
  );
}
