import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import './css/timeline.css';
import './css/reset.css';
import './css/login.css';

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
