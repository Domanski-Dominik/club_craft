'use client'

import { faArrowLeftLong } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function GoBack() {
  // Funkcja do obsługi przycisku wstecz
  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <button onClick={handleGoBack} className="absolute top-20 left-5 border-2 rounded-full border-black text-xl px-3">
    <FontAwesomeIcon icon={faArrowLeftLong} />
    </button>
  );
}

export default GoBack;