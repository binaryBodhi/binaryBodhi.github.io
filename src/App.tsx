import { useState } from "react"
import { ModernPortfolio } from "./themes/modern/ModernPortfolio"
import { RetroPortfolio } from "./themes/retro/RetroPortfolio"
import { portfolioData } from "./data/data"

function App() {
  const [theme, setTheme] = useState< 'retro' | 'modern' >('modern')

  return(
    <div>
      <button
        type="button"
        onClick={() => {
          setTheme((currentTheme) =>
            currentTheme === 'modern' ? 'retro' : 'modern',
          )
        }}
      >
        Switch to {theme === 'modern' ? 'retro' : 'modern'} theme
      </button>

      {theme === 'modern' ? (
        <ModernPortfolio data={portfolioData} />
      ):(
        <RetroPortfolio data={portfolioData} />
      )}
    </div>
  )
}

export default App