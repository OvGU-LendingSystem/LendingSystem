import React, { useState,useEffect,useRef } from 'react';
import { ApolloClient, InMemoryCache, ApolloProvider, useQuery, gql } from '@apollo/client';
import 'react-day-picker/dist/style.css'
import { DateRange, DayPicker, Matcher } from 'react-day-picker';
import { addDays, format, startOfToday } from 'date-fns';

interface Dates {
  fromDate: string;
  tillDate: string;
}

interface DateArray {
  filterOrders: Dates[];
}

type CalendarProbs = {
  fromDate : Date | null;
  tillDate : Date | null;
  setStartDate : (date: Date | null) => void;
  setEndDate : (date: Date | null) => void;
  physicalobjects : string[];
}

const GET_DATES = gql(/* GraphQL */ `
query {
    filterOrders {
      fromDate
      tillDate
    }
  }
`); 

const GET_DATES_ORDEROBJECT = gql(`
  query FilterOrdersById($physicalobjects: [String]!) {
    filterOrders(physicalobjects: $physicalobjects) {
      orderId
      fromDate
      tillDate
      physicalobjects {
        edges {
          node {
            orderStatus
            physId
            physicalobject {
              invNumInternal
              invNumExternal
              deposit
              storageLocation
              name
              description
            }
          }
        }
      }
      users {
        edges {
          node {
            email
            firstName
            lastName
            id
          }
        }
      }
    }
  }
`);


/**
 * 
 * @param probs to display dynamic date for the cart
 * @returns calendar where you can set a range of 2 dates that will be needed to know how long the object will be loaned
 */
export default function Calendar_Querry(probs: CalendarProbs) {
    const { loading, error, data, refetch } = useQuery<DateArray>(GET_DATES_ORDEROBJECT, {
      variables: {physicalobjects: probs.physicalobjects},
    }); 

    const defaultSelected: DateRange = {
      from: probs.fromDate!,
      to: probs.tillDate!
      };


    const [range, setRange] = useState<DateRange | undefined>(defaultSelected);
    refetch();

    useEffect(() => {
      probs.setStartDate(range?.from || null);
      probs.setEndDate(range?.to || null);
      console.log("Change range: " +probs.fromDate);
    }, [range]);

    if (range?.from!=undefined){
    console.log('range' + range.from);
    }

    const originalFromDate = useRef<Date | null>(probs.fromDate);
    const originalTillDate = useRef<Date | null>(probs.tillDate);

    useEffect(() => {
      if (!originalFromDate.current && probs.fromDate) {
        originalFromDate.current = probs.fromDate;
      }
      if (!originalTillDate.current && probs.tillDate) {
        originalTillDate.current = probs.tillDate;
      }
    }, [probs.fromDate, probs.tillDate])


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

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error : {error.message}</p>;


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

  const today = startOfToday();

 console.log("Calendar from" + data?.filterOrders[0].fromDate);

  const disabledDates = [
    { from: new Date(0), to: addDays(today, -1) },
    ...(data?.filterOrders
      .filter(order => {
        const orderFrom = new Date(order.fromDate);
        const orderTill = new Date(order.tillDate);

        console.log("orderFrom: " + orderFrom);
        console.log("orderTill:" + orderTill);
        
        // Wenn das ausgewählte Datum das aktuelle Datum ist, nicht deaktivieren
        if (originalFromDate.current && originalTillDate.current) {
          
          const isCurrentRange = (orderFrom.getTime() === new Date(originalFromDate.current).getTime() && (orderTill.getTime() === new Date(originalTillDate.current).getTime()));

          // Wenn es die aktuelle Range ist, soll es nicht disabled sein
          if (isCurrentRange) {
              return false; 
          }

          return !(orderFrom <= originalTillDate.current && orderTill >= originalFromDate.current);
        }
        return true; 
      })
      .map(order => ({
        from: new Date(order.fromDate),
        to: new Date(order.tillDate),
      })) || []),
  ];


  let additionalDisabledDates: { from: Date; to: Date; }[] = [];


  /**
   * disables all the dates before the selected date and until the first order is reached in the calendar
   */

  
  if (range && (range.from !==null)) {
    console.log(range.from);
    const closestDate = data?.filterOrders
    .filter(order => {
      const orderFrom = new Date(order.fromDate);
      const orderTill = new Date(order.tillDate);
      
      // Überprüfen, ob die Bestellung die originale Range ist
      if (originalFromDate.current && originalTillDate.current){
      const isCurrentRange = (
        orderFrom.getTime() === new Date(originalFromDate.current).getTime() &&
        orderTill.getTime() === new Date(originalTillDate.current).getTime()
      );
      return  !isCurrentRange;
    }

      // Wenn es die aktuelle Range ist, ausschließen
      return true;
    })
    .reduce((closest, current) => {
      const from = new Date(current.fromDate);
      if (from < range.from!) {
        return closest
      }
      return (from > range.from! && from < closest) ? from : closest;
    }, new Date(8640000000000000));
    
    

    if(closestDate!=undefined && closestDate){
      additionalDisabledDates = [
        { from: new Date(0), to: addDays(range.from!, -1) },
        { from: addDays(closestDate, 1), to: new Date(8640000000000000) },
      ];
    }
    else{
      additionalDisabledDates = [
        {from: new Date(0), to:addDays(range.from!, -1)}
      ]
    }
  }




  const combinedDisabledDates = [...disabledDates, ...additionalDisabledDates];



    return(
        <>
    <style>{css}</style>
    <DayPicker
      styles={{
        button : { borderRadius: 20},
        
      }}
      id="test"
      mode="range"
      selected={range}
      footer={footer}
      onSelect={setRange}
      disabled={combinedDisabledDates}
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