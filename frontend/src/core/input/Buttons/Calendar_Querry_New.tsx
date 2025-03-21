import React, { useState,useEffect,useRef } from 'react';
import {useQuery, gql } from '@apollo/client';
import 'react-day-picker/dist/style.css'
import { DateRange, DayPicker } from 'react-day-picker';
import { addDays, format, startOfToday } from 'date-fns';

interface Dates {
  fromDate: string;
  tillDate: string;
  physicalobjects?: {
    edges: {
      node: {
        orderStatus: string;
        physId: string;
        physicalobject: {
          invNumInternal: string;
          invNumExternal: string;
          deposit: string;
          storageLocation: string;
          name: string;
          description: string;
        };
      };
    }[];
  };
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

const GET_DATES = gql(`
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

  var noObjets = false;
    if (!probs.physicalobjects || probs.physicalobjects.length === 0) {
      var noObjets = true;
    }
    

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
    }, [range]);

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

  const today = startOfToday(); 

  const pendingDates = data?.filterOrders
    .filter(order =>
      order.physicalobjects!.edges[0]!.node.orderStatus === 'PENDING'
    )
    .map(order => ({
      from: new Date(order.fromDate),
      to: new Date(order.tillDate),
    })) || [];


  const disabledDates = [
    { from: new Date(0), to: addDays(today, -1) },
    ...(data?.filterOrders
      .filter(order => {
        const orderFrom = new Date(order.fromDate);
        const orderTill = new Date(order.tillDate);
        
        // Wenn das ausgewählte Datum das aktuelle Datum ist, nicht deaktivieren
        if (originalFromDate.current && originalTillDate.current) {
          
          const isCurrentRange = (orderFrom.getTime() === new Date(originalFromDate.current).getTime() && (orderTill.getTime() === new Date(originalTillDate.current).getTime()));

          // Wenn es die aktuelle Range ist, soll es nicht disabled sein
          if (isCurrentRange) {
              return false; 
          }

          return !((orderFrom.getTime() <= new Date(originalTillDate.current).getTime()) && (orderTill.getTime() >= new Date(originalFromDate.current).getTime()));
        }
        return true; 
      })
      .map(order => ({
        from: new Date(order.fromDate),
        to: new Date(order.tillDate),
      })) || []),
  ];

  const filteredDisabledDates = disabledDates.filter(
    (disabledDate) =>
      !pendingDates.some(
        (pendingDate) =>
          pendingDate.from.getTime() === disabledDate.from.getTime() &&
          pendingDate.to.getTime() === disabledDate.to.getTime()
      )
  );


  let additionalDisabledDates: { from: Date; to: Date; }[] = [];


  /**
   * disables all the dates before the selected date and until the first order is reached in the calendar
   */

  
  if (range && (range.from !==null)) {
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




  const combinedDisabledDates = [...filteredDisabledDates, ...additionalDisabledDates];


  if (!noObjets) {
    return (
      <>
        <style>{css}</style>
        <DayPicker
          styles={{
            button: { borderRadius: 20 },
          }}
          id="test"
          mode="range"
          selected={range}
          footer={footer}
          onSelect={setRange}
          disabled={combinedDisabledDates}
          modifiers={{
            highlighted: pendingDates,
          }}
          modifiersStyles={{
            highlighted: { backgroundColor: 'rgba(255, 255, 0, 0.5)', color: 'black' },
            disabled: { fontSize: '75%' },
          }}
          modifiersClassNames={{
            selected: 'my-selected',
            today: 'my-today',
          }}
        />
      </>
    );
  }

  return <p>Error: No physical objects provided. Please select an object to add to the order.</p>;
}

const css = `

.my-selected:not([disabled]) { 
  font-weight: bold; 
  border: 2px solid black;
  color: black;
  background-color: darkcyan;
}
.my-selected:hover:not([disabled]) { 
  border-color: black;
  color: darkcyan;
  background-color: white;
}
.my-today { 
  font-weight: bold;
  font-size: 140%; 
  color: orange;
}

`;