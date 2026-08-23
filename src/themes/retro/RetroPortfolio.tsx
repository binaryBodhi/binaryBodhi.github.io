import type { PortfolioData } from "../../data/types";

interface RetroPortfolioProps {
    data: PortfolioData
}

export function RetroPortfolio({ data }: RetroPortfolioProps){
    return (
        <div>
            <h1>{data.profile.name}</h1>
        </div>
    )
}