import type { PortfolioData } from "../../data/types";

interface ModernPortfolioProps {
    data: PortfolioData
}

export function ModernPortfolio({ data }: ModernPortfolioProps){
    return (
        <div>
            <h1>{data.profile.name}</h1>
        </div>
    )
}