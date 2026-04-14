"use client";

import React, { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventClickArg, DatesSetArg } from "@fullcalendar/core";
import { MapPin, Clock, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const capitalizeName = (name: string) => {
  if (!name) return "";
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

interface KegiatanItem {
  id: string;
  judul: string;
  deskripsi?: string | null;
  lokasi?: string | null;
  warna: string;
  tanggalMulai: Date | string;
  tanggalSelesai?: Date | string | null;
}

interface KegiatanCalendarProps {
  kegiatanList: KegiatanItem[];
}

export function KegiatanCalendar({ kegiatanList }: KegiatanCalendarProps) {
  const calendarRef = useRef<FullCalendar>(null);
  const [selectedEvent, setSelectedEvent] = useState<KegiatanItem | null>(null);
  const [currentTitle, setCurrentTitle] = useState("");

  // Convert kegiatan data to FullCalendar events
  const events = kegiatanList.map((k) => {
    const start = new Date(k.tanggalMulai);
    let end: Date | undefined;

    if (k.tanggalSelesai) {
      end = new Date(k.tanggalSelesai);
    }

    return {
      id: k.id,
      title: k.judul,
      start,
      end,
      backgroundColor: k.warna,
      borderColor: k.warna,
      textColor: "#fff",
      extendedProps: {
        deskripsi: k.deskripsi,
        lokasi: k.lokasi,
        warna: k.warna,
        tanggalMulai: k.tanggalMulai,
        tanggalSelesai: k.tanggalSelesai,
      },
    };
  });

  const handleEventClick = (info: EventClickArg) => {
    const props = info.event.extendedProps;
    setSelectedEvent({
      id: info.event.id,
      judul: info.event.title,
      deskripsi: props.deskripsi as string | null,
      lokasi: props.lokasi as string | null,
      warna: props.warna as string,
      tanggalMulai: props.tanggalMulai as string,
      tanggalSelesai: props.tanggalSelesai as string | null,
    });
  };

  const handleDateClick = (info: { date: Date }) => {
    // Find events on this date
    const clickedDate = new Date(info.date);
    clickedDate.setHours(0, 0, 0, 0);

    const eventsOnDate = kegiatanList.filter((k) => {
      const start = new Date(k.tanggalMulai);
      start.setHours(0, 0, 0, 0);
      const end = k.tanggalSelesai ? new Date(k.tanggalSelesai) : start;
      const endDay = new Date(end);
      endDay.setHours(23, 59, 59, 999);

      return clickedDate >= start && clickedDate <= endDay;
    });

    if (eventsOnDate.length === 1) {
      setSelectedEvent(eventsOnDate[0]);
    } else if (eventsOnDate.length > 1) {
      // Show the first one
      setSelectedEvent(eventsOnDate[0]);
    } else {
      setSelectedEvent(null);
    }
  };

  const handleDatesSet = (info: DatesSetArg) => {
    setCurrentTitle(info.view.title);
  };

  const handlePrev = () => {
    calendarRef.current?.getApi().prev();
  };

  const handleNext = () => {
    calendarRef.current?.getApi().next();
  };

  const handleToday = () => {
    calendarRef.current?.getApi().today();
  };

  // Set initial title
  useEffect(() => {
    const api = calendarRef.current?.getApi();
    if (api) {
      setCurrentTitle(api.view.title);
    }
  }, []);

  return (
    <div className="border rounded-xl bg-white shadow-sm overflow-hidden">
      {/* Custom Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b bg-slate-50/50">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            Kalender Kegiatan
          </h3>
          <p className="text-sm text-muted-foreground">
            Lihat jadwal kegiatan organisasi
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={handlePrev}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs font-medium min-w-[80px]"
            onClick={handleToday}
          >
            Hari Ini
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={handleNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Month Title */}
      <div className="px-4 sm:px-6 pt-4 pb-2">
        <h4 className="text-base font-semibold text-slate-800 capitalize">
          {currentTitle}
        </h4>
      </div>

      {/* Calendar + Detail Panel */}
      <div className="flex flex-col lg:flex-row">
        {/* Calendar */}
        <div className="flex-1 px-2 sm:px-4 pb-4 kegiatan-fullcalendar">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={events}
            locale="id"
            headerToolbar={false}
            height="auto"
            dayMaxEvents={3}
            eventClick={handleEventClick}
            dateClick={handleDateClick}
            datesSet={handleDatesSet}
            eventDisplay="block"
            dayHeaderFormat={{ weekday: "short" }}
            moreLinkText={(n) => `+${n} lagi`}
            moreLinkClick="popover"
            eventClassNames="cursor-pointer text-[11px] sm:text-xs font-medium rounded-md shadow-sm px-1.5 py-0.5 border-0 transition-all hover:opacity-80"
            dayCellClassNames={(arg) => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const cellDate = new Date(arg.date);
              cellDate.setHours(0, 0, 0, 0);
              return cellDate.getTime() === today.getTime()
                ? "fc-day-today-custom"
                : "";
            }}
          />
        </div>

        {/* Detail Panel */}
        {selectedEvent && (
          <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l bg-slate-50/30 p-4 sm:p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: selectedEvent.warna }}
                />
                Detail Kegiatan
              </h4>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-1 rounded-md hover:bg-slate-200 transition-colors text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h5 className="font-bold text-slate-900 text-base leading-tight">
                  {capitalizeName(selectedEvent.judul)}
                </h5>
                {selectedEvent.deskripsi && (
                  <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
                    {capitalizeName(selectedEvent.deskripsi)}
                  </p>
                )}
              </div>

              <div className="space-y-2.5">
                <div className="flex items-start gap-2.5 text-sm">
                  <Clock
                    size={15}
                    className="text-slate-400 mt-0.5 shrink-0"
                  />
                  <div className="text-slate-700">
                    <div className="font-medium">
                      {new Date(selectedEvent.tanggalMulai).toLocaleDateString(
                        "id-ID",
                        {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }
                      )}
                    </div>
                    <div className="text-slate-500 text-xs mt-0.5">
                      {new Date(selectedEvent.tanggalMulai).toLocaleTimeString(
                        "id-ID",
                        { hour: "2-digit", minute: "2-digit" }
                      )}
                      {selectedEvent.tanggalSelesai && (
                        <>
                          {" — "}
                          {new Date(selectedEvent.tanggalMulai).toDateString() !==
                          new Date(selectedEvent.tanggalSelesai).toDateString()
                            ? new Date(
                                selectedEvent.tanggalSelesai
                              ).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              }) + ", "
                            : ""}
                          {new Date(
                            selectedEvent.tanggalSelesai
                          ).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {selectedEvent.lokasi && (
                  <div className="flex items-start gap-2.5 text-sm">
                    <MapPin
                      size={15}
                      className="text-slate-400 mt-0.5 shrink-0"
                    />
                    <span className="text-slate-700">
                      {capitalizeName(selectedEvent.lokasi)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
