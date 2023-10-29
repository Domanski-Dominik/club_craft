import { useEffect, useState } from 'react'


const SheetData = () => {
    const [participants,setParticipants] = useState([]);
    let apiEndpoint = 'https://sheetdb.io/api/v1/gx10vn6g7g0et?sheet=Wrzesien';
    
    useEffect(()=>{
      readSheet(apiEndpoint);
    }, [apiEndpoint]);

    const readSheet = async (url) => {
      // Wywołaj tutaj kod pobierający dane z API, np. za pomocą fetch lub axios
      // Przykład z użyciem fetch:
      try {
        const response = await fetch(url);
        const dataFromApi = await response.json();
        setParticipants(dataFromApi);
        console.log(dataFromApi)
      } catch (error) {
        console.error('Błąd podczas pobierania danych z API:', error);
      }
    };
    const onDeleteParticipant = async (id) => {
      try {
        // Wywołaj API SheetDB do usunięcia uczestnika o danym id
        const response = await fetch(`https://sheetdb.io/api/v1/legjk53jemrj5/id/${id}?sheet=List1`, {
          method: 'DELETE',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
        });
  
        if (response.ok) {
          // Usunięcie się powiodło, zaktualizuj stan participants
          const updatedParticipants = participants.filter((participant) => participant.id !== id);
          setParticipants(updatedParticipants);
        } else {
          console.error('Błąd podczas usuwania uczestnika z API');
        }
      } catch (error) {
        console.error('Błąd podczas komunikacji z API:', error);
      }
    };
    const createSheet = async () => {

    };
}

export default SheetData