import React, { useState } from 'react';
import { addDays, format } from 'date-fns';
import { DateRange, DayPicker, Matcher } from 'react-day-picker';
import 'react-day-picker/dist/style.css'

const pastMonth = new Date(2024, 5, 6);

const functionMatcher: Matcher = (day : Date) => {
    return day.getMonth() === 4 ;
   };


export default function Calendar() {

    
    const css = `

    .my-selected:not([disabled]) { 
      font-weight: bold; 
      border: 2px solid black;
      color: black;
      background-color: magenta;
    }
    .my-selected:hover:not([disabled]) { 
      border-color: purple;
      color: magenta;
      background-color: white;
    }
    .my-today { 
      font-weight: bold;
      font-size: 140%; 
      color: orange;
    }

  `;

 const defaultSelected: DateRange = {
    from: pastMonth,
    to: addDays(pastMonth, 4)
  };

  const [range, setRange] = useState<DateRange | undefined>(defaultSelected);
  let footer = <p>Please pick the first day.</p>;
  if (range?.from) {
    if (!range.to) {
      footer = <p>{format(range.from, 'PPP')}</p>;
    } else if (range.to) {
      footer = (
        <p>
          {format(range.from, 'PPP')}–{format(range.to, 'PPP')}
        </p>
      );
    }
  }



  return (
    <>
    <style>{css}</style>
    <DayPicker
      styles={{
        button : { borderRadius: 20},
        
      }}
      id="test"
      mode="range"
      defaultMonth={pastMonth}
      selected={range}
      footer={footer}
      onSelect={setRange}
      disabled={functionMatcher}
      modifiersStyles={{
        disabled: { fontSize: '75%' }
      }}
      modifiersClassNames={{
        selected: 'my-selected',
        today: 'my-today'
      }}
    />
    </>
  );
}





// This class defines the calendar component that will be used for adding objects to the cart and later submit changes on the dates from loans