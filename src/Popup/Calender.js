import '../Schedule.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from "react";

const Calendar = ({seeCalender, setSeeCalender}) => {
    const [ceremonyIsOpen, setCeremonyIsOpen] = useState(false);
    const [welcomeIsOpen, setWelcomeIsOpen] = useState(false);
    const [receptionIsOpen, setReceptionIsOpen] = useState(false); 
    // useEffect(() => {
    //     props.setTimer(500);
    // }, [props]);
    return (
        <div className='calenderContainer'> 
            <h2 className='schedule-ttl ttl-sched'>The Tentative Schedule</h2>
            <button 
				onClick={()=> setSeeCalender(!seeCalender)}
				className="shareExitCalender"
			>
				<FontAwesomeIcon 
					icon="fa-solid fa-xmark" 
					fontSize="2.5em" 
				/>
			</button>
            <div className="event" onClick={()=> {setWelcomeIsOpen(!welcomeIsOpen); setCeremonyIsOpen(false); setReceptionIsOpen(false);}}>
                <h3 className='date'>Aug 17</h3>
                <h2>Welcome Event</h2>
                {receptionIsOpen || ceremonyIsOpen ? <div></div> : <div> <p>5:30 pm - 9:30 pm</p>
                <p><u>More info</u></p> </div>}
                {welcomeIsOpen && 
                    (<>
                        <p className='discription'>
                            Casual<br/><br/>
                            We are kicking off the special weekend with an open house welcome party hosted by Bill and Charlotte Strande at their home in Evergreen, CO! Join the bride and groom for a drink or two and some good food with great mountain scenery!
                        </p>
                        <h3 
                            className="maps" 
                            onClick={() => window.open('https://www.google.com/maps/place/Evergreen,+CO+80439/@39.6362587,-105.3638755,13z/data=!3m1!4b1!4m6!3m5!1s0x876b7531b132cca1:0x83b795e5a2896558!8m2!3d39.6333213!4d-105.3172146!16zL20vMHJiZGM')}
                        >
                            See Map
                        </h3>
                    </>)
                }
            </div>
            <div className="event" onClick={()=> {setCeremonyIsOpen(!ceremonyIsOpen); setReceptionIsOpen(false); setWelcomeIsOpen(false);}}>
                <h3 className='date'>Aug 19</h3>
                <h2>Ceremony</h2>
                {receptionIsOpen || welcomeIsOpen ? <div></div> : <div><p>5:00 pm - 5:30 pm</p>
                <p><u>More info</u></p></div>}
                {ceremonyIsOpen &&  
                    (<>
                        <p className='discription'>
                            We would like to invite you to sport your best semi-formal Cocktail attire for the night; Wear cocktail dresses, dressy jumpsuits, and/or suits, dark jackets and slacks. No jeans or sneakers please. Please keep in mind our ceremony will take place in a large groomed grassy area when considering shoes!<br/><br/>
                            We ask that you plan to arrive between 4:30-4:50 pm. Cocktail hour, dinner, open bar, AND a night full of dancing to follow the ceremony!
                        </p>
                        <h3 
                            className="maps" 
                            onClick={() => window.open('https://www.google.com/maps/search/?api=1&query=39.21090310,-104.92169950&query_place_id=ChIJ2VAges-lbIcRdtsgIs_Wyf4')}
                        >
                            See Map
                        </h3>
                    </>)
                }
            </div>
            <div className="event" onClick={()=> {setReceptionIsOpen(!receptionIsOpen); setWelcomeIsOpen(false); setCeremonyIsOpen(false);}}>
                <h3 className='date'>Aug 19</h3>
                <h2>Reception</h2>
                {welcomeIsOpen || ceremonyIsOpen ? <div></div> : <div><p>5:30 pm - 10:45 pm</p>
                <p><u>More info</u></p></div>}
                {receptionIsOpen &&
                    (<>
                        <p className='discription'>
                            Semi-formal/Cocktail attire requested<br/><br/>
                            Cocktail hour, dinner, did we mention the open bar? And a night full of dancing following the ceremony!
                        </p>
                        <h3 
                            className="maps" 
                            onClick={() => window.open('https://www.google.com/maps/search/?api=1&query=39.21090310,-104.92169950&query_place_id=ChIJ2VAges-lbIcRdtsgIs_Wyf4')}
                        >
                            See Map
                        </h3>
                    </>)
                }
            </div>
        </div>
    )
}
export default Calendar;