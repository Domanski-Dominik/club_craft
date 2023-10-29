'use client'

import { faEllipsisVertical,faHandHoldingDollar, faNoteSticky, faPenToSquare, faTrashCan } from "@fortawesome/free-solid-svg-icons"; 
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {useState, useEffect, useRef} from "react";
import format from 'date-fns/format'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import pl from 'date-fns/locale/pl';
import Modal from "../Modal";

const ParticipantList = ({ participants,selectedDate }) => {
  
  //Stany do modali

  const [openPay, setOpenPay] = useState(false)
  const [openNote, setOpenNote] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [amount, setAmount] = useState("");
  const [payNote, setPayNote] = useState("");
  const [note, setNote] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(selectedDate);
  const [editedParticipant, setEditedParticipant] = useState({})
  const [participantss, setParticipantss] = useState(participants)

  // Obecność

  // Sprawdzamy obecność dla każdego uczestnika w tablicy i aktualizujemy stan
  useEffect(() => {
    const updatedPresenceStates = {};
    participants.forEach(participant => {
      const isPresent = participant.presence.some(presence => presence === formattedDate);
      updatedPresenceStates[participant._id] = isPresent;
    });
    setPresenceStates(updatedPresenceStates);
    const sortedParticipants = [...participants].sort((a, b) => {
      const surnameCopmarison = a.surname.localeCompare(b.surname);
      if (surnameCopmarison !== 0) {
        return surnameCopmarison
      }
      return a.name.localeCompare(b.name);});
    setParticipantss(sortedParticipants);
  }, [participants, selectedDate]);

  // Przechowuje informacje o obecności każdego uczestnika
  const [presenceStates, setPresenceStates] = useState({});
  const formattedDate = format(selectedDate, 'dd/MM/yyyy');

  // Odpala opcje po naciśnięciu 3 kropek i przypisuje participanta
  const [showOptions, setShowOptions] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  
  // Rozwijana lista po wciśnieciu 3 kropek
  const toggleOptions = (participant) => {
    setShowOptions(!showOptions);
    setSelectedParticipant(participant);
    console.log(participant)
  };

  // Aktualizujemy stan obecności po zmianie stanu checkboxa

  const handleClick = async (id,formattedDate) => {
    // Zmieniamy stan uczestnika przy kliknięciu checkboxa
    setPresenceStates(prevState => ({
      ...prevState,
      [id]: !prevState[id], // Odwracamy wartość
    }));

    if(presenceStates[id]===false)
    {
      const toDo = 'zapisz';
      console.log('Jest obecna!');
      try {
        const response = await fetch('/api/presence', {
          method: 'PATCH',
          body: JSON.stringify({
              id: id,
              date: formattedDate,
              toDo: toDo,
          }),
        
        });
        if (response.ok) {
          // Pomyślnie dodano obecność
          // Tutaj możesz wykonać odpowiednie akcje, np. wyświetlić komunikat o sukcesie
          console.log(`Obecność dnia ${formattedDate} została pomyślnie dodana`);
        } else {
          // Obsłuż błąd z serwera
          console.error('Wystąpił błąd podczas dodawania obecności.');
        }
      } catch (error) {
        console.error('Wystąpił błąd podczas wysyłania żądania.', error);
      }

    } else {
      const toDo = 'usun';
      console.log('Już nie obecna')
      try {
        const response = await fetch('/api/presence', {
          method: 'PATCH',
          body: JSON.stringify({
              id: id,
              date: formattedDate,
              toDo: toDo,
          }),
        
        });
        if (response.ok) {
          // Pomyślnie usunięto obecność
          console.log(`Obecność dnia ${formattedDate} została pomyślnie usunięta`);
        } else {
          // Obsłuż błąd z serwera
          console.error('Wystąpił błąd podczas usuwania obecności.');
        }
      } catch (error) {
        console.error('Wystąpił błąd podczas wysyłania żądania usunięcia.', error);
      }
  }
  };

  // Obsługa formularza płatności

  const handlePaymentClick = () => {
    // Funkcja do wyświetlania modala po naciśnięciu płatności
    setOpenPay(true);
    setSelectedMonth(selectedDate);
    const formattedDateToPay = format(selectedDate, 'MM/yyyy');
    console.log(formattedDateToPay); 
    if(selectedParticipant.payments.some(pay => pay.month === formattedDateToPay)){
      const payment =selectedParticipant.payments.find(pay => pay.month === formattedDateToPay)
      setAmount(payment.money.slice())
      setPayNote(payment.note.slice())
    } else {
      setAmount("")
      setPayNote("")
    }

    setShowOptions(false);
  };

  const handleMonthChange = (date) => {
    setSelectedMonth(date);
    const formattedDateToPay = format(date, 'MM/yyyy');
    console.log(formattedDateToPay); 
    if(selectedParticipant.payments.some(pay => pay.month === formattedDateToPay)){
      const payment =selectedParticipant.payments.find(pay => pay.month === formattedDateToPay)
      setAmount(payment.money.slice())
      setPayNote(payment.note.slice())
    } else {
      setAmount("")
      setPayNote("")
    }
  };

  const handleAmountChange = (event) => {
    setAmount(event.target.value);
  };

  const handlePayNoteChange = (event) => {
    setPayNote(event.target.value);
  };

  const handleSubmitPay = async (event) => {
    event.preventDefault();

    const formattedMonth = format(selectedMonth, 'MM/yyyy');
    const id = selectedParticipant._id;

    console.log("Wybrany miesiąc:", formattedMonth);
    console.log("Kwota:", amount);
    console.log("Notatka:", payNote);
    const toDo = 'zapisz';
    try {
        const response = await fetch('/api/payment', {
          method: 'PATCH',
          body: JSON.stringify({
              id: id,
              month: formattedMonth,
              money: amount,
              note: payNote,
              toDo: toDo,
          }),
        
        });
        if (response.ok) {
          // Pomyślnie dodano obecność
          // Tutaj możesz wykonać odpowiednie akcje, np. wyświetlić komunikat o sukcesie
          console.log(`Płatność ${amount} została pomyślnie dodana`);
        } else {
          // Obsłuż błąd z serwera
          console.error('Wystąpił błąd podczas dodawania płatności.');
        }} catch (error) {
          console.error('Wystąpił błąd podczas wysyłania żądania.', error);
        }

      // Czyśćmy pola po zakończeniu
      setSelectedMonth(new Date());
      setAmount("");
      setPayNote("");
      setOpenPay(false);
      setShowOptions(false);
  };

  // Obsługa formularza notatki

  const handleNoteClick = () => {
    // Funkcja do wyświetlania modala po naciśnięciu notatki
    setOpenNote(true);
    if(selectedParticipant.note !== null){
      setNote(selectedParticipant.note);
    } else {
      setNote("");
    };
    setShowOptions(!showOptions);
  };

  const handleNoteChange = (event) => {
    setNote(event.target.value);
  };

  const handleSubmitNote = async (event) => {
    event.preventDefault();
    const id = selectedParticipant._id;
    try {
        const response = await fetch('/api/participant/note', {
          method: 'PATCH',
          body: JSON.stringify({
              id: id,
              note: note,
          }),
        
        });
      if (response.ok) {
          // Pomyślnie dodano obecność
          // Tutaj możesz wykonać odpowiednie akcje, np. wyświetlić komunikat o sukcesie
          console.log(`Notatka ${note} została pomyślnie dodana`);
      } else {
          // Obsłuż błąd z serwera
          console.error('Wystąpił błąd podczas dodawania notatki.');
      }} catch (error) {
          console.error('Wystąpił błąd podczas wysyłania żądania.', error);
      }
      setNote("");
      setOpenNote(false)
      setShowOptions(!showOptions);
  };

  // Obsługa formularza edycji uczestnika
 
  const handleEditClick = () => {
    // Funkcja do wyświetlania modala po naciśnięciu Edycji uczestnika
    setOpenEdit(true)
    setShowOptions(!showOptions);
    setEditedParticipant(selectedParticipant)
  };

  const handleNameChange = (event) => {
      setEditedParticipant({...editedParticipant, name: event.target.value});
  };

  const handleSurnameChange = (event) => {
    setEditedParticipant({...editedParticipant, surname: event.target.value});
  };

  const handleTelChange = (event) => {
    setEditedParticipant({...editedParticipant, tel: event.target.value});
  };

  const handleSubmitEdit = async (event) => {
    event.preventDefault();
    const id = editedParticipant._id;
    try {
      const response = await fetch(`/api/participant/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
            name: editedParticipant.name,
            surname: editedParticipant.surname,
            tel: editedParticipant.tel,
        }),
      
      });
    if (response.ok) {
        // Pomyślnie dodano obecność
        // Tutaj możesz wykonać odpowiednie akcje, np. wyświetlić komunikat o sukcesie
        console.log(`Udało sie edytować uczestnika`);
    } else {
        // Obsłuż błąd z serwera
        console.error('Wystąpił błąd podczas edytowania uczestnika.');
    }} catch (error) {
        console.error('Wystąpił błąd podczas wysyłania żądania.', error);
    }
    console.log(editedParticipant);
    const indexToEdit = participantss.findIndex(participant => participant._id === id);
    if(indexToEdit !== -1) {
      participantss[indexToEdit]=editedParticipant;
    } else {
      console.log('Nie znaleziono uczestnika do edycji', indexToEdit)
    }

    setOpenEdit(false);
  };

  const handleDelete = async (event) => {
    event.preventDefault();
    const id = editedParticipant._id;
    try {
      const response = await fetch(`/api/participant/${id}`, {
        method: 'DELETE',
      });
      if(response.ok){
        console.log(`Udało sie usunąć uczestnika`);
      } else {
        // Obsłuż błąd z serwera
        console.error('Wystąpił błąd podczas usuwania uczestnika.');
      }
    } catch (error) {
      console.error('Wystąpił błąd podczas wysyłania żądania.', error);
    }
    setOpenEdit(false);
    const indexToRemove = participants.findIndex(participant => participant._id === id);
    if(indexToRemove !== -1) {
      participants.splice(indexToRemove,1)
    } else {
      console.log('Nie znaleziono uczestnika do usunięcia', indexToRemove)
    }
  };

    return (
        <>
          <table className="w-screen max-w-5xl text-left text-sm table-auto font-normal mb-[10vh]">
            <thead
              className=" border-b bg-transparent font-medium ">
              <tr>
              <th scope="col" className="text-center px-2">#</th>
                <th scope="col" className="py-2">Nazwisko</th>
                <th scope="col" className="py-2">Imię</th>
                <th scope="col" className="py-2 text-center">Obecny</th>
                <th scope="col" className="py-2 "></th>
              </tr>
            </thead>
            <tbody>
              {participantss.map((participant,index) => (
              <tr key={participant._id} 
                className="border-b bg-transparent ">
                  <td 
                   className="text-center font-medium py-2"
                  >
                    {index + 1}
                  </td>
                  <td 
                   className="py-2"
                  >
                    {participant.surname}
                  </td>
                  <td 
                   className="py-2"
                  >
                    {participant.name}
                  </td>
                  <td 
                   className="py-2 text-center "
                  >
                    <input 
                     type="checkbox" 
                     id={participant._id} 
                     className="checkbox" 
                     checked={presenceStates[participant._id] || false}
                     onChange={() => handleClick(participant._id,formattedDate)}
                    />
                  </td>
                  <td 
                   className="py-2 text-center pr-5 "
                   onClick={() => toggleOptions(participant)} 
                  >
                    <FontAwesomeIcon icon={faEllipsisVertical} />
                   {/* Rozwijane płatności, informacje i dodaj notatkę 
                   jęsli ktoś zalega z płatnościa po 10 podświetl nazwisko na czerwono
                   */ }
                    {showOptions && selectedParticipant === participant && (
                      <div className={`absolute ${participants.length - index <= 3 && participants.length >= 10 ? '-translate-y-[9.75rem]' : ''} right-0 mt-2 w-48 bg-gray-100 rounded-lg shadow-lg `}>
                      <ul className="py-1">
                        <li
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b"
                          onClick={handlePaymentClick}
                        >
                          Płatność
                        </li>
                        <li
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b"
                          onClick={handleNoteClick}
                        >
                          Notatka
                        </li>
                        <li
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer "
                          onClick={handleEditClick}
                        >
                          Edytuj uczestnika
                        </li>
                      </ul>
                    </div>
                    )}
                  </td> 
              </tr>
              ))}
            </tbody>
          </table>
          <Modal open={openPay} onClose={() => setOpenPay(false)}>
            <div className="text-center w-56"> 
             
              
              <form 
               className=' w-full max-w-2xl flex flex-col gap-5 '
               onSubmit={handleSubmitPay}
              >
                 <FontAwesomeIcon className="text-4xl mb-4 " icon=  {faHandHoldingDollar} />
                <label>
                  <span className='font-satoshi font-semibold text-base text-gray-700'>
                    Wpłacona kwota
                  </span>
                  <input
                    type='number'
                    placeholder='0'
                    required
                    className='form_input border text-center shadow-md'
                    id="amount"
                    name="amount"
                    value={amount}
                    onChange={handleAmountChange}
                    />
                </label>
                <label>
                  <span className='font-satoshi font-semibold text-base text-gray-700'>
                    Miesiąc
                  </span>
                  <DatePicker
                    selected={selectedMonth}
                    onChange={(e) => handleMonthChange(e)}
                    /*onChange={(date) => setSelectedMonth(date)}*/
                    dateFormat="MM/yyyy"
                    showMonthYearPicker
                  // Maksymalna data to miesiąc z roku wcześniej
                    id="monthPicker"
                    name="monthPicker"
                    locale={pl}
                    className="form_input border text-center shadow-md"
                  />
                </label>
                <label>
                  <span className='font-satoshi font-semibold text-base text-gray-700'>
                    Notatka
                  </span>
                  <textarea
                   id="payNote"
                   name="payNote"
                   value={payNote}
                   onChange={handlePayNoteChange}
                   className="form_textarea border shadow-md"
                    />
                </label>
                <div className="flex gap-4 mt-5">
                  <button 
                  onClick={() => setOpenPay(false)}
                  className="btn btn-light w-full"
                  >
                    Anuluj
                  </button>
                  <button 
                  className="btn btn-green w-full"
                  type="submit"
                  >
                    Zapisz
                  </button>
                </div>
           
              </form>
              </div>
          </Modal>
          <Modal open={openNote} onClose={() => setOpenNote(false)}>
            <div className="text-center w-56"> 
              <form 
               className='mt-5 w-full max-w-2xl flex flex-col gap-6'
               onSubmit={handleSubmitNote}
              >
                <FontAwesomeIcon className="text-4xl" icon=  {faNoteSticky} />
               <label>
                  <span className='font-satoshi font-semibold text-base text-gray-700 '>
                    Notatka
                  </span>
                  <textarea
                   id="note"
                   name="note"
                   value={note}
                   onChange={handleNoteChange}
                   className="form_textarea2 border"
                    />
                </label>
                <div className="flex gap-4 mt-5">
                  <button 
                  onClick={() => setOpenNote(false)}
                  className="btn btn-light w-full"
                  >
                    Anuluj
                  </button>
                  <button 
                  className="btn btn-green w-full"
                  type="submit"
                  >
                    Zapisz
                  </button>
                </div>
           
              </form>
            </div>
          </Modal>
          <Modal open={openEdit} onClose={() => setOpenEdit(false)}>
            {selectedParticipant !== null && (<>
            <FontAwesomeIcon icon={faTrashCan} className="text-2xl aboslute top-2 left-2" style={{color:"ef4444"}} onClick={handleDelete}/>
            <div className="text-center w-56"> 
            <form className='mt-5 w-full max-w-2xl flex flex-col gap-6'
               onSubmit={handleSubmitEdit}>
              <FontAwesomeIcon className="text-4xl" icon=  {faPenToSquare} />
             
              <label>
              <span className='font-satoshi font-semibold text-base text-gray-700 '>
                    Imię
                  </span>
                  <input
                   id="name"
                   name="name"
                   value={editedParticipant.name}
                   onChange={handleNameChange}
                   className="form_input border"
                   placeholder='Podaj Imię'
                    />
              </label>
              <label>
              <span className='font-satoshi font-semibold text-base text-gray-700 '>
                    Nazwisko
                  </span>
                  <input
                   id="surname"
                   name="surname"
                   value={editedParticipant.surname}
                   onChange={handleSurnameChange}
                   className="form_input border"
                   placeholder='Podaj Nazwisko'
                    />
              </label>
              <label>
              <span className='font-satoshi font-semibold text-base text-gray-700 '>
                    Telefon
                  </span>
                  <input
                   id="tel"
                   name="tel"
                   value={editedParticipant.tel}
                   onChange={handleTelChange}
                   className="form_input border"
                   placeholder='Podaj numer telefonu'
                    />
              </label>
              <div className="flex gap-4">
                <button 
                 onClick={() => setOpenEdit(false)}
                 className="btn btn-light w-full"
                >
                  Anuluj
                </button>
                <button 
                 className="btn btn-green w-full"
                 type="submit"
                >
                  Zapisz
                </button>
              </div>
              </form>
            </div></>)}
            
          </Modal>
      </>
    );
};

export default ParticipantList;