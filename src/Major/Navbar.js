import React from "react";
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from "react-router-dom";
import { Logout } from "./Logout";
library.add(fas);

export default function Navbar(props){
    return (
        <div className="userbar">
			<Link to='/Camera' className="nav-links">
				<button className="submit gal">
					<FontAwesomeIcon icon={['fa-solid','fa-camera']} fontSize="1.5em"/>
				</button>
			</Link>
			<Link to='/' className="nav-links">
				<button className="submit gal">
					<FontAwesomeIcon icon={['fas','fa-house']} fontSize="1.5em"/>
				</button>
			</Link>
			<button className="logout" onClick={() => Logout({...props})}>
					<FontAwesomeIcon icon={['fas','fa-right-from-bracket']} fontSize="1.5em" />
			</button>
		</div>
    )
}