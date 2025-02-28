import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import esLocale from '@fullcalendar/core/locales/es';
import { useIsMobile } from '../../Hooks/useIsMobile/useIsMobile';
import { Plus } from 'lucide-react';
import { scheduleItem } from '../../Types/Types';
import { useApp } from '../../context/AppProvider/AppProvider';
import { EventClickArg } from '@fullcalendar/core/index.js';
import { EditModal } from '../EditModal/EditModal';
import { EditForm } from '../EditForm/EditForm';
import { PreviewModal } from '../PreviewModal/PreviewModal';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';
import { BASE_URL } from '../../api/Main/Main';
import rrulePlugin from '@fullcalendar/rrule';

export const Calendar: React.FC<{ data: scheduleItem[] }> = ({ data }) => {
  const { toggleSidebar } = useApp();
  const isMobile = useIsMobile();
  const [selectedEvent, setSelectedEvent] = useState<scheduleItem | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = data.find((item) => item.id === clickInfo.event.id);
    if (event) {
      setSelectedEvent(event);
      setIsPreviewModalOpen(true);
    }
  };

  const handleEdit = () => {
    setIsPreviewModalOpen(false);
    setIsEditModalOpen(true);
  };

  const handleDelete = async () => {
    if (selectedEvent) {
      try {
        await axios.delete(`${BASE_URL}schedules/${selectedEvent.id}`);
        queryClient.invalidateQueries({ queryKey: ['getSchedules'] });
        setIsPreviewModalOpen(false);
      } catch (error) {
        console.error('Error al eliminar el evento:', error);
      }
    }
  };
  return (
    <>
      <div className="flex-1 pt-2 px-2">
        <div className="rounded-lg bg-white shadow-md relative ">
          <FullCalendar
            eventDidMount={(info) => {
              if (info.el.offsetHeight < 25) {
                info.el.style.minHeight = '25px';
              }
            }}
            eventTimeFormat={
              isMobile
                ? { hour: 'numeric', minute: '2-digit' }
                : { hour: 'numeric', minute: '2-digit' }
            }
            events={data}
            eventClick={handleEventClick}
            locale={esLocale}
            plugins={[dayGridPlugin, timeGridPlugin, listPlugin, rrulePlugin]}
            initialView={isMobile ? 'listWeek' : 'dayGridMonth'}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
            }}
            buttonText={{
              today: 'Hoy',
              month: 'Mes',
              week: 'Semana',
              day: 'Día',
              list: 'Lista',
            }}
            views={{
              dayGridMonth: {
                titleFormat: { month: 'long', year: 'numeric' },
              },
              timeGridWeek: {
                titleFormat: { month: 'long', year: 'numeric', day: 'numeric' },
              },
              timeGridDay: {
                titleFormat: { month: 'long', year: 'numeric', day: 'numeric' },
              },
              listWeek: {
                titleFormat: { month: 'long', year: 'numeric', day: 'numeric' },
              },
            }}
            height="100vh"
          />
          <button
            className="fixed bottom-4 right-4 z-20 rounded-full bg-blue-600 p-4 text-white shadow-md hover:bg-blue-500 lg:hidden"
            onClick={toggleSidebar}
          >
            <Plus className="h-6 w-6" />
          </button>
        </div>
      </div>

      {isPreviewModalOpen && selectedEvent && (
        <PreviewModal
          isOpen={isPreviewModalOpen}
          onClose={() => setIsPreviewModalOpen(false)}
          event={selectedEvent}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
      {isEditModalOpen && selectedEvent && (
        <EditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
        >
          <EditForm
            eventData={selectedEvent}
            onClose={() => setIsEditModalOpen(false)}
          />
        </EditModal>
      )}
    </>
  );
};
