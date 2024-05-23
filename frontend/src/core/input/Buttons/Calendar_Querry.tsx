import React, { useState } from 'react';
import { ApolloClient, InMemoryCache, ApolloProvider, useQuery, gql } from '@apollo/client';
import 'react-day-picker/dist/style.css'
import { DateRange, DayPicker, Matcher } from 'react-day-picker';
import { addDays, format } from 'date-fns';

interface Dates {
  fromDate: string;
  tillDate: string;
}

interface DateArray {
  filterOrders: Dates[];
}


const client = new ApolloClient({
    uri: 'http://hades.fritz.box/api/graphql',
    cache: new InMemoryCache(),
  });

const GET_DATES = gql(/* GraphQL */ `
query {
    filterOrders {
      fromDate
      tillDate
    }
  }
`); 

export default function Calendar_Querry() {
    const { loading, error, data } = useQuery<DateArray>(GET_DATES, {client}); 
    
    const pastMonth = new Date(2024, 5, 6);
    
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

  const disabledDates = data?.filterOrders.map(order => ({
    from: new Date(order.fromDate),
    to: new Date(order.tillDate)
  })) || [];

    return(
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
      disabled={disabledDates}
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