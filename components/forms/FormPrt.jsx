import Link from "next/link";
import { useState,useEffect } from 'react'

const fetchLocationsAndGroups = async () => {
  try {
      const locationsResponse = await fetch('/api/loc'); //Pobierz dane lokalizacji
      const locationsData = await locationsResponse.json();


      return {locations: locationsData};
  } catch (error) {
    console.error('Błąd podczas pobierania danych:', error);
  }
};

const FormPrt = ({ type, participant, setParticipant, submitting, handleSubmit }) => {
  const [locationsAndGroups, setLocationsAndGroups] = useState({
    locations: [],
  })
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedDaysOfWeek, setSelectedDaysOfWeek] = useState('');
  const [days, setDays]= useState();
  const [selectedGroup, setSelectedGroup] = useState('');

useEffect(() => {
  const fetchData = async () => {
    const data = await fetchLocationsAndGroups();
    setLocationsAndGroups(data);
  };

  fetchData();
}, []);

const handleLocationChange = (e) => {
  setSelectedLocation(e.target.value);

  const tempDays = locationsAndGroups.locations
  .filter((location) => location._id === e.target.value)
  .map((location) => location.daysOfWeek);
  const temp2Days = tempDays[0];
  setDays(temp2Days);
  console.log(temp2Days);
};

const handleDaysOfWeekChange = (e) => {
  setSelectedDaysOfWeek(e.target.value);
  console.log('Wybrany dzień to ' + e.target.value);
};

const handleGroupChange = (e) => {
  setSelectedGroup(e.target.value);
  console.log('Wybrana grupa to ' + e.target.value);
  setParticipant({...participant,gr: [{name:e.target.value, day:selectedDaysOfWeek}]});
  console.log(participant)
};

  return (
    <section className='w-full max-w-full flex-start flex-col px-2'>
      <h1 className='head_text text-left'>
        <span className='blue_gradient'>{type} Uczestnika</span>
      </h1>
      <p className='desc text-left max-w-md'>
        {type} uczestnika w swojej bazie klientów!
      </p>

      <form
        onSubmit={handleSubmit}
        className='mt-5 w-full max-w-2xl flex flex-col gap-7 glassmorphism'
      >
        <label>
          <span className='font-satoshi font-semibold text-base text-gray-700'>
            Imię uczestnika
          </span>
          <input
            value={participant.name}
            onChange={(e) => setParticipant({ ...participant, name: e.target.value })}
            type='text'
            placeholder='Imię'
            required
            className='form_input'
            />
        </label>

        <label>
          <span className='font-satoshi font-semibold text-base text-gray-700'>
            Nazwisko
          </span>
          <input
            value={participant.surname}
            onChange={(e) => setParticipant({ ...participant, surname: e.target.value })}
            type='text'
            placeholder='Nazwisko'
            required
            className='form_input'
          />
        </label>
        <label>
          <span className='font-satoshi font-semibold text-base text-gray-700'>
            Telefon
          </span>
          <input
            value={participant.tel}
            onChange={(e) => setParticipant({ ...participant, tel: e.target.value })}
            type='number'
            placeholder='Podaj numer telefonu'
            className='form_input'
          />
        </label>
        
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
            {locationsAndGroups.locations.map((location) => (
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
                    if(daysOfWeek.groups.length > 0) {
                      return(<option 
                      key={daysOfWeek._id} 
                      value={daysOfWeek._id} 
                      className="form_input">
                      {daysOfWeek.day}
                      </option>
                      );
                    } else {
                      return null;
                    }
                  })}
                </select>
              </div>
            </label>
          )}
          {selectedDaysOfWeek && (
            <label>
              <div>
                <span className='font-satoshi font-semibold text-base text-gray-700'>
                 Wybierz Grupę
                </span>
                <select 
                value={selectedGroup} 
                onChange={handleGroupChange}
                className='form_input'
                >
                  <option value='' className='form_input'>Wybierz Grupę</option>
                  {
                  days.map(daysOfWeek=>{
                    if( daysOfWeek._id === selectedDaysOfWeek) {
                      return(daysOfWeek.groups.map(gr =>(<option 
                      key={gr} 
                      value={gr} 
                      className="form_input">
                      {gr}
                      </option>
                      )));
                    } else {
                      return null;
                    }
                  })}
                </select>
              </div>
            </label>
          )}
        <label>
          <span className='font-satoshi font-semibold text-base text-gray-700'>
            Email
          </span>
          <input
            value={participant.email}
            onChange={(e) => setParticipant({ ...participant, email: e.target.value })}
            type='email'
            placeholder='Podaj @email'
            className='form_input'
          />
        </label>

        <div className='flex-end mx-3 mb-1 gap-4'>
          <Link href='/participants' className='text-gray-500 text-sm'>
            Cancel
          </Link>

          <button
            type='submit'
            disabled={submitting}
            className='px-5 py-1.5 text-sm bg-primary-orange rounded-full text-white'
          >
            {submitting ? `${type}` : type}
          </button>
        </div>
      </form>
    </section>
  );
};

export default FormPrt;