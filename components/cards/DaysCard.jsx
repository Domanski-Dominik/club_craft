'use client'


const DaysCard = ({ gr, handleClick, handleEdit, handleDelete}) => {
  const handleDayClick = () => {
    handleClick(gr._id) //Przekazuje ID klikniętej karty do funkcji handleClick
  };
  return(
    <>
      {gr.groups.length > 0 && (
          <div className="day_card cursor-pointer" onClick={handleDayClick}>
          
              <h1 className="font-satoshi font-semibold text-2xl text-gray-900 text-center">
              {gr.day}
              </h1>
        </div>
      )}

      
      
  </>
  );
}

export default DaysCard;