import React, { useState } from 'react';
import Link from "next/link";
import {useRouter} from 'next/navigation'

function LocationForm({type}) {
  const router = useRouter();
  const [locationData, setLocationData] = useState({
    name: '',
    address: '',
    daysOfWeek: [
      { day: 'pon', groups: [] },
      { day: 'wt', groups: [] },
      { day: 'śr', groups: [] },
      { day: 'czw', groups: [] },
      { day: 'pt', groups: [] },
      { day: 'sob', groups: [] },
      { day: 'ndz', groups: [] },
      // Dodaj resztę dni tygodnia
    ],
  });

  const [groupData, setGroupData] = useState({
    name: '',
  });

  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    setLocationData({ ...locationData, [name]: value });
  };

  const handleGroupChange = (e) => {
    const { name, value } = e.target;
    setGroupData({ ...groupData, [name]: value });
  };

  const handleDayCheckboxChange = (day) => (e) => {
    const { checked } = e.target;
    setLocationData((prevData) => {
      const updatedDaysOfWeek = prevData.daysOfWeek.map((item) => {
        if (item.day === day) {
          if (checked) {
            return { ...item, groups: [...item.groups, groupData.name] };
          } else {
            return { ...item, groups: item.groups.filter((group) => group !== groupData.name) };
          }
        }
        return item;
      });
      return { ...prevData, daysOfWeek: updatedDaysOfWeek };
    });
  };

  const handleAddGroup = () => {
    if (groupData.name) {
      setLocationData((prevData) => {
        const updatedGroups = prevData.daysOfWeek.map((item) => {
          if (item.groups.includes(groupData.name)) {
            return { ...item, groups: [...item.groups] };
          }
          return item;
        });
        return {
          ...prevData,
          daysOfWeek: updatedGroups,
        };
      });
      setGroupData({ name: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/loc/new', {
        method: 'POST',
        body: JSON.stringify({
            name: locationData.name,
          address: locationData.address,
          daysOfWeek: locationData.daysOfWeek,
        }),
      
      });
      console.log(locationData);
      if (response.ok) {
        // Pomyślnie dodano lokalizację
        // Tutaj możesz wykonać odpowiednie akcje, np. wyświetlić komunikat o sukcesie
        console.log('Lokalizacja została pomyślnie dodana.');
        router.push('/locations')
      } else {
        // Obsłuż błąd z serwera
        console.error('Wystąpił błąd podczas dodawania lokalizacji.');
      }
    } catch (error) {
      console.error('Wystąpił błąd podczas wysyłania żądania.', error);
    }
  };

  return (
    <section className='w-full max-w-full flex-start flex-col'>
    <h1 className='head_text text-left'>
      <span className='blue_gradient'>{type} Lokalizacje</span>
    </h1>
    <p className='desc text-left max-w-md'>
      {type} lokalizacje w swojej bazie klientów!
    </p>
    <form onSubmit={handleSubmit}
    className='mt-10 w-full max-w-2xl flex flex-col gap-7 glassmorphism'>
    <label>
     <span className='font-satoshi font-semibold text-base text-gray-700'>
        Nazwa lokalizacji:
     </span>
       <input
         type="text"
         name="name"
         placeholder='Nazwa lokalizacji'
         value={locationData.name}
         onChange={handleLocationChange}
         className='form_input'
       />
    </label>
      
    <label>
     <span className='font-satoshi font-semibold text-base text-gray-700'>
        Adres:
     </span>
        <input
          type="text"
          name="address"
          value={locationData.address}
          onChange={handleLocationChange}
          className='form_input'
          placeholder='Adres'
        />
    </label>
    <label>
        <span className='font-satoshi font-semibold text-base text-gray-700'>
         Dodaj grupę:
        </span>
        <input
          type="text"
          name="name"
          value={groupData.name}
          onChange={handleGroupChange}
          className='form_input'
          placeholder='Nazwa grupy'
        />
        <div className='mt-4 flex flex-wrap'>
          {locationData.daysOfWeek.map((dayData) => (
            <div key={dayData.day}  className="checkbox_div">
              <input
                type="checkbox"
                name={dayData.day}
                checked={dayData.groups.includes(groupData.name)}
                onChange={handleDayCheckboxChange(dayData.day)}
                className='checkbox'
              />
              <span className='font-satoshi text-base text-gray-700 pl-2'>{dayData.day}</span>
            </div>
          ))}
        </div>
        <button type="button" onClick={handleAddGroup} className='px-5 py-1.5 text-sm bg-green-600 rounded-full text-white'>
          Dodaj grupę
        </button>
      </label>
      <div className='border-2 rounded-2xl p-2 border-orange-400 '>
        <span className='font-satoshi font-semibold text-base text-gray-700'>Tydzień:</span>
        <ul className='max-w-md divide-y divide-gray-200 dark:divide-gray-700'>
          {locationData.daysOfWeek.map((dayData) => (
            <li key={dayData.day} className='pb-3 sm:pb-4'>
                 <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                        {dayData.day}
                    </div>
                    <div className="flex-1 min-w-0">
                    </div>
                        {dayData.groups.join(', ')}
                    </div>
            </li>
          ))}
        </ul>
      </div>
      <div  className='flex-end mx-3 mb-5 gap-4'>
      <Link href='/locations' className='text-gray-500 text-sm'>
            Cancel
      </Link>
      <button type="submit" className='px-5 py-1.5 text-sm bg-primary-orange rounded-full text-white' onClick={handleSubmit}>Zapisz lokalizację</button>
      </div>
    </form>
    </section>
  );
}

export default LocationForm;
