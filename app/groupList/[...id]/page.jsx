'use client'

import GoBack from '@components/GoBack';
import ParticipantList from '@components/ParticipantList';
import { useSession } from 'next-auth/react';
import Loading from '@components/Loading';

import {useEffect,useState, forwardRef} from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import pl from 'date-fns/locale/pl';
import { getDay } from 'date-fns';
import Login from '@components/Login';




const GroupList = ({params}) => {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [list, setList] = useState(null)
  const [allLocs,setAllLocs] = useState();
  const {data:session,status }= useSession();
  const [loading, setLoading] = useState(true)


  useEffect(() => {
    const fetchGroups = async () => {
      let decodedParams = params.id.map((item, index) => {
        if (index === 1) {
            item = decodeURIComponent(item);
            item = item.replace('%', ':');
        }
        return item;
      });
      let result = decodedParams.join('/');

      const response = await fetch(`/api/grLst/${result}`);
      const data = await response.json();

      console.log(data)
      setList(data);
      setLoading(false);
    };

    if (params?.id) fetchGroups();
  }, [params.id]);

  const fetchLoc = async () => {
    const response = await fetch('/api/loc');
    const loc = await response.json();

    setAllLocs(loc);
    console.log(loc)
    console.log(params.id[0])
  };

  useEffect(() => {
    fetchLoc();
  
  }, []);

  const isSelectedDay = (date) => {
    const day = getDay(date);
    return day !== 0;
  };
  const ExampleCustomInput = forwardRef(({ value, onClick }, ref) => (
    <button className="border-2 border-black rounded-full text-center px-2 bg-transparent text-xl" onClick={onClick} ref={ref}>
      {value}
    </button>
  ));

  if(status === "authenticated"){
    return (
      <>
      {loading? (
         <Loading />
      ) : (<>
      <GoBack />
      <div className='absolute top-[80px] right-5'><DatePicker 
       selected={selectedDate} 
       onChange={(date) => setSelectedDate(date)}
       closeOnScroll={true}
       filterDate={isSelectedDay}
       todayButton="Dziś"
       locale={pl}
       calendarStartDay={1}
       dateFormat="P"
       customInput={<ExampleCustomInput />}
      />
      </div>
      <section className='absolute top-[125px]'>
  
      <div>
        {list !==null &&(
      <ParticipantList 
        participants={list}
        selectedDate={selectedDate}
      />
      )}
      </div>
      
      </section>
      </>
      )}
      </>
    )
  };
  return <Login />;
}

export default GroupList