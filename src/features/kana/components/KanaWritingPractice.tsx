"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import styles from "./Kana.module.scss";

type KanaWritingPracticeProps = Readonly<{
  kana: string;
}>;

type DrawingPoint = {
  x: number;
  y: number;
};

export function KanaWritingPractice({ kana }: KanaWritingPracticeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activePointerIdRef = useRef<number | null>(null);
  const strokesRef = useRef<DrawingPoint[][]>([]);
  const [isWritingOpen, setIsWritingOpen] = useState(false);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    const width = Math.max(1, Math.round(rect.width * ratio));
    const height = Math.max(1, Math.round(rect.height * ratio));

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, rect.width, rect.height);

    drawGuide(context, rect.width, rect.height, kana);
    drawStrokes(context, strokesRef.current);
  }, [kana]);

  const clearDrawing = useCallback(() => {
    strokesRef.current = [];
    drawCanvas();
  }, [drawCanvas]);

  useEffect(() => {
    if (!isWritingOpen) {
      return;
    }

    const frame = requestAnimationFrame(drawCanvas);
    window.addEventListener("resize", drawCanvas);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", drawCanvas);
    };
  }, [drawCanvas, isWritingOpen]);

  function getCanvasPoint(event: ReactPointerEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect();

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLCanvasElement>) {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    activePointerIdRef.current = event.pointerId;
    strokesRef.current = [...strokesRef.current, [getCanvasPoint(event)]];
    drawCanvas();
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (activePointerIdRef.current !== event.pointerId) {
      return;
    }

    event.preventDefault();
    const currentStroke = strokesRef.current.at(-1);

    if (!currentStroke) {
      return;
    }

    currentStroke.push(getCanvasPoint(event));
    drawCanvas();
  }

  function finishPointer(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (activePointerIdRef.current !== event.pointerId) {
      return;
    }

    event.preventDefault();
    activePointerIdRef.current = null;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  return (
    <section className={styles.writingSection} aria-label="Kana writing practice">
      <div className={styles.writingHeader}>
        <h3>쓰기 연습</h3>
        <div className={styles.writingActions}>
          {isWritingOpen ? (
            <button
              className={styles.secondaryButton}
              type="button"
              onClick={clearDrawing}
            >
              다시 쓰기
            </button>
          ) : null}
          <button
            className={styles.secondaryButton}
            type="button"
            aria-expanded={isWritingOpen}
            aria-controls={`${kana}-writing-panel`}
            onClick={() => setIsWritingOpen((value) => !value)}
          >
            {isWritingOpen ? "쓰기 닫기" : "쓰기"}
          </button>
        </div>
      </div>

      {isWritingOpen ? (
        <div className={styles.writingBody} id={`${kana}-writing-panel`}>
          <canvas
            ref={canvasRef}
            className={styles.writingCanvas}
            aria-label={`${kana} writing canvas`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={finishPointer}
            onPointerCancel={finishPointer}
            onPointerLeave={finishPointer}
          />
        </div>
      ) : null}
    </section>
  );
}

function drawGuide(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  kana: string,
) {
  context.save();
  context.fillStyle = "rgba(23, 32, 51, 0.12)";
  context.font = `900 ${Math.round(Math.min(width, height) * 0.62)}px sans-serif`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(kana, width / 2, height / 2 + height * 0.02);
  context.restore();
}

function drawStrokes(
  context: CanvasRenderingContext2D,
  strokes: DrawingPoint[][],
) {
  context.save();
  context.strokeStyle = "#2563eb";
  context.lineWidth = 8;
  context.lineCap = "round";
  context.lineJoin = "round";

  for (const stroke of strokes) {
    if (stroke.length === 0) {
      continue;
    }

    context.beginPath();
    context.moveTo(stroke[0].x, stroke[0].y);

    for (const point of stroke.slice(1)) {
      context.lineTo(point.x, point.y);
    }

    if (stroke.length === 1) {
      context.lineTo(stroke[0].x + 0.1, stroke[0].y + 0.1);
    }

    context.stroke();
  }

  context.restore();
}
