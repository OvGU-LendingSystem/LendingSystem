export const handleClick = () => {
    console.log("Hey");
  }

export const addToCart = () => {
    // add the object to cart, select date --> where to safe the current data?
}

export const search = () => {
    // take from search bar and send a SQL request
}

export const information = () => {
    // pop up window with information of the product
}

export const editCartObject = () => {
    // pop up with change amount, change date and delete option
}

export const sendLoanRequest = () => {
    // send a loan request (submit) with information from text fields
}

export const loanHistory = () => {
    // open pop-up with loan history in a table
}

export const editObject = () => {
    // edit the given Object with same attributes as adding the objects
}

export const editRequest = () => {
    // edit the loan request that was send
}

export const editRequestObject = () => {
    // edit the Object from the current Request (change date, delete, change amount etc.)
}

export const removeObjectFromCart = () => {
    // delete the Object from the Cart/Request
}
 
export const removeObject = () => {
    // remove the Object from the Database
}

export const NextMonth = () => {
    // get the Next Month in the Calender Tab
}

export const SubmitNewItem = (name : string, id : string, owner: string, deposit : number, description : string, defects : string, partOfSet : boolean) => {
    // adds the Item into the database
}

export const timePeriod = () => {
    // selects 2 dates from a calender pop-up and then can be used from the search() function
}