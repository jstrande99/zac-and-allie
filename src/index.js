import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

if (Notification.permission === 'granted') {
            console.log('in')
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then((permission) => {
                if (permission === 'granted') {
                    console.log('in too')
                }
            });
        }
  
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
	<React.StrictMode>
		<App />
	</React.StrictMode>
);
