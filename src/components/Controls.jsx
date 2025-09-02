/**
 * Controls Component
 * Bottom control bar with play/pause and mute buttons
 * @param {boolean} isPlaying - Current playback state
 * @param {function} togglePlay - Function to toggle play/pause
 * @param {boolean} isMuted - Current mute state
 * @param {function} toggleMute - Function to toggle mute
 */
const Controls = ({ isPlaying, togglePlay, isMuted, toggleMute }) => {
  return (
    <div className="controls-frame"
         style={{
           display: 'flex',
           flexDirection: 'row',
           justifyContent: 'space-around',
           alignItems: 'center',
           height: '80px',
           width: '240px',
           position: 'relative',
           boxShadow: 'var(--nm-shadow-raised)',
           borderRadius: '10px',
           background: 'var(--nm-bg-primary)',
           transition: 'box-shadow 0.6s cubic-bezier(.79,.21,.06,.81)'
         }}>
      
      <button 
        onClick={() => {}}
        className="btn h-[50px] w-[50px] rounded bg-[var(--nm-bg-primary)] flex flex-col justify-center items-center nm-shadow-raised transition-all duration-[600ms] text-[26px] text-[var(--nm-text-primary)] no-underline cursor-pointer border-none"
        style={{
          transitionTimingFunction: 'cubic-bezier(.79,.21,.06,.81)'
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.boxShadow = 'var(--nm-shadow-pressed)'
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.boxShadow = 'var(--nm-shadow-raised)'
        }}
      >
        <i className="fas fa-backward"></i>
      </button>
      
      <button 
        onClick={toggleMute}
        disabled={!isPlaying}
        className={`btn h-[50px] w-[50px] rounded bg-[var(--nm-bg-primary)] flex flex-col justify-center items-center nm-shadow-raised transition-all duration-[600ms] text-[26px] no-underline border-none ${
          !isPlaying ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        } ${isMuted ? 'text-red-500' : 'text-[var(--nm-text-primary)]'}`}
        style={{
          transitionTimingFunction: 'cubic-bezier(.79,.21,.06,.81)'
        }}
        onMouseDown={(e) => {
          if (isPlaying) {
            e.currentTarget.style.boxShadow = 'var(--nm-shadow-pressed)'
          }
        }}
        onMouseUp={(e) => {
          if (isPlaying) {
            e.currentTarget.style.boxShadow = 'var(--nm-shadow-raised)'
          }
        }}
      >
        <i className={`fas ${isMuted ? 'fa-volume-mute' : 'fa-volume-up'}`}></i>
      </button>
      
      <button 
        onClick={() => {}}
        className="btn h-[50px] w-[50px] rounded bg-[var(--nm-bg-primary)] flex flex-col justify-center items-center nm-shadow-raised transition-all duration-[600ms] text-[26px] text-[var(--nm-text-primary)] no-underline cursor-pointer border-none"
        style={{
          transitionTimingFunction: 'cubic-bezier(.79,.21,.06,.81)'
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.boxShadow = 'var(--nm-shadow-pressed)'
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.boxShadow = 'var(--nm-shadow-raised)'
        }}
      >
        <i className="fas fa-forward"></i>
      </button>
    </div>
  )
}

export default Controls