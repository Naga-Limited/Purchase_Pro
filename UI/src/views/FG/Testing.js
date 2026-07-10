import React, { useState } from 'react';
import { useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import { getAllowedPastDate } from '../common/dateComponent';

function Testing() {

    console.log(getAllowedPastDate(45));
    

    return (
        <div>
            <input type='date'  min={new Date().toISOString().split('T')[0]}/>
        </div>
    );
}

export default Testing;