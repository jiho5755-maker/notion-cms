"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Square } from "lucide-react";
import { toast } from "sonner";
import { updateTaskTimeTrackingAction } from "@/actions/work";
import { useRouter } from "next/navigation";

interface TimeTrackerProps {
  taskId: string;
  currentTime?: number; // 초 단위
}

interface TimerState {
  taskId: string;
  startTime: number; // timestamp
  accumulatedSeconds: number;
}

export function TimeTracker({ taskId, currentTime = 0 }: TimeTrackerProps) {
  const router = useRouter();
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [accumulatedSeconds, setAccumulatedSeconds] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // localStorage 키
  const STORAGE_KEY = `timer_${taskId}`;

  // 컴포넌트 마운트 시 localStorage 복원
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const state: TimerState = JSON.parse(stored);
        if (state.taskId === taskId) {
          setAccumulatedSeconds(state.accumulatedSeconds);
          setIsRunning(true);
          const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
          setElapsedSeconds(elapsed);
        }
      } catch {
        // 파싱 실패 시 무시
      }
    }
  }, [taskId]);

  // 타이머 실행
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const handleStart = () => {
    const state: TimerState = {
      taskId,
      startTime: Date.now(),
      accumulatedSeconds,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    setIsRunning(true);
    setElapsedSeconds(0);
    toast.success("타이머 시작됨");
  };

  const handlePause = () => {
    setIsRunning(false);
    setAccumulatedSeconds((prev) => prev + elapsedSeconds);
    localStorage.removeItem(STORAGE_KEY);
    toast.info("타이머 일시정지됨");
  };

  const handleStop = async () => {
    setIsRunning(false);
    const totalSeconds = accumulatedSeconds + elapsedSeconds;

    if (totalSeconds > 0) {
      // Server Action 호출
      const result = await updateTaskTimeTrackingAction(taskId, totalSeconds);
      if (result.success) {
        toast.success(`${formatTime(totalSeconds)} 기록됨`);
        setElapsedSeconds(0);
        setAccumulatedSeconds(0);
        localStorage.removeItem(STORAGE_KEY);
        router.refresh();
      } else {
        toast.error(result.error || "시간 기록에 실패했습니다");
      }
    }
  };

  const formatTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const totalSeconds = accumulatedSeconds + elapsedSeconds;

  return (
    <div
      className={`rounded-lg border-t p-3 ${
        isRunning ? "bg-blue-50" : "bg-gray-50"
      }`}
    >
      <div className="mb-2 text-sm text-gray-600">
        ⏱️ 시간 추적 {currentTime > 0 && `(기록: ${formatTime(currentTime)})`}
      </div>

      {/* 타이머 디스플레이 */}
      <div
        className={`mb-3 font-mono text-2xl ${
          isRunning ? "text-blue-600" : "text-gray-600"
        }`}
      >
        {formatTime(totalSeconds)}
      </div>

      {/* 버튼 */}
      <div className="flex gap-2">
        {!isRunning ? (
          <Button onClick={handleStart} size="sm" className="flex-1">
            <Play className="mr-1 h-4 w-4" />
            시작
          </Button>
        ) : (
          <>
            <Button onClick={handlePause} size="sm" variant="outline">
              <Pause className="mr-1 h-4 w-4" />
              일시정지
            </Button>
            <Button onClick={handleStop} size="sm" variant="destructive">
              <Square className="mr-1 h-4 w-4" />
              중지
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
