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

const BASE_URL = 'http://localhost:8000/api';


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
        await axios.delete(`${BASE_URL}/schedules/${selectedEvent.id}`);
        queryClient.invalidateQueries({ queryKey: ['getSchedules'] });
        setIsPreviewModalOpen(false);
      } catch (error) {
        console.error('Error al eliminar el evento:', error);
      }
    }
  };

  return (
    <>
      {' '}
      <div>
        <button
          className="fixed right-4 top-4 z-20 rounded-md bg-white p-2 text-gray-500 shadow-md lg:hidden"
          onClick={toggleSidebar}
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>
      <div className="flex-1 p-6 lg:pt-6">
        <div className="flex">
          <div>
            <h1 className="mb-6 text-3xl font-bold">Calendario de Riego</h1>
          </div>
          <div>
            <button
              className="fixed right-4 top-4 z-20 rounded-md bg-white p-2 text-gray-500 shadow-md lg:hidden"
              onClick={toggleSidebar}
            >
              <Plus className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="rounded-lg bg-white p-4 shadow-md">
          <FullCalendar
            events={data}
            eventClick={handleEventClick}
            locale={esLocale}
            plugins={[dayGridPlugin, timeGridPlugin, listPlugin]}
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
            height="calc(100vh - 200px)"
          />
        </div>
      </div>{' '}

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
