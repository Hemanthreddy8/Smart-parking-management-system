import React from "react";




function AlertCards({ alertTitle, alertId, alertTime, alertMessage, className }) {

    return(

        <div className="work-log">
            <div className="work-log-name-id-cont">
                <h3 className="alert-title">{alertTitle}</h3>
                <p className="alert-id">{alertId}</p>

                <p>{alertMessage}</p>

        
                </div>
            <div className="work-log-time">{alertTime}</div>
        </div>

    )
}

export default AlertCards;
