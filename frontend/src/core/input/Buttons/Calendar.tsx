import React, { useState, useEffect} from 'react';
import { addDays, format } from 'date-fns';
import { DateRange, DayPicker, Matcher } from 'react-day-picker';
import 'react-day-picker/dist/style.css'

const pastMonth = new Date(2024, 5, 6);

const functionMatcher: Matcher = (day : Date) => {
    return day.getMonth() === 4 ;
   };


/**
 * defining variables for dynamic date display
 */
type CalendarProbs = {
  fromDate : Date | null;
  tillDate : Date | null;
  setStartDate : (date: Date | null) => void;
  setEndDate : (date: Date | null) => void;
}
/**
 * 
 * @param probs to display dynamic date for the cart
 * @returns calendar where you can set a range of 2 dates that will be needed to know how long the object will be loaned
 */
export default function Calendar(probs: CalendarProbs) {

    
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

  /**
   * changes the startDate/EndDate if the range is changed
   */
  useEffect(() => {
    probs.setStartDate(range?.from || null);
    probs.setEndDate(range?.to || null);
  }, [range]);


  // display the range the user picked in the calendar object
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