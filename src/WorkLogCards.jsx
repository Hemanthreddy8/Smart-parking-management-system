
function WorkLogCards(props){

    return(

        <div className="work-log">
            <div className="work-log-name-id-cont">
                <p className="work-log-name">{props.logname}</p>
                <p className="work-log-id">{props.logid}</p>
                {/* <br></br> */}

                <p>{props.logdesc}</p>

        
                </div>
            <div className="work-log-time">{props.logtime}</div>
        </div>

    )
}

export default WorkLogCards