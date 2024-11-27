import { Fragment, useState } from 'react';
import { Combobox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { useQuery } from '@tanstack/react-query';
import { getDevices } from '../../../api/Main/Main';
import { Controller } from 'react-hook-form';

export const InputDevicesSelect = ({ control }) => {
  const { data: devices } = useQuery({
    queryKey: ['getDevices'],
    queryFn: getDevices,
  });

  const [query, setQuery] = useState('');

  const filteredDevices =
    query === ''
      ? devices
      : devices?.filter((device) =>
          device.name.toLowerCase().includes(query.toLowerCase())
        );

  return (
    <Controller
      name="device"
      control={control}
      rules={{ required: true }}
      defaultValue=""
      render={({ field: { onChange, value } }) => (
        <Combobox
          value={value}
          onChange={(device) => {
            onChange(device);
            console.log('Selected device:', device);
          }}
        >
          <div className="relative mt-1">
            <div className="relative w-full cursor-default overflow-hidden rounded-lg text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 sm:text-sm">
              <Combobox.Input
                className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
                displayValue={(device) => (device ? device.name : '')}
                onChange={(event) => setQuery(event.target.value)}
              />
              <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </Combobox.Button>
            </div>
            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
              afterLeave={() => setQuery('')}
            >
              <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-50">
                {filteredDevices?.length === 0 && query !== '' ? (
                  <div className="relative cursor-default select-none px-4 py-2 text-gray-700">
                    Dispositivo no encontrado.
                  </div>
                ) : (
                  filteredDevices?.map((device) => (
                    <Combobox.Option
                      key={device.id}
                      className={({ active }) =>
                        `relative cursor-default select-none py-2 pl-10 pr-4 ${
                          active ? 'bg-indigo-600 text-white' : 'text-gray-900'
                        }`
                      }
                      value={device}
                    >
                      {({ selected, active }) => (
                        <>
                          <span
                            className={`block truncate ${
                              selected ? 'font-medium' : 'font-normal'
                            }`}
                          >
                            {device.name}
                          </span>
                          {selected ? (
                            <span
                              className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                active ? 'text-white' : 'text-indigo-600'
                              }`}
                            >
                              <CheckIcon
                                className="h-5 w-5"
                                aria-hidden="true"
                              />
                            </span>
                          ) : null}
                        </>
                      )}
                    </Combobox.Option>
                  ))
                )}
              </Combobox.Options>
            </Transition>
          </div>
        </Combobox>
      )}
    />
  );
};
