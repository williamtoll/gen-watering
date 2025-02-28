import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllSchedules } from './api/Main/Main';
import ReactLoading from 'react-loading';
import { defaultThemeBlue, sheduleItemsMap } from './Utils/Utils';
import { SideForm } from './components/SideForm/SideForm';
import { Calendar } from './components/Calendar/Calendar';
import { apiResponse } from './Types/Types';
import { SavedCompletedModal } from './components/SavedCompletedModal/SavedCompletedModal';
import { ToastContainer } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';

const App: React.FC = () => {
  const { isPending, error, data, isLoading } = useQuery<apiResponse>({
    queryKey: ['getSchedules'],
    queryFn: getAllSchedules,
  });
  const CalendarData = sheduleItemsMap(data as apiResponse);

  if (isPending || isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <ReactLoading
          type="spinningBubbles"
          color={defaultThemeBlue}
          height={375}
          width={175}
        />
      </div>
    );
  }

  if (error) return <div>{'An error has occurred: ' + error.message}</div>;

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <SideForm />
      <Calendar data={CalendarData} />
      <SavedCompletedModal />
      <div>
        <ToastContainer />
      </div>
    </div>
  );
};

export default App;
