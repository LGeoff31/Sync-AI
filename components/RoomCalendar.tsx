import { useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

type Busy = { start: string; end: string };
type Member = { email: string; name: string | null; busy: Busy[] };

export type RoomCalendarData = {
  members: Member[];
  commonFree: Busy[];
  range?: { timeMin: string; timeMax: string };
};

export default function RoomCalendar({ data }: { data?: RoomCalendarData }) {
  const events = useMemo(() => {
    if (!data) return [] as any[];
    return (data.commonFree || []).map((f) => ({
      title: "Common free",
      start: f.start,
      end: f.end,
      display: "background",
      backgroundColor: "rgba(16,185,129,0.18)",
      borderColor: "rgba(16,185,129,0.35)",
    }));
  }, [data]);

  const defaultDate = useMemo(() => {
    if (data?.range?.timeMin) return new Date(data.range.timeMin);
    return new Date();
  }, [data]);

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="text-sm text-white/70">
          Showing overlap: <span className="text-white">Common free times</span>
        </div>
        {!!data?.range && (
          <div className="text-xs text-white/50">
            Range: {new Date(data.range.timeMin).toLocaleDateString()} —{" "}
            {new Date(data.range.timeMax).toLocaleDateString()}
          </div>
        )}
      </div>
      <div style={{ height: 600 }}>
        <FullCalendar
          plugins={[timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          initialDate={defaultDate}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "timeGridDay,timeGridWeek",
          }}
          events={events}
          nowIndicator={false}
          allDaySlot={false}
          slotDuration="0:30:00"
          height={600}
        />
      </div>
    </div>
  );
}
