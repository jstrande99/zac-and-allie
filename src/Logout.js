export function Logout(props){
    localStorage.removeItem('name');
	localStorage.removeItem('firstTimeLogIn');
    props.setFirstName("");
    props.setLastName("");
    props.setName(null);
}