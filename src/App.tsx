import { useState } from "react"
import { ModernPortfolio } from "./themes/modern/ModernPortfolio"
import { RetroPortfolio } from "./themes/retro/RetroPortfolio"
import { portfolioData } from "./data/data"

function App() {
  const [theme, setTheme] = useState<'retro' | 'modern'>('retro')

  return (
    <div className="app">
      {theme === 'modern' ? (
        <ModernPortfolio
          data={portfolioData}
          onSwitchTheme={() => setTheme('retro')}
        />
      ) : (
        <RetroPortfolio data={portfolioData} onSwitchTheme={() => setTheme('modern')} />
      )}
    </div>
  )
}

export default App
