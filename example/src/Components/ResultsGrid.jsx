export default function ResultsGrid({heldKarpDist, heldKarpTime, nearestNeighborDist, nearestNeighborTime, userDist, userPathComplete}) {
  return (
    <div className='resultsGrid'>
      <div>Algorithm</div>
      <div>Distance (km)</div>
      <div>Time (ms)</div>
      <div style={{color: '#ADFF2F'}}>Held-Karp</div>
      <div>{heldKarpDist}</div>
      <div>{heldKarpTime}</div>
      <div style={{color: '#FF4500'}}>Nearest Neighbor</div>
      <div>{nearestNeighborDist}</div>
      <div>{nearestNeighborTime}</div>        
      <div style={{color: '#87CEEB'}}>Your path</div>
      <div style={userPathComplete ? {color: '#c2c9d6'} : {color: '#838383'}}>
        {userDist}
      </div>
      <div>Slowest</div>
    </div>
  )
}