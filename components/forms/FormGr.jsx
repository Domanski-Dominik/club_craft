import React, { useState,useEffect } from 'react';
import Link from "next/link";
import {useRouter} from 'next/navigation'


function FormGr({type}) {
  const [locations, setLocations] = useState(null)
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedDaysOfWeek, setSelectedDaysOfWeek] = useState('');
  const [days, setDays]= useState();
  const [selectedGroup, setSelectedGroup] = useState('');
  const [groupData, setGroupData] = useState({
    name: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetch('/api/loc');
        const location = await data.json();
        setLocations(location);
        console.log(location)
      } catch (error) {
        console.error('Błąd podczas pobierania danych:', error);
      }
    };

    fetchData();
  }, []);

  const handleLocationChange = (e) => {
    setSelectedLocation(e.target.value);

    const tempDays = locations
    .filter((location) => location._id === e.target.value)
    .map((location) => location.daysOfWeek);
    const temp2Days = tempDays[0];
    setDays(temp2Days);
    console.log(temp2Days);
    setSelectedDaysOfWeek('')
  };

  const handleDaysOfWeekChange = (e) => {
    setSelectedDaysOfWeek(e.target.value);
    console.log('Wybrany dzień to ' + e.target.value);
    const groups = days.find(day => day._id === e.target.value)?.groups;
    console.log(groups)
    setGroupData(groups)
  };

  const handleGroupChange = (e) => {
    setSelectedGroup(e.target.value)
    console.log('Wybrana grupa to ' + e.target.value);
    console.log(groupData)
  };

  const handleSubmit = async (e) => {

  };

  return (
    <section className='w-full max-w-full flex-start flex-col'>
    <h1 className='head_text text-left'>
      <span className='blue_gradient'>{type} Grupę</span>
    </h1>
    <p className='desc text-left max-w-md'>
      {type} grupę w swojej bazie klientów!
    </p>
    <form onSubmit={handleSubmit}
    className='mt-5 w-full max-w-2xl flex flex-col gap-7 glassmorphism'>
   <label>
          <span className='font-satoshi font-semibold text-base text-gray-700'>
            Wybierz Lokalizacje
          </span>
          <div>
          <select 
           value={selectedLocation}
           onChange={handleLocationChange}
           className='form_input'
          >
            <option value='' className='form_input'>Wybierz Lokalizacje</option>
            {locations !== null &&
            locations.map((location) => (
            <option key={location._id} value={location._id} className="form_input">
              {location.name}
            </option>
            ))}
          </select>
          </div>
    </label>
    {selectedLocation !== '' &&(
            <label>
              <div>
                <span className='font-satoshi font-semibold text-base text-gray-700'>
                 Wybierz Dzień
                </span>
                <select 
                value={selectedDaysOfWeek} 
                onChange={handleDaysOfWeekChange}
                className='form_input'
                >
                  <option value='' className='form_input'>Wybierz Dzień</option>
                  {
                  days.map(daysOfWeek=>{
                      return(<option 
                      key={daysOfWeek._id} 
                      value={daysOfWeek._id} 
                      className="form_input">
                      {daysOfWeek.day}
                      </option>
                      );
                  })}
                </select>
              </div>
            </label>
      )}
    {selectedDaysOfWeek !== '' &&(
            <label>
              <div>
                <span className='font-satoshi font-semibold text-base text-gray-700'>
                 Nazwij grupę
                </span>
                <input 
                value={selectedGroup} 
                onChange={handleGroupChange}
                className='form_input'
                type='text'
                placeholder='Nazwa grupy'
                required
                />
              </div>
            </label>
          )}
      {selectedDaysOfWeek !== '' && (
        <div className='border-2 rounded-2xl p-2 border-orange-400 '>
        <span className='font-satoshi font-semibold text-base text-gray-700'>Grupy:</span>
        <ul className='max-w-md divide-y divide-gray-200 dark:divide-gray-700'>
          {groupData.map(gr => (
            <li key={gr} className='pb-3 sm:pb-4'>
                 {gr}
            </li>
          ))}
        </ul>
      </div>
          )}
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

export default FormGr;
