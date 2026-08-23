import { useState } from "react"
import { ModernPortfolio } from "./themes/modern/ModernPortfolio"
import { RetroPortfolio } from "./themes/retro/RetroPortfolio"
import { portfolioData } from "./data/data"

function App() {
  const [theme, setTheme] = useState< 'retro' | 'modern' >('retro')

  return(
    <div>
      {theme === 'modern' ? (
        <>
          <button type="button" onClick={() => setTheme('retro')}>
            Switch to retro theme
          </button>
          <ModernPortfolio data={portfolioData} />
        </>
      ):(
        <RetroPortfolio data={portfolioData} onSwitchTheme={() => setTheme('modern')} />
      )}
    </div>
  )
}

export default App
