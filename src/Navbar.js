import React from "react";
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from "react-router-dom";

library.add(fas);

export default function Navbar(){
    return (
        <div className="userbar">
			<Link to='/Schedule' className="nav-links">
				<button className="submit gal">
					<FontAwesomeIcon icon={['fas','fa-calendar-alt']} fontSize="1.5em"/>
				</button>
			</Link>
			<Link to='/' className="nav-links">
				<button className="submit gal">
					<FontAwesomeIcon icon={['fas','fa-house']} fontSize="1.5em"/>
				</button>
			</Link>
		</div>
    )
}