import React from "react";
import './Name.css'
export default function Login(props){
    
    const HandleFirstName = (event) => {
        props.setFirstName(event.target.value)
    }
    const HandleLastName = (event) => {
        props.setLastName(event.target.value)

    }
    function HandleSubmit(){
        if(props.firstName && props.lastName){
            props.setName(props.firstName + " " + props.lastName);
        }else{
            alert("Please Fill Out Name Fields");
            return;
        }
    }
    return (
        <div className="login body">
            <form className="inputs">
                <h1>The</h1>
                <h1 className="last">Strandes</h1>
                <div className="form-group">
                    <input type="text" className="form-control" onChange={HandleFirstName} placeholder="First Name" required/>
                </div>
                <div className="form-group">
                    <input type="text" className="form-control" onChange={HandleLastName} placeholder="Last Name" required/>
                </div>
            </form>
            <button type="submit" className="btn" onClick={HandleSubmit} >Share the Love</button>
            <h2 className="est">EST. 2023</h2>
            <p className="about">Sign in to post about the happy couple!</p>
        </div>
    );
};