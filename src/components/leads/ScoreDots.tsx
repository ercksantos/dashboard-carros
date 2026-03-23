interface ScoreDotsProps {
    score: number | null;
    max?: number;
}

export function ScoreDots({ score, max = 5 }: ScoreDotsProps) {
    const filled = Math.min(Math.max(score ?? 0, 0), max);
    return (
        <div className="flex items-center gap-1">
            {Array.from({ length: max }).map((_, i) => (
                <span
                    key={i}
                    className="inline-block w-2.5 h-2.5 rounded-full"
                    style={{
                        background: i < filled ? '#1a7aff' : 'rgba(255,255,255,0.1)',
                    }}
                />
            ))}
        </div>
    );
}
