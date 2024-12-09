// Function to format createdAt
const formatCreatedAt = (createdAt) =>{
  const now = new Date();
  const diffMs = now - new Date(createdAt); // Difference in milliseconds
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHrs = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHrs / 24);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin} min${diffMin > 1 ? "s" : ""} ago`;
  if (diffHrs < 24) return `${diffHrs} hr${diffHrs > 1 ? "s" : ""} ago`;
  if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  return `${diffMonths} month${diffMonths > 1 ? "s" : ""} ago`;
}

const profileDate = (dateFor) => {
    if(dateFor !== undefined){
        let date = dateFor.split("-");
        let month = "";
        switch (date[1]) {
          case "1":
            month = "January";
            break;
          case "2":
            month = "February";
            break;
          case "3":
            month = "March";
            break;
          case "4":
            month = "April";
            break;
          case "5":
            month = "May";
            break;
          case "6":
            month = "June";
            break;
          case "7":
            month = "July";
            break;
          case "8":
            month = "August";
            break;
          case "9":
            month = "September";
            break;
          case "10":
            month = "October";
            break;
          case "11":
            month = "November";
            break;
          case "12":
            month = "December";
            break;
        }
        return `${month} ${date[0]}`
    }
    

}

export {profileDate,formatCreatedAt}