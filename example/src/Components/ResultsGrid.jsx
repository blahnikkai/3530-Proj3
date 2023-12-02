/* eslint-disable react/prop-types */

export default function ResultsGrid({heldKarpDist, heldKarpTime, nearestNeighborDist, nearestNeighborTime, userDist, userPathComplete, userPathStarted}) {
  return (
    <div>
      <div className='resultsGrid'>
        {heldKarpDist ? 
        <div className='resultsTab'>
          <div style={{color: '#ADFF2F'}}>{heldKarpDist} km</div>
          <div style={{color: '#ADFF2F'}}>{heldKarpTime} ms</div>
        </div>
        : <div className='resultsTab' style={{color: '#ADFF2F'}}>{"<Held-Karp>"}</div>
        }
        {nearestNeighborDist ? 
        <div className='resultsTab'>
          <div style={{color: '#FF4500'}}>{nearestNeighborDist} km</div>
          <div style={{color: '#FF4500'}}>{nearestNeighborTime} ms</div>
        </div>
        : <div className='resultsTab' style={{color: '#FF4500'}}>{"<Nearest Neighbor>"}</div>
        }
        {userPathStarted ? 
        <div className='resultsTab'>
          <div style={userPathComplete ? {color: '#87CEEB'} : {color: '#838383'}}>{userDist} km</div>
          <div style={{color: '#87CEEB'}}>Slowest</div>
        </div>
        : <div className='resultsTab' style={{color: '#87CEEB'}}>{"<User Path>"}</div>
        }
      </div>
      <div className='another-arrow-up'></div>
    </div>
  )
}