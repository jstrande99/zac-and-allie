import React, { useEffect } from "react";
import './Name.css'
export default function Login(props){
    
    useEffect(() => {
        const storedName = localStorage.getItem('name');
        const firstTimeLogIn = localStorage.getItem('firstTimeLogIn');
        if (storedName) {
            props.setName(storedName);
            if(firstTimeLogIn){
                props.setTimer(1500);
            }
            
        }
    }, [props]);

    const HandleFirstName = (event) => {
        props.setFirstName(event.target.value)
    }
    const HandleLastName = (event) => {
        props.setLastName(event.target.value)

    }
    function HandleSubmit(){
        if(props.firstName && props.lastName){
            const firstName = props.firstName.charAt(0).toUpperCase() + props.firstName.slice(1);
            const lastName = props.lastName.charAt(0).toUpperCase() + props.lastName.slice(1);
            localStorage.setItem('name', firstName + " " + lastName);
            props.setTimer(3700);
            localStorage.setItem('firstTimeLogIn', true);
            props.setName(firstName + " " + lastName);
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
                <h2 className="est">EST. 2023</h2>
                <p className="about">Sign in to post about the happy couple!</p>
                <div className="form-group">
                    <input 
                        type="text" 
                        className="form-control" 
                        onChange={HandleFirstName} onKeyDown={(event) => {
                            if (event.key === " ") {
                                event.preventDefault(); 
                                document.querySelector("#lastName").focus();
                            }
                        }} 
                        placeholder="First Name" 
                        required
                    />
                </div>
                <div className="form-group">
                    <input 
                        type="text" 
                        id="lastName" 
                        className="form-control" 
                        onChange={HandleLastName} 
                        placeholder="Last Name" 
                        required 
                        onKeyDown={(event) => {
                            if (event.key === " ") {
                                event.preventDefault(); 
                                document.querySelector("#lastName").focus();
                            }
                        }} 
                        onKeyUp={(event) => {
                            if (event.key === "Enter") { 
                                HandleSubmit(); 
                            }
                        }}
                    />
                </div>
            </form>
            <button 
                type="submit" 
                className="btn" 
                onClick={HandleSubmit} 
            >
                Sign In
            </button>
        </div>
    );
};