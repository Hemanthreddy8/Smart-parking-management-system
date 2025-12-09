import { Link } from "react-router-dom"

function QuickAccessBtns(props){
    
    return (
        <Link to={props.link} className="quick-access-links">
        <div className="quick-access-item">
            <div className="quick-access-icon">{props.icon}</div>
            <div className="quick-access-Name">{props.desc}</div>
        </div>
        </Link>

    )

}

export default QuickAccessBtns