function Cards(props){
    

    return(
        <div className="card">
            <div className="card-name">{props.cardName}</div>
            <div className="card-val">{props.cardVal}</div>
        </div>
    )
}

export default Cards